const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001/api/v1').replace(/\/$/, '');

export class ApiClientError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
    this.name = 'ApiClientError';
  }
}

let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  return request<T>(path, init, true);
}

async function request<T>(path: string, init: RequestInit, allowRefresh: boolean): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers, credentials: 'include' });
  } catch {
    throw new ApiClientError(0, 'network_unavailable', `Không thể kết nối tới máy chủ VocaHub (${API_URL}). Hãy kiểm tra backend và MySQL đang chạy.`);
  }
  if (response.status === 401 && allowRefresh && !path.startsWith('/auth/')) {
    if (await refreshSession()) return request<T>(path, init, false);
  }
  const payload = await response.json().catch(() => null) as { error?: { code?: string; message?: string } } | T | null;
  if (!response.ok) {
    const error = payload && typeof payload === 'object' && 'error' in payload ? payload.error : undefined;
    throw new ApiClientError(response.status, error?.code ?? 'request_invalid', error?.message ?? 'Đã xảy ra lỗi. Vui lòng thử lại.');
  }
  return payload as T;
}

export { API_URL };
