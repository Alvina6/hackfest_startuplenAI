import { GoogleGenAI, ThinkingLevel, Type, type Schema } from '@google/genai';
import crypto from 'node:crypto';
import type {
  AnalyzeIdeaInput,
  AnalysisDocument,
  MentorMessage,
  StartupReport,
} from '../shared/types.ts';
import {
  ANALYSIS_SYSTEM_INSTRUCTION,
  MENTOR_SYSTEM_INSTRUCTION,
  PROMPT_VERSION,
  SCORE_RUBRIC,
  buildIdeaAnalysisPrompt,
  buildMentorContextSummary,
  formatChatHistoryForPrompt,
} from './prompts.ts';
import { GeminiReportPayloadSchema } from './schema.ts';

export class ServiceError extends Error {
  statusCode: number;
  code: string;
  details?: string;

  constructor(statusCode: number, code: string, message: string, details?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

const DEPRECATED_MODELS = new Set([
  'your_supported_model_name',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-2.0-flash',
  'gemini-2.0-pro',
  'gemini-2.0-flash-thinking',
]);

export function getConfiguredModelName(): string {
  const configured = process.env.GEMINI_MODEL?.trim();
  if (!configured || DEPRECATED_MODELS.has(configured.toLowerCase())) {
    return 'gemini-4-hydrogen';
  }
  return configured;
}

function getFallbackModelCandidates(): string[] {
  const primary = getConfiguredModelName();
  const candidates = [primary];
  if (primary !== 'gemini-4-hydrogen') {
    candidates.push('gemini-4-hydrogen');
  }
  if (primary !== 'gemini-2.5-flash') {
    candidates.push('gemini-2.5-flash');
  }
  return candidates;
}

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'your_key_here') {
    throw new ServiceError(
      503,
      'GEMINI_API_KEY_MISSING',
      'Gemini API key is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets to enable AI analysis.'
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const REPORT_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  required: [
    'ideaName',
    'verdict',
    'executiveSummary',
    'topStrengths',
    'topConcerns',
    'assumptions',
    'validationStatus',
    'scoreBreakdown',
    'market',
    'competitors',
    'differentiationOpportunities',
    'competitiveRisks',
    'businessModels',
    'recommendedBusinessModel',
    'recommendedBusinessModelReason',
    'swot',
    'mvp',
    'roadmap',
    'risks',
    'nextActions',
    'pitchDeckOutline',
  ],
  properties: {
    ideaName: { type: Type.STRING },
    verdict: { type: Type.STRING, enum: ['Promising', 'Needs Validation', 'High Risk'] },
    executiveSummary: { type: Type.STRING },
    topStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    topConcerns: { type: Type.ARRAY, items: { type: Type.STRING } },
    assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
    validationStatus: { type: Type.STRING },
    scoreBreakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ['category', 'weight', 'score', 'reason'],
        properties: {
          category: { type: Type.STRING },
          weight: { type: Type.NUMBER },
          score: { type: Type.INTEGER },
          reason: { type: Type.STRING },
        },
      },
    },
    market: {
      type: Type.OBJECT,
      required: [
        'targetSegments',
        'secondarySegments',
        'painPoints',
        'opportunities',
        'barriers',
        'hypotheses',
        'interviewQuestions',
        'validationExperiments',
      ],
      properties: {
        targetSegments: { type: Type.ARRAY, items: { type: Type.STRING } },
        secondarySegments: { type: Type.ARRAY, items: { type: Type.STRING } },
        painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        barriers: { type: Type.ARRAY, items: { type: Type.STRING } },
        hypotheses: { type: Type.ARRAY, items: { type: Type.STRING } },
        interviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        validationExperiments: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ['assumption', 'experiment', 'successSignal'],
            properties: {
              assumption: { type: Type.STRING },
              experiment: { type: Type.STRING },
              successSignal: { type: Type.STRING },
            },
          },
        },
      },
    },
    competitors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: [
          'name',
          'type',
          'targetAudience',
          'offering',
          'strengths',
          'weaknesses',
          'differentiation',
          'pricingNote',
          'sourceUrls',
          'verificationStatus',
        ],
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['direct', 'indirect', 'alternative', 'candidate'] },
          targetAudience: { type: Type.STRING },
          offering: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          differentiation: { type: Type.STRING },
          pricingNote: { type: Type.STRING },
          sourceUrls: { type: Type.ARRAY, items: { type: Type.STRING } },
          verificationStatus: {
            type: Type.STRING,
            enum: ['verified', 'unverified', 'user-provided'],
          },
        },
      },
    },
    differentiationOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
    competitiveRisks: { type: Type.ARRAY, items: { type: Type.STRING } },
    businessModels: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: [
          'name',
          'description',
          'pros',
          'cons',
          'implementationComplexity',
          'riskLevel',
          'pricingHypothesis',
          'revenueStreams',
          'costDrivers',
          'fitScore',
        ],
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          pros: { type: Type.ARRAY, items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, items: { type: Type.STRING } },
          implementationComplexity: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
          riskLevel: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
          pricingHypothesis: { type: Type.STRING },
          revenueStreams: { type: Type.ARRAY, items: { type: Type.STRING } },
          costDrivers: { type: Type.ARRAY, items: { type: Type.STRING } },
          fitScore: { type: Type.INTEGER },
        },
      },
    },
    recommendedBusinessModel: { type: Type.STRING },
    recommendedBusinessModelReason: { type: Type.STRING },
    swot: {
      type: Type.OBJECT,
      required: ['strengths', 'weaknesses', 'opportunities', 'threats'],
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        threats: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
    mvp: {
      type: Type.OBJECT,
      required: [
        'recommendedScope',
        'coreUserJourney',
        'mustHave',
        'shouldHave',
        'couldHave',
        'outOfScope',
        'successMetrics',
      ],
      properties: {
        recommendedScope: { type: Type.STRING },
        coreUserJourney: { type: Type.ARRAY, items: { type: Type.STRING } },
        mustHave: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ['feature', 'reason'],
            properties: {
              feature: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
          },
        },
        shouldHave: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ['feature', 'reason'],
            properties: {
              feature: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
          },
        },
        couldHave: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ['feature', 'reason'],
            properties: {
              feature: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
          },
        },
        outOfScope: { type: Type.ARRAY, items: { type: Type.STRING } },
        successMetrics: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
    },
    roadmap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ['phase', 'duration', 'tasks'],
        properties: {
          phase: { type: Type.STRING },
          duration: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ['title', 'description', 'priority', 'durationEstimate', 'deliverable'],
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
                durationEstimate: { type: Type.STRING },
                deliverable: { type: Type.STRING },
                dependency: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
    risks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ['risk', 'category', 'severity', 'likelihood', 'mitigation', 'earlyWarning'],
        properties: {
          risk: { type: Type.STRING },
          category: {
            type: Type.STRING,
            enum: ['Product', 'Market', 'Competition', 'Technical', 'Operational', 'Data & Privacy'],
          },
          severity: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          likelihood: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
          mitigation: { type: Type.STRING },
          earlyWarning: { type: Type.STRING },
        },
      },
    },
    nextActions: { type: Type.ARRAY, items: { type: Type.STRING } },
    pitchDeckOutline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ['slideNumber', 'title', 'keyPoints', 'speakerNote'],
        properties: {
          slideNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          speakerNote: { type: Type.STRING },
        },
      },
    },
  },
};

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(
        new ServiceError(
          504,
          'AI_TIMEOUT',
          'The Gemini analysis request timed out. Please retry in a moment.'
        )
      );
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function redactSecrets(text: string): string {
  return text.replace(/AIza[0-9A-Za-z_-]{20,}/g, '[REDACTED_KEY]');
}

