import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getToken,
  getUserEmail,
  saveToken,
  saveUserEmail,
} from './auth-storage';
import { apiRequest } from './client';

describe('apiRequest', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('adds the authorization header when authentication is required', async () => {
    saveToken('test-token');

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

    await apiRequest<{ success: boolean }>('/expenses');

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers;

    expect(headers).toBeInstanceOf(Headers);
    expect((headers as Headers).get('Authorization')).toBe(
      'Bearer test-token',
    );
  });

  it('does not require a token when requiresAuth is false', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

    await apiRequest<{ success: boolean }>('/auth/login', {
      method: 'POST',
      requiresAuth: false,
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password',
      }),
    });

    const [url, options] = fetchMock.mock.calls[0];
    const headers = options?.headers;

    expect(url).toContain('/auth/login');
    expect((headers as Headers).get('Authorization')).toBeNull();
    expect((headers as Headers).get('Content-Type')).toBe(
      'application/json',
    );
  });

  it('throws when authentication is required but no token exists', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');

    await expect(apiRequest('/expenses')).rejects.toThrow(
      'Authentication required.',
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('clears authentication data when the API returns 401', async () => {
    saveToken('expired-token');
    saveUserEmail('user@example.com');

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    await expect(apiRequest('/expenses')).rejects.toThrow(
      'Authentication required.',
    );

    expect(getToken()).toBeNull();
    expect(getUserEmail()).toBe('');
  });

  it('throws the API error message for a failed request', async () => {
    saveToken('test-token');

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Invalid request' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    await expect(apiRequest('/expenses')).rejects.toThrow('Invalid request');
  });

  it('joins validation error messages returned as an array', async () => {
    saveToken('test-token');

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          message: ['Amount must be positive', 'Category is required'],
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    await expect(apiRequest('/expenses')).rejects.toThrow(
      'Amount must be positive, Category is required',
    );
  });

  it('returns undefined for a 204 response', async () => {
    saveToken('test-token');

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );

    await expect(
      apiRequest<void>('/expenses/test-id', {
        method: 'DELETE',
      }),
    ).resolves.toBeUndefined();
  });
});
