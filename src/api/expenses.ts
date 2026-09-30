import type { Expense } from '../types/expense';

const mockExpenses: Expense[] = [
  {
    id: '1',
    description: 'Groceries',
    amount: 54.2,
    category: 'Food',
    date: '2026-09-28',
  },
  {
    id: '2',
    description: 'Monthly transport pass',
    amount: 35,
    category: 'Transport',
    date: '2026-09-27',
  },
  {
    id: '3',
    description: 'Movie tickets',
    amount: 24,
    category: 'Entertainment',
    date: '2026-09-25',
  },
];

export function fetchExpenses(): Promise<Expense[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockExpenses);
    }, 500);
  });
}