function isModelNotFoundError(err: unknown): boolean {
  const message = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    message.includes('not_found') ||
    message.includes('404') ||
    message.includes('not found for api version') ||
    message.includes('is not supported for generatecontent')
  );
}

function mapGeminiSdkError(err: unknown): ServiceError {
  if (err instanceof ServiceError) return err;

  const rawMessage = err instanceof Error ? err.message : String(err);
  const safeMessage = redactSecrets(rawMessage);
  const lower = safeMessage.toLowerCase();

  console.error('[Gemini SDK Error]', safeMessage.slice(0, 400));

  if (lower.includes('api_key_invalid') || lower.includes('api key not valid') || lower.includes('401')) {
    return new ServiceError(
      401,
      'GEMINI_API_KEY_INVALID',
      'The configured Gemini API key was rejected as invalid. Verify GEMINI_API_KEY in Settings > Secrets (or your local .env).'
    );
  }
  if (lower.includes('permission_denied') || lower.includes('403')) {
    const detail = lower.includes('leaked')
      ? 'This API key was flagged or revoked. Generate a new key in Google AI Studio.'
      : lower.includes('referer') || lower.includes('ip')
      ? 'This API key has HTTP referrer or IP restrictions blocking server-side requests. Use an unrestricted server key.'
      : 'Check that the Generative Language API is enabled for your key and that no referrer restrictions block server requests.';
    return new ServiceError(
      403,
      'GEMINI_PERMISSION_DENIED',
      `Gemini API access was denied (403). ${detail}`
    );
  }
  if (lower.includes('resource_exhausted') || lower.includes('429') || lower.includes('quota')) {
    return new ServiceError(
      429,
      'GEMINI_RATE_LIMITED',
      'Gemini API quota or rate limit was reached. Wait briefly and try again.'
    );
  }
  if (isModelNotFoundError(err)) {
    return new ServiceError(
      502,
      'GEMINI_MODEL_ERROR',
      'The configured Gemini model could not be reached. Please verify GEMINI_MODEL configuration.'
    );
  }

  return new ServiceError(
    502,
    'GEMINI_UPSTREAM_ERROR',
    'Unable to complete AI analysis right now. Please try again.'
  );
}

