// lib/api/client.ts
export class ApiError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, opts?: { status?: number; details?: unknown }) {
    super(message);
    this.name = 'ApiError';
    this.status = opts?.status;
    this.details = opts?.details;
  }
}

type ApiFetchOptions = Omit<RequestInit, 'body'> & {
  timeoutMs?: number;
  body?: unknown; // JSON body
};

/**
 * Typed fetch helper with:
 * - Timeout (default 12s)
 * - JSON request/response
 * - Standardized error handling
 */
export async function apiFetch<T>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const { timeoutMs = 12_000, body, headers, ...rest } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...rest,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(headers ?? {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const contentType = res.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');

    if (!res.ok) {
      let payload: unknown = undefined;
      try {
        payload = isJson ? await res.json() : await res.text();
      } catch {
        // ignore parse errors
      }

      const message =
        (isJson &&
          payload &&
          typeof payload === 'object' &&
          'detail' in (payload as any) &&
          typeof (payload as any).detail === 'string' &&
          (payload as any).detail) ||
        `Request failed with status ${res.status}`;

      throw new ApiError(message, { status: res.status, details: payload });
    }

    if (res.status === 204) return undefined as unknown as T;
    if (isJson) return (await res.json()) as T;

    const text = await res.text();
    return text as unknown as T;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new ApiError('Request timed out', { details: { timeoutMs } });
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError('Network error', { details: err });
  } finally {
    clearTimeout(timeout);
  }
}
