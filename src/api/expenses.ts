import { getToken } from './auth';
import type { Expense, ExpenseCategory } from '../types/expense';

const API_URL = 'http://localhost:3000';

export interface ExpenseFilters {
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
}

export interface ExpenseStatsItem {
  category: ExpenseCategory;
  total: number;
}

export interface ExpenseSummary {
  month: string;
  total: number;
}

interface ExpenseResponse {
  id: string;
  amount: number;
  category: ExpenseCategory;
  note: string | null;
  date: string;
}

interface ExpensesResponse {
  page: number;
  limit: number;
  total: number;
  data: ExpenseResponse[];
}

interface CreateExpenseData {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
}

function getAuthHeaders(): HeadersInit {
  const token = getToken();

  if (!token) {
    throw new Error('Authentication required.');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function mapExpense(expense: ExpenseResponse): Expense {
  return {
    id: expense.id,
    description: expense.note ?? '',
    amount: expense.amount,
    category: expense.category,
    date: expense.date.split('T')[0],
  };
}

export async function fetchExpenses(
  filters: ExpenseFilters = {},
): Promise<Expense[]> {
  const searchParams = new URLSearchParams();

  if (filters.category) {
    searchParams.set('category', filters.category);
  }

  if (filters.startDate) {
    searchParams.set('startDate', filters.startDate);
  }

  if (filters.endDate) {
    searchParams.set('endDate', filters.endDate);
  }

  const query = searchParams.toString();
  const url = query
    ? `${API_URL}/expenses?${query}`
    : `${API_URL}/expenses`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to load expenses.');
  }

  const result: ExpensesResponse = await response.json();

  return result.data.map(mapExpense);
}

export async function fetchExpenseStats(): Promise<ExpenseStatsItem[]> {
  const response = await fetch(`${API_URL}/expenses/stats`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to load expense statistics.');
  }

  return response.json();
}

export async function fetchExpenseSummary(
  month: string,
): Promise<ExpenseSummary> {
  const searchParams = new URLSearchParams({
    month,
  });

  const response = await fetch(
    `${API_URL}/expenses/summary?${searchParams.toString()}`,
    {
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to load expense summary.');
  }

  return response.json();
}

export async function fetchTopExpenseCategories(
  limit = 5,
): Promise<ExpenseStatsItem[]> {
  const searchParams = new URLSearchParams({
    limit: String(limit),
  });

  const response = await fetch(
    `${API_URL}/expenses/top-categories?${searchParams.toString()}`,
    {
      headers: getAuthHeaders(),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      error.message || 'Failed to load top expense categories.',
    );
  }

  return response.json();
}

export async function createExpense(
  expense: CreateExpenseData,
): Promise<Expense> {
  const response = await fetch(`${API_URL}/expenses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      amount: expense.amount,
      category: expense.category,
      note: expense.description,
      date: expense.date,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create expense.');
  }

  const result: ExpenseResponse = await response.json();

  return mapExpense(result);
}

export async function updateExpense(
  id: string,
  expense: CreateExpenseData,
): Promise<Expense> {
  const response = await fetch(`${API_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      amount: expense.amount,
      category: expense.category,
      note: expense.description,
      date: expense.date,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update expense.');
  }

  const result: ExpenseResponse = await response.json();

  return mapExpense(result);
}

export async function deleteExpense(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/expenses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete expense.');
  }
}