function extractJsonText(rawText: string | undefined): unknown {
  if (!rawText || !rawText.trim()) {
    throw new Error('Empty response from Gemini');
  }
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

function computeWeightedScore(
  breakdown: { category: string; weight: number; score: number; reason: string }[]
): {
  overallScore: number;
  normalizedBreakdown: { category: string; weight: number; score: number; reason: string }[];
} {
  const normalizedBreakdown = SCORE_RUBRIC.map((rubricItem, idx) => {
    const matched =
      breakdown.find((b) =>
        b.category.toLowerCase().includes(rubricItem.category.split(' ')[0].toLowerCase())
      ) || breakdown[idx];
    const boundedScore = Math.max(0, Math.min(100, Math.round(matched?.score ?? 50)));
    return {
      category: rubricItem.category,
      weight: rubricItem.weight,
      score: boundedScore,
      reason: matched?.reason || 'Heuristic assessment based on provided idea details.',
    };
  });

  const weightedSum = normalizedBreakdown.reduce(
    (acc, item) => acc + item.score * (item.weight / 100),
    0
  );
  return {
    overallScore: Math.max(0, Math.min(100, Math.round(weightedSum))),
    normalizedBreakdown,
  };
}

export async function generateStartupAnalysis(
  input: AnalyzeIdeaInput
): Promise<{ report: StartupReport; modelName: string; promptVersion: string }> {
  const ai = createGeminiClient();
  const candidates = getFallbackModelCandidates();
  let activeModelName = candidates[0];
  const prompt = buildIdeaAnalysisPrompt(input);

  let rawText: string | undefined;
  let parsedPayload: ReturnType<typeof GeminiReportPayloadSchema.parse> | null = null;
  let lastParseError: string | undefined;

  modelLoop: for (let mIdx = 0; mIdx < candidates.length; mIdx++) {
    activeModelName = candidates[mIdx];

    for (let attempt = 0; attempt < 2; attempt++) {
      const attemptPrompt =
        attempt === 0
          ? prompt
          : `${prompt}\n\nIMPORTANT RECOVERY NOTE: The previous attempt produced invalid or incomplete JSON (${lastParseError}). Output ONLY strict, valid JSON matching every required schema property.`;

      try {
        const supportsThinkingLevel =
          activeModelName.includes('gemini-4') || activeModelName.includes('gemini-3');
        const response = await withTimeout(
          ai.models.generateContent({
            model: activeModelName,
            contents: attemptPrompt,
            config: {
              systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
              responseMimeType: 'application/json',
              responseSchema: REPORT_RESPONSE_SCHEMA,
              ...(supportsThinkingLevel
                ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
                : {}),
            },
          }),
          90000
        );

        rawText = response.text;
        const json = extractJsonText(rawText);
        parsedPayload = GeminiReportPayloadSchema.parse(json);
        break modelLoop;
      } catch (err) {
        if (err instanceof ServiceError) {
          throw err;
        }
        if (isModelNotFoundError(err) && mIdx < candidates.length - 1) {
          console.warn(
            `Model "${activeModelName}" unavailable; falling back to "${candidates[mIdx + 1]}".`
          );
          continue modelLoop;
        }
        if (err instanceof SyntaxError || (err && typeof err === 'object' && 'issues' in err)) {
          lastParseError = err instanceof Error ? err.message : 'Schema validation error';
          if (attempt === 1) {
            throw new ServiceError(
              502,
              'AI_INVALID_JSON',
              'The AI response did not match the required report structure after retry. Please try again.'
            );
          }
          continue;
        }
        throw mapGeminiSdkError(err);
      }
    }
  }

  const modelName = activeModelName;

  if (!parsedPayload) {
    throw new ServiceError(
      502,
      'AI_INVALID_JSON',
      'Unable to parse structured report from AI output.'
    );
  }

  const analysisId = crypto.randomUUID();
  const generatedAt = new Date().toISOString();
  const { overallScore, normalizedBreakdown } = computeWeightedScore(parsedPayload.scoreBreakdown);

  const knownLower = (input.knownCompetitors || '')
    .split(/[,;\n]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // Enforce strict anti-hallucination guardrails in ai_only mode
  const sanitizedCompetitors = parsedPayload.competitors.map((comp) => {
    const isUserProvided =
      comp.verificationStatus === 'user-provided' ||
      knownLower.some((k) => comp.name.toLowerCase().includes(k) || k.includes(comp.name.toLowerCase()));

    return {
      ...comp,
      sourceUrls: [],
      verificationStatus: (isUserProvided ? 'user-provided' : 'unverified') as
        | 'user-provided'
        | 'unverified',
    };
  });

  const resolvedIdeaName = input.ideaName?.trim() || parsedPayload.ideaName.trim();

  const report: StartupReport = {
    analysisId,
    ideaName: resolvedIdeaName,
    generatedAt,
    overallScore,
    verdict: parsedPayload.verdict,
    executiveSummary: parsedPayload.executiveSummary,
    topStrengths: parsedPayload.topStrengths,
    topConcerns: parsedPayload.topConcerns,
    assumptions: parsedPayload.assumptions,
    validationStatus:
      'AI-generated heuristic analysis (no live web retrieval); competitor candidates and market hypotheses require independent founder verification.',
    scoreBreakdown: normalizedBreakdown,
    market: parsedPayload.market,
    competitors: sanitizedCompetitors,
    differentiationOpportunities: parsedPayload.differentiationOpportunities,
    competitiveRisks: parsedPayload.competitiveRisks,
    businessModels: parsedPayload.businessModels,
    recommendedBusinessModel: parsedPayload.recommendedBusinessModel,
    recommendedBusinessModelReason: parsedPayload.recommendedBusinessModelReason,
    swot: parsedPayload.swot,
    mvp: parsedPayload.mvp,
    roadmap: parsedPayload.roadmap,
    risks: parsedPayload.risks,
    nextActions: parsedPayload.nextActions,
    pitchDeckOutline: parsedPayload.pitchDeckOutline,
  };

  return {
    report,
    modelName,
    promptVersion: PROMPT_VERSION,
  };
}

export async function generateMentorReply(
  analysis: AnalysisDocument,
  userQuestion: string
): Promise<string> {
  const ai = createGeminiClient();
  const candidates = getFallbackModelCandidates();
  const contextSummary = buildMentorContextSummary(analysis);
  const historyText = formatChatHistoryForPrompt(analysis.chatHistory);

  const prompt = `${contextSummary}

RECENT CONVERSATION:
${historyText}

FOUNDER'S NEW QUESTION:
${userQuestion.trim()}

Respond directly, practically, and grounded in this specific startup report.`;

  for (let mIdx = 0; mIdx < candidates.length; mIdx++) {
    const activeModelName = candidates[mIdx];
    try {
      const supportsThinkingLevel =
        activeModelName.includes('gemini-4') || activeModelName.includes('gemini-3');
      const response = await withTimeout(
        ai.models.generateContent({
          model: activeModelName,
          contents: prompt,
          config: {
            systemInstruction: MENTOR_SYSTEM_INSTRUCTION,
            ...(supportsThinkingLevel
              ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
              : {}),
          },
        }),
        45000
      );

      const reply = response.text?.trim();
      if (!reply) {
        throw new ServiceError(
          502,
          'AI_EMPTY_REPLY',
          'Startup Mentor returned an empty response. Please try asking again.'
        );
      }
      return reply;
    } catch (err) {
      if (isModelNotFoundError(err) && mIdx < candidates.length - 1) {
        continue;
      }
      throw mapGeminiSdkError(err);
    }
  }

  throw new ServiceError(
    502,
    'GEMINI_MODEL_ERROR',
    'Unable to reach a supported Gemini model.'
  );
}
