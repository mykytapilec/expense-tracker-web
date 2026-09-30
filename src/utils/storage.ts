import type { Expense } from '../types/expense';

const STORAGE_KEY = 'expense-tracker-expenses';

export function getStoredExpenses(): Expense[] | null {
  const storedExpenses = localStorage.getItem(STORAGE_KEY);

  if (!storedExpenses) {
    return null;
  }

  try {
    const expenses: unknown = JSON.parse(storedExpenses);

    return Array.isArray(expenses) ? (expenses as Expense[]) : null;
  } catch {
    return null;
  }
}

export function saveExpenses(expenses: Expense[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}