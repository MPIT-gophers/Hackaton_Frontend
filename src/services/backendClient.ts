import { logger } from '../utils/logger';

const API_BASE_URL = 'https://mpit-bot.kostya1024.ru/api/v1';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: FormData | unknown;
  accessToken?: string;
  headers?: Record<string, string>;
};

export class BackendError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'BackendError';
    this.status = status;
    this.details = details;
  }
}

function buildUrl(path: string) {
  return path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractErrorMessage(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }

  if (typeof payload.detail === 'string') {
    return payload.detail;
  }

  if (Array.isArray(payload.detail)) {
    return payload.detail
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        if (isRecord(item) && typeof item.msg === 'string') {
          return item.msg;
        }

        return null;
      })
      .filter(Boolean)
      .join(', ');
  }

  if (typeof payload.message === 'string') {
    return payload.message;
  }

  if (isRecord(payload.error) && typeof payload.error.message === 'string') {
    return payload.error.message;
  }

  if (typeof payload.error === 'string') {
    return payload.error;
  }

  return null;
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

function summarizeRequestBody(body: RequestOptions['body']) {
  if (!body) {
    return null;
  }

  if (isFormData(body)) {
    return {
      type: 'FormData'
    };
  }

  return body;
}

async function parseResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const isMultipartBody = isFormData(options.body);
  const method = options.method ?? 'GET';
  const url = buildUrl(path);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    ...(options.body && !isMultipartBody ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers
  };

  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  const startedAt = Date.now();

  logger.debug('BackendClient', 'Request started', {
    method,
    path,
    url,
    hasAccessToken: Boolean(options.accessToken),
    headers,
    body: summarizeRequestBody(options.body)
  });

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: options.body ? (isFormData(options.body) ? options.body : JSON.stringify(options.body)) : undefined,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const payload = await parseResponse(response);

    if (!response.ok) {
      const backendError = new BackendError(extractErrorMessage(payload) ?? 'Request failed', response.status, payload);

      logger.warn('BackendClient', 'Request failed', {
        method,
        path,
        url,
        status: response.status,
        durationMs: Date.now() - startedAt,
        error: backendError,
        details: payload
      });

      throw backendError;
    }

    logger.info('BackendClient', 'Request succeeded', {
      method,
      path,
      url,
      status: response.status,
      durationMs: Date.now() - startedAt,
      payload
    });

    return payload as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (!(error instanceof BackendError)) {
      logger.error('BackendClient', 'Request crashed before response completed', {
        method,
        path,
        url,
        durationMs: Date.now() - startedAt,
        error
      });
    }

    throw error;
  }
}

export async function requestFormData<T>(
  path: string,
  options: Omit<RequestOptions, 'body'> & {
    body: FormData;
  }
): Promise<T> {
  return request<T>(path, options);
}

export function getBackendErrorMessage(error: unknown, fallback: string) {
  if (error instanceof BackendError && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function isUnauthorizedBackendError(error: unknown) {
  return error instanceof BackendError && (error.status === 401 || error.status === 403);
}
