import type {
  AnalysisDocument,
  AnalyzeIdeaInput,
  ApiResponse,
  AuthResponse,
  AuthUser,
  MentorMessage,
} from '../../shared/types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '';
const TOKEN_STORAGE_KEY = 'startuplens_auth_token';

export interface HealthStatus {
  status: string;
  aiConfigured: boolean;
  modelName: string;
  promptVersion: string;
  storageMode: string;
  authEnabled?: boolean;
  researchMode: string;
}

export class ApiClientError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = 'REQUEST_FAILED', status = 500) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage restriction
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage restriction
  }
}

async function requestJson<T>(
  path: string,
  init?: RequestInit,
  options?: { auth?: boolean }
): Promise<T> {
  const token = options?.auth !== false ? getAuthToken() : null;
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
      },
    });
  } catch {
    throw new ApiClientError(
      'Unable to reach the StartupLens server. Check your connection and try again.',
      'NETWORK_ERROR',
      0
    );
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      `Server returned an unexpected response (${response.status}).`,
      'INVALID_RESPONSE',
      response.status
    );
  }

  if (response.status === 401 && options?.auth !== false) {
    clearAuthToken();
  }

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new ApiClientError(
      payload?.message || 'Request failed. Please try again.',
      payload?.error?.code || 'API_ERROR',
      response.status
    );
  }

  return payload.data;
}

export async function fetchHealth(): Promise<HealthStatus> {
  return requestJson<HealthStatus>('/api/health', undefined, { auth: false });
}

export async function registerAccount(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await requestJson<AuthResponse>(
    '/api/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    { auth: false }
  );
  setAuthToken(res.token);
  return res;
}

export async function loginAccount(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await requestJson<AuthResponse>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
    { auth: false }
  );
  setAuthToken(res.token);
  return res;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  return requestJson<AuthUser>('/api/auth/me');
}

export async function fetchAnalyses(): Promise<AnalysisDocument[]> {
  return requestJson<AnalysisDocument[]>('/api/analyses');
}

export async function createAnalysis(input: AnalyzeIdeaInput): Promise<AnalysisDocument> {
  return requestJson<AnalysisDocument>('/api/analyses', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function fetchAnalysisById(id: string): Promise<AnalysisDocument> {
  return requestJson<AnalysisDocument>(`/api/analyses/${encodeURIComponent(id)}`);
}

export async function renameAnalysisById(id: string, ideaName: string): Promise<AnalysisDocument> {
  return requestJson<AnalysisDocument>(`/api/analyses/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ ideaName }),
  });
}

export async function deleteAnalysisById(id: string): Promise<{ id: string }> {
  return requestJson<{ id: string }>(`/api/analyses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function sendMentorQuestion(
  analysisId: string,
  message: string
): Promise<{
  userMessage: MentorMessage;
  assistantMessage: MentorMessage;
  chatHistory: MentorMessage[];
}> {
  return requestJson<{
    userMessage: MentorMessage;
    assistantMessage: MentorMessage;
    chatHistory: MentorMessage[];
  }>(`/api/analyses/${encodeURIComponent(analysisId)}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}
