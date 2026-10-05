const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_EMAIL_KEY = 'authUserEmail';

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

export function clearAuthStorage(): void {
  removeToken();
  removeUserEmail();
}
