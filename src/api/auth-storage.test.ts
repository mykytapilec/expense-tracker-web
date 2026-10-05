import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearAuthStorage,
  getToken,
  getUserEmail,
  removeToken,
  removeUserEmail,
  saveToken,
  saveUserEmail,
} from './auth-storage';

describe('auth-storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and returns the authentication token', () => {
    saveToken('test-token');

    expect(getToken()).toBe('test-token');
  });

  it('removes the authentication token', () => {
    saveToken('test-token');

    removeToken();

    expect(getToken()).toBeNull();
  });

  it('saves and returns the user email', () => {
    saveUserEmail('user@example.com');

    expect(getUserEmail()).toBe('user@example.com');
  });

  it('returns an empty string when the user email is not stored', () => {
    expect(getUserEmail()).toBe('');
  });

  it('removes the user email', () => {
    saveUserEmail('user@example.com');

    removeUserEmail();

    expect(getUserEmail()).toBe('');
  });

  it('clears all authentication data', () => {
    saveToken('test-token');
    saveUserEmail('user@example.com');

    clearAuthStorage();

    expect(getToken()).toBeNull();
    expect(getUserEmail()).toBe('');
  });
});
