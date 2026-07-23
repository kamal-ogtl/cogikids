const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.cogniedufy.com';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request<T>(method: HttpMethod, endpoint: string, token: string, body?: object): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API ${method} ${endpoint} failed (${response.status}): ${errorText}`);
  }

  return response.json() as Promise<T>;
}

const apiClient = {
  get: <T>(endpoint: string, token: string) =>
    request<T>('GET', endpoint, token),

  post: <T>(endpoint: string, body: object, token: string) =>
    request<T>('POST', endpoint, token, body),

  patch: <T>(endpoint: string, body: object, token: string) =>
    request<T>('PATCH', endpoint, token, body),

  delete: <T>(endpoint: string, token: string) =>
    request<T>('DELETE', endpoint, token),
};

export default apiClient;
