const API_URL = import.meta.env.VITE_API_URL;

const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_EMAIL_KEY = 'authUserEmail';

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
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function removeToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function saveUserEmail(email: string): void {
  localStorage.setItem(AUTH_USER_EMAIL_KEY, email);
}

export function getUserEmail(): string {
  return localStorage.getItem(AUTH_USER_EMAIL_KEY) ?? '';
}

export function removeUserEmail(): void {
  localStorage.removeItem(AUTH_USER_EMAIL_KEY);
}
