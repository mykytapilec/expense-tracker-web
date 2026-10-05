import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiRequest } from './client';
import {
  getToken,
  getUserEmail,
  login,
  saveToken,
  saveUserEmail,
  signup,
} from './auth';

vi.mock('./client', () => ({
  apiRequest: vi.fn(),
}));

const apiRequestMock = vi.mocked(apiRequest);

describe('auth API', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('signs up a user with the provided credentials', async () => {
    const response = {
      token: 'signup-token',
      user: {
        id: 'user-1',
        email: 'user@example.com',
      },
    };

    apiRequestMock.mockResolvedValue(response);

    const result = await signup({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(apiRequestMock).toHaveBeenCalledWith('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
      }),
      requiresAuth: false,
    });

    expect(result).toEqual(response);
  });

  it('logs in a user with the provided credentials', async () => {
    const response = {
      token: 'login-token',
      user: {
        id: 'user-1',
        email: 'user@example.com',
      },
    };

    apiRequestMock.mockResolvedValue(response);

    const result = await login({
      email: 'user@example.com',
      password: 'password123',
    });

    expect(apiRequestMock).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
      }),
      requiresAuth: false,
    });

    expect(result).toEqual(response);
  });

  it('propagates signup API errors', async () => {
    apiRequestMock.mockRejectedValue(new Error('Email already exists.'));

    await expect(
      signup({
        email: 'user@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow('Email already exists.');
  });

  it('propagates login API errors', async () => {
    apiRequestMock.mockRejectedValue(new Error('Invalid credentials.'));

    await expect(
      login({
        email: 'user@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow('Invalid credentials.');
  });

  it('re-exports authentication storage helpers', () => {
    saveToken('test-token');
    saveUserEmail('user@example.com');

    expect(getToken()).toBe('test-token');
    expect(getUserEmail()).toBe('user@example.com');
  });
});
