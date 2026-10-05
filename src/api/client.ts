import { getToken } from './auth';

const API_URL = import.meta.env.VITE_API_URL;

interface ApiErrorResponse {
  message?: string | string[];
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

async function parseError(response: Response): Promise<string> {
  try {
    const error: ApiErrorResponse = await response.json();

    if (Array.isArray(error.message)) {
      return error.message.join(', ');
    }

    if (error.message) {
      return error.message;
    }
  } catch {
    // Ignore invalid error response bodies.
  }

  return `Request failed with status ${response.status}.`;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    requiresAuth = true,
    headers: customHeaders,
    ...requestOptions
  } = options;

  const headers = new Headers(customHeaders);

  if (requestOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (requiresAuth) {
    const token = getToken();

    if (!token) {
      throw new Error('Authentication required.');
    }

    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
