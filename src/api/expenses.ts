import { apiRequest } from './client';
import type { Expense, ExpenseCategory } from '../types/expense';

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

export interface ExpensesPage {
  page: number;
  limit: number;
  total: number;
  data: Expense[];
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
  page = 1,
  limit = 10,
): Promise<ExpensesPage> {
  const searchParams = new URLSearchParams();

  searchParams.set('page', String(page));
  searchParams.set('limit', String(limit));

  if (filters.category) {
    searchParams.set('category', filters.category);
  }

  if (filters.startDate) {
    searchParams.set('startDate', filters.startDate);
  }

  if (filters.endDate) {
    searchParams.set('endDate', filters.endDate);
  }

  const result = await apiRequest<ExpensesResponse>(
    `/expenses?${searchParams.toString()}`,
  );

  return {
    page: result.page,
    limit: result.limit,
    total: result.total,
    data: result.data.map(mapExpense),
  };
}

export async function fetchExpenseStats(): Promise<ExpenseStatsItem[]> {
  return apiRequest<ExpenseStatsItem[]>('/expenses/stats');
}

export async function fetchExpenseSummary(
  month: string,
): Promise<ExpenseSummary> {
  const searchParams = new URLSearchParams({
    month,
  });

  return apiRequest<ExpenseSummary>(
    `/expenses/summary?${searchParams.toString()}`,
  );
}

export async function fetchTopExpenseCategories(
  limit = 5,
): Promise<ExpenseStatsItem[]> {
  const searchParams = new URLSearchParams({
    limit: String(limit),
  });

  return apiRequest<ExpenseStatsItem[]>(
    `/expenses/top-categories?${searchParams.toString()}`,
  );
}

export async function createExpense(
  expense: CreateExpenseData,
): Promise<Expense> {
  const result = await apiRequest<ExpenseResponse>('/expenses', {
    method: 'POST',
    body: JSON.stringify({
      amount: expense.amount,
      category: expense.category,
      note: expense.description,
      date: expense.date,
    }),
  });

  return mapExpense(result);
}

export async function updateExpense(
  id: string,
  expense: CreateExpenseData,
): Promise<Expense> {
  const result = await apiRequest<ExpenseResponse>(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      amount: expense.amount,
      category: expense.category,
      note: expense.description,
      date: expense.date,
    }),
  });

  return mapExpense(result);
}

export async function deleteExpense(id: string): Promise<void> {
  await apiRequest<void>(`/expenses/${id}`, {
    method: 'DELETE',
  });
}
