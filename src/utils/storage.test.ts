import { beforeEach, describe, expect, it } from 'vitest';

import type { Expense } from '../types/expense';
import { getStoredExpenses, saveExpenses } from './storage';

const STORAGE_KEY = 'expense-tracker-expenses';

const mockExpenses: Expense[] = [
  {
    id: 'expense-1',
    description: 'Weekly groceries',
    amount: 45.5,
    category: 'GROCERIES',
    date: '2026-10-10',
  },
];

describe('getStoredExpenses', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no expenses are stored', () => {
    expect(getStoredExpenses()).toBeNull();
  });

  it('returns null when stored data is invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid-json');

    expect(getStoredExpenses()).toBeNull();
  });

  it('returns null when stored data is not an array', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ expenses: mockExpenses }),
    );

    expect(getStoredExpenses()).toBeNull();
  });

  it('returns an empty array when an empty array is stored', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));

    expect(getStoredExpenses()).toEqual([]);
  });

  it('returns stored expenses when valid array data exists', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockExpenses));

    expect(getStoredExpenses()).toEqual(mockExpenses);
  });
});

describe('saveExpenses', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores expenses as JSON under the expected key', () => {
    saveExpenses(mockExpenses);

    expect(localStorage.getItem(STORAGE_KEY)).toBe(
      JSON.stringify(mockExpenses),
    );
  });

  it('stores an empty array', () => {
    saveExpenses([]);

    expect(localStorage.getItem(STORAGE_KEY)).toBe('[]');
  });
});