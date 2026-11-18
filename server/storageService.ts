import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose, { Schema } from 'mongoose';
import type { AnalysisDocument, MentorMessage } from '../shared/types.ts';
import type { StoredUser } from './authService.ts';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const ANALYSES_FILE = path.join(DATA_DIR, 'analyses.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// --- Mongoose Models (used automatically when MONGODB_URI is configured) ---
const UserMongoSchema = new Schema<StoredUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { versionKey: false }
);

const MentorMessageMongoSchema = new Schema<MentorMessage>(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { _id: false }
);

const AnalysisMongoSchema = new Schema<AnalysisDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    ideaName: { type: String, required: true },
    ideaDescription: { type: String, required: true },
    industry: { type: String, default: '' },
    targetMarket: { type: String, default: '' },
    targetAudience: { type: String, default: '' },
    problemStatement: { type: String, default: '' },
    currentStage: { type: String, default: 'idea' },
    knownCompetitors: { type: String, default: '' },
    budgetConstraints: { type: String, default: '' },
    roadmapWeeks: { type: Number, default: 6 },
    reportJson: { type: Schema.Types.Mixed, required: true },
    promptVersion: { type: String, required: true },
    modelName: { type: String, required: true },
    researchMode: { type: String, default: 'ai_only' },
    chatHistory: { type: [MentorMessageMongoSchema], default: [] },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { versionKey: false }
);

const UserModel =
  (mongoose.models.User as mongoose.Model<StoredUser> | undefined) ||
  mongoose.model<StoredUser>('User', UserMongoSchema);

const AnalysisModel =
  (mongoose.models.Analysis as mongoose.Model<AnalysisDocument> | undefined) ||
  mongoose.model<AnalysisDocument>('Analysis', AnalysisMongoSchema);

let mongoConnectPromise: Promise<boolean> | null = null;
let mongoActive = false;

function getConfiguredMongoUri(): string | null {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri || uri === 'your_mongodb_connection_string') return null;
  return uri;
}

export async function initializeStorage(): Promise<'mongodb' | 'local_file_fallback'> {
  const uri = getConfiguredMongoUri();
  if (!uri) {
    mongoActive = false;
    return 'local_file_fallback';
  }

  if (mongoose.connection.readyState === 1) {
    mongoActive = true;
    return 'mongodb';
  }

  if (!mongoConnectPromise) {
    mongoConnectPromise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 8000 })
      .then(() => {
        mongoActive = true;
        console.log('Connected to MongoDB Atlas successfully.');
        return true;
      })
      .catch((err) => {
        mongoActive = false;
        mongoConnectPromise = null;
        console.error('MongoDB connection failed:', err instanceof Error ? err.message : err);
        throw new Error('Unable to connect to configured MongoDB database.');
      });
  }

  await mongoConnectPromise;
  return 'mongodb';
}

export function getStorageMode(): 'mongodb' | 'local_file_fallback' {
  if (getConfiguredMongoUri()) {
    return mongoActive || mongoose.connection.readyState === 1 ? 'mongodb' : 'mongodb';
  }
  return 'local_file_fallback';
}

// --- Local File Fallback Store (used only when MONGODB_URI is not configured) ---
let analysesCache: AnalysisDocument[] | null = null;
let usersCache: StoredUser[] | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function readJsonFile<T>(filePath: string): Promise<T[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (err: unknown) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code !== 'ENOENT') {
      console.warn(`Could not read ${path.basename(filePath)}; initializing empty store.`);
    }
    return [];
  }
}

