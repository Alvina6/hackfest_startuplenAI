import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import path from 'node:path';
import type { AnalysisDocument, AuthUser, MentorMessage } from './shared/types.ts';
import {
  hashPassword,
  requireAuth,
  signAuthToken,
  verifyPassword,
  type AuthenticatedRequest,
  type StoredUser,
} from './server/authService.ts';
import {
  generateMentorReply,
  generateStartupAnalysis,
  getConfiguredModelName,
} from './server/geminiService.ts';
import { createAiRateLimiter, errorHandler, validateUuidParam } from './server/middleware.ts';
import { PROMPT_VERSION } from './server/prompts.ts';
import {
  AnalyzeIdeaInputSchema,
  ChatMessageInputSchema,
  LoginInputSchema,
  RegisterInputSchema,
  RenameAnalysisInputSchema,
} from './server/schema.ts';
import {
  appendMentorMessagesForUser,
  createUser,
  deleteAnalysisForUser,
  findUserByEmail,
  findUserById,
  getAnalysisByIdForUser,
  getStorageMode,
  initializeStorage,
  listAnalysesByUser,
  renameAnalysisForUser,
  saveAnalysis,
} from './server/storageService.ts';

function toPublicUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT || 3000);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '64kb' }));

  // Initialize database / storage connection on boot (non-fatal warning if Mongo unreachable until first call)
  initializeStorage().catch((err) => {
    console.warn('Initial storage check warning:', err instanceof Error ? err.message : err);
  });

  // Optional CORS allowlist for external frontend deployments
  const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (allowedOrigins.length > 0) {
    app.use('/api', (req, res, next) => {
      const origin = req.headers.origin;
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      }
      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
      }
      next();
    });
  }

  const authRateLimiter = createAiRateLimiter(20, 5 * 60 * 1000);
  const analysisRateLimiter = createAiRateLimiter(12, 5 * 60 * 1000);
  const chatRateLimiter = createAiRateLimiter(30, 5 * 60 * 1000);

  // Health check
  app.get('/api/health', async (_req, res) => {
    const keyPresent = Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
        process.env.GEMINI_API_KEY !== 'your_key_here'
    );
    let storageMode = getStorageMode();
    try {
      storageMode = await initializeStorage();
    } catch {
      // Keep reported configured mode even if Atlas is currently unreachable
    }
    res.json({
      success: true,
      data: {
        status: 'ok',
        aiConfigured: keyPresent,
        modelName: getConfiguredModelName(),
        promptVersion: PROMPT_VERSION,
        storageMode,
        authEnabled: true,
        researchMode: 'ai_only',
      },
      message: 'StartupLens AI service is healthy.',
    });
  });

  // --- Authentication Routes ---
  app.post('/api/auth/register', authRateLimiter, async (req, res, next) => {
    try {
      const parsed = RegisterInputSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid registration fields.',
          error: { code: 'VALIDATION_ERROR' },
        });
        return;
      }

      const existing = await findUserByEmail(parsed.data.email);
      if (existing) {
        res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please sign in instead.',
          error: { code: 'EMAIL_EXISTS' },
        });
        return;
      }

      const now = new Date().toISOString();
      const user: StoredUser = {
        id: crypto.randomUUID(),
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: hashPassword(parsed.data.password),
        createdAt: now,
        updatedAt: now,
      };

      await createUser(user);
      const publicUser = toPublicUser(user);
      const token = signAuthToken(publicUser);

      res.status(201).json({
        success: true,
        data: { token, user: publicUser },
        message: 'Account created successfully.',
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/login', authRateLimiter, async (req, res, next) => {
    try {
      const parsed = LoginInputSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message || 'Invalid login credentials.',
          error: { code: 'VALIDATION_ERROR' },
        });
        return;
      }

      const user = await findUserByEmail(parsed.data.email);
      if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
          error: { code: 'INVALID_CREDENTIALS' },
        });
        return;
      }

      const publicUser = toPublicUser(user);
      const token = signAuthToken(publicUser);

      res.json({
        success: true,
        data: { token, user: publicUser },
        message: 'Signed in successfully.',
      });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.authUser?.sub;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required.',
          error: { code: 'UNAUTHORIZED' },
        });
        return;
      }
      const user = await findUserById(userId);
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Account no longer exists. Please register or sign in again.',
          error: { code: 'UNAUTHORIZED' },
        });
        return;
      }
      res.json({
        success: true,
        data: toPublicUser(user),
        message: 'Current user profile retrieved.',
      });
    } catch (err) {
      next(err);
    }
  });

  // --- Protected Analysis Routes (Ownership Enforced) ---
  app.get('/api/analyses', requireAuth, async (req: AuthenticatedRequest, res, next) => {
    try {
      const userId = req.authUser!.sub;
      const analyses = await listAnalysesByUser(userId);
      res.json({
        success: true,
        data: analyses,
        message: 'Analyses retrieved successfully.',
      });
    } catch (err) {
      next(err);
    }
  });

  app.post(
    '/api/analyses',
    requireAuth,
    analysisRateLimiter,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const parsedInput = AnalyzeIdeaInputSchema.safeParse(req.body);
        if (!parsedInput.success) {
          const firstIssue = parsedInput.error.issues[0];
          res.status(400).json({
            success: false,
            message: firstIssue?.message || 'Invalid idea submission fields.',
            error: { code: 'VALIDATION_ERROR' },
          });
          return;
        }

        const userId = req.authUser!.sub;
        const input = parsedInput.data;
        const { report, modelName, promptVersion } = await generateStartupAnalysis(input);
        const now = new Date().toISOString();

        const document: AnalysisDocument = {
          id: report.analysisId,
          userId,
          ideaName: report.ideaName,
          ideaDescription: input.ideaDescription,
          industry: input.industry || '',
          targetMarket: input.targetMarket || '',
          targetAudience: input.targetAudience || '',
          problemStatement: input.problemStatement || '',
          currentStage: input.currentStage || 'idea',
          knownCompetitors: input.knownCompetitors || '',
          budgetConstraints: input.budgetConstraints || '',
          roadmapWeeks: input.roadmapWeeks || 6,
          reportJson: report,
          promptVersion,
          modelName,
          researchMode: 'ai_only',
          chatHistory: [],
          createdAt: now,
          updatedAt: now,
        };

        await saveAnalysis(document);

        res.status(201).json({
          success: true,
          data: document,
          message: 'Analysis generated successfully.',
        });
      } catch (err) {
        next(err);
      }
    }
  );

  app.get(
    '/api/analyses/:id',
    requireAuth,
    validateUuidParam,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const doc = await getAnalysisByIdForUser(req.params.id, req.authUser!.sub);
        if (!doc) {
          res.status(404).json({
            success: false,
            message: 'Analysis report not found.',
            error: { code: 'NOT_FOUND' },
          });
          return;
        }
        res.json({
          success: true,
          data: doc,
          message: 'Analysis retrieved successfully.',
        });
      } catch (err) {
        next(err);
      }
    }
  );

  app.patch(
    '/api/analyses/:id',
    requireAuth,
    validateUuidParam,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const parsed = RenameAnalysisInputSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({
            success: false,
            message: parsed.error.issues[0]?.message || 'Invalid project name.',
            error: { code: 'VALIDATION_ERROR' },
          });
          return;
        }
        const updated = await renameAnalysisForUser(
          req.params.id,
          req.authUser!.sub,
          parsed.data.ideaName
        );
        if (!updated) {
          res.status(404).json({
            success: false,
            message: 'Analysis report not found.',
            error: { code: 'NOT_FOUND' },
          });
          return;
        }
        res.json({
          success: true,
          data: updated,
          message: 'Analysis renamed successfully.',
        });
      } catch (err) {
        next(err);
      }
    }
  );

  app.delete(
    '/api/analyses/:id',
    requireAuth,
    validateUuidParam,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const deleted = await deleteAnalysisForUser(req.params.id, req.authUser!.sub);
        if (!deleted) {
          res.status(404).json({
            success: false,
            message: 'Analysis report not found.',
            error: { code: 'NOT_FOUND' },
          });
          return;
        }
        res.json({
          success: true,
          data: { id: req.params.id },
          message: 'Analysis deleted successfully.',
        });
      } catch (err) {
        next(err);
      }
    }
  );

  app.post(
    '/api/analyses/:id/chat',
    requireAuth,
    validateUuidParam,
    chatRateLimiter,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const parsed = ChatMessageInputSchema.safeParse(req.body);
        if (!parsed.success) {
          res.status(400).json({
            success: false,
            message: parsed.error.issues[0]?.message || 'Invalid mentor message.',
            error: { code: 'VALIDATION_ERROR' },
          });
          return;
        }

        const userId = req.authUser!.sub;
        const doc = await getAnalysisByIdForUser(req.params.id, userId);
        if (!doc) {
          res.status(404).json({
            success: false,
            message: 'Analysis report not found.',
            error: { code: 'NOT_FOUND' },
          });
          return;
        }

        const replyText = await generateMentorReply(doc, parsed.data.message);
        const now = new Date().toISOString();

        const userMsg: MentorMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content: parsed.data.message,
          createdAt: now,
        };
        const assistantMsg: MentorMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: replyText,
          createdAt: new Date().toISOString(),
        };

        const updatedDoc = await appendMentorMessagesForUser(doc.id, userId, [
          userMsg,
          assistantMsg,
        ]);

        res.json({
          success: true,
          data: {
            userMessage: userMsg,
            assistantMessage: assistantMsg,
            chatHistory: updatedDoc?.chatHistory || [...doc.chatHistory, userMsg, assistantMsg],
          },
          message: 'Mentor response generated successfully.',
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Return JSON 404 for unknown API routes
  app.use('/api/*', (_req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found.',
      error: { code: 'ENDPOINT_NOT_FOUND' },
    });
  });

  app.use(errorHandler);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`StartupLens AI server listening on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
