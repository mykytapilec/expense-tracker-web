const API_URL = 'http://localhost:3000';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

interface AuthCredentials {
  email: string;
  password: string;
}

export async function signup(
  credentials: AuthCredentials,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to sign up.');
  }

  return response.json();
}

export async function login(
  credentials: AuthCredentials,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to log in.');
  }

  return response.json();
}

export function saveToken(token: string): void {
  localStorage.setItem('authToken', token);
}

export function getToken(): string | null {
  return localStorage.getItem('authToken');
}

export function removeToken(): void {
  localStorage.removeItem('authToken');
}