function writeJsonFile<T>(filePath: string, data: T[]): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      const tmp = `${filePath}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
      await fs.rename(tmp, filePath);
    } catch (err) {
      console.warn(`Persistence write failed for ${path.basename(filePath)}:`, err);
    }
  });
  return writeQueue;
}

async function ensureUsersFile(): Promise<StoredUser[]> {
  if (usersCache === null) {
    usersCache = await readJsonFile<StoredUser>(USERS_FILE);
  }
  return usersCache;
}

async function ensureAnalysesFile(): Promise<AnalysisDocument[]> {
  if (analysesCache === null) {
    analysesCache = await readJsonFile<AnalysisDocument>(ANALYSES_FILE);
  }
  return analysesCache;
}

// --- User Store Operations ---
export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const normalized = email.trim().toLowerCase();
  const mode = await initializeStorage();
  if (mode === 'mongodb') {
    return UserModel.findOne({ email: normalized }).lean<StoredUser | null>();
  }
  const users = await ensureUsersFile();
  return users.find((u) => u.email === normalized) || null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const mode = await initializeStorage();
  if (mode === 'mongodb') {
    return UserModel.findOne({ id }).lean<StoredUser | null>();
  }
  const users = await ensureUsersFile();
  return users.find((u) => u.id === id) || null;
}

export async function createUser(user: StoredUser): Promise<StoredUser> {
  const mode = await initializeStorage();
  if (mode === 'mongodb') {
    await UserModel.create(user);
    return user;
  }
  const users = await ensureUsersFile();
  usersCache = [...users, user];
  await writeJsonFile(USERS_FILE, usersCache);
  return user;
}

// --- Analysis Store Operations (Strictly Scoped by userId) ---
export async function listAnalysesByUser(userId: string): Promise<AnalysisDocument[]> {
  const mode = await initializeStorage();
  if (mode === 'mongodb') {
    return AnalysisModel.find({ userId }).sort({ createdAt: -1 }).lean<AnalysisDocument[]>();
  }
  const items = await ensureAnalysesFile();
  return items
    .filter((item) => item.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAnalysisByIdForUser(
  id: string,
  userId: string
): Promise<AnalysisDocument | null> {
  const mode = await initializeStorage();
  if (mode === 'mongodb') {
    return AnalysisModel.findOne({ id, userId }).lean<AnalysisDocument | null>();
  }
  const items = await ensureAnalysesFile();
  return items.find((item) => item.id === id && item.userId === userId) || null;
}

export async function saveAnalysis(doc: AnalysisDocument): Promise<AnalysisDocument> {
  const mode = await initializeStorage();
  if (mode === 'mongodb') {
    await AnalysisModel.create(doc);
    return doc;
  }
  const items = await ensureAnalysesFile();
  analysesCache = [doc, ...items.filter((item) => item.id !== doc.id)];
  await writeJsonFile(ANALYSES_FILE, analysesCache);
  return doc;
}

export async function renameAnalysisForUser(
  id: string,
  userId: string,
  newIdeaName: string
): Promise<AnalysisDocument | null> {
  const mode = await initializeStorage();
  const now = new Date().toISOString();

  if (mode === 'mongodb') {
    const existing = await AnalysisModel.findOne({ id, userId });
    if (!existing) return null;
    existing.ideaName = newIdeaName;
    existing.reportJson = { ...existing.reportJson, ideaName: newIdeaName };
    existing.updatedAt = now;
    await existing.save();
    return existing.toObject();
  }

  const items = await ensureAnalysesFile();
  const target = items.find((item) => item.id === id && item.userId === userId);
  if (!target) return null;

  const updated: AnalysisDocument = {
    ...target,
    ideaName: newIdeaName,
    reportJson: {
      ...target.reportJson,
      ideaName: newIdeaName,
    },
    updatedAt: now,
  };
  analysesCache = items.map((item) => (item.id === id && item.userId === userId ? updated : item));
  await writeJsonFile(ANALYSES_FILE, analysesCache);
  return updated;
}

export async function deleteAnalysisForUser(id: string, userId: string): Promise<boolean> {
  const mode = await initializeStorage();
  if (mode === 'mongodb') {
    const res = await AnalysisModel.deleteOne({ id, userId });
    return res.deletedCount > 0;
  }

  const items = await ensureAnalysesFile();
  const exists = items.some((item) => item.id === id && item.userId === userId);
  if (!exists) return false;

  analysesCache = items.filter((item) => !(item.id === id && item.userId === userId));
  await writeJsonFile(ANALYSES_FILE, analysesCache);
  return true;
}

export async function appendMentorMessagesForUser(
  id: string,
  userId: string,
  messages: MentorMessage[]
): Promise<AnalysisDocument | null> {
  const mode = await initializeStorage();
  const now = new Date().toISOString();

  if (mode === 'mongodb') {
    const existing = await AnalysisModel.findOne({ id, userId });
    if (!existing) return null;
    existing.chatHistory = [...existing.chatHistory, ...messages].slice(-40);
    existing.updatedAt = now;
    await existing.save();
    return existing.toObject();
  }

  const items = await ensureAnalysesFile();
  const target = items.find((item) => item.id === id && item.userId === userId);
  if (!target) return null;

  const updated: AnalysisDocument = {
    ...target,
    chatHistory: [...target.chatHistory, ...messages].slice(-40),
    updatedAt: now,
  };
  analysesCache = items.map((item) => (item.id === id && item.userId === userId ? updated : item));
  await writeJsonFile(ANALYSES_FILE, analysesCache);
  return updated;
}
