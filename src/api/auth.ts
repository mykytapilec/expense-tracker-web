import { apiRequest } from './client';
import {
  getToken,
  getUserEmail,
  removeToken,
  removeUserEmail,
  saveToken,
  saveUserEmail,
} from './auth-storage';

export {
  getToken,
  getUserEmail,
  removeToken,
  removeUserEmail,
  saveToken,
  saveUserEmail,
};

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
  return apiRequest<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(credentials),
    requiresAuth: false,
  });
}

export async function login(
  credentials: AuthCredentials,
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    requiresAuth: false,
  });
}
