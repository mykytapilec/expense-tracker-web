import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiRequest } from './client';
import {
  createExpense,
  deleteExpense,
  fetchExpenseStats,
  fetchExpenseSummary,
  fetchExpenses,
  fetchTopExpenseCategories,
  updateExpense,
} from './expenses';

vi.mock('./client', () => ({
  apiRequest: vi.fn(),
}));

const apiRequestMock = vi.mocked(apiRequest);

describe('expenses API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches expenses with pagination and filters', async () => {
    apiRequestMock.mockResolvedValue({
      page: 2,
      limit: 10,
      total: 25,
      data: [
        {
          id: 'expense-1',
          amount: 125.5,
          category: 'GROCERIES',
          note: 'Weekly groceries',
          date: '2026-09-15T12:00:00.000Z',
        },
      ],
    });

    const result = await fetchExpenses(
      {
        category: 'GROCERIES',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
      },
      2,
      10,
    );

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/expenses?page=2&limit=10&category=GROCERIES&startDate=2026-09-01&endDate=2026-09-30',
    );

    expect(result).toEqual({
      page: 2,
      limit: 10,
      total: 25,
      data: [
        {
          id: 'expense-1',
          amount: 125.5,
          category: 'GROCERIES',
          description: 'Weekly groceries',
          date: '2026-09-15',
        },
      ],
    });
  });

  it('fetches expenses without optional filters', async () => {
    apiRequestMock.mockResolvedValue({
      page: 1,
      limit: 10,
      total: 0,
      data: [],
    });

    const result = await fetchExpenses();

    expect(apiRequestMock).toHaveBeenCalledWith('/expenses?page=1&limit=10');
    expect(result).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      data: [],
    });
  });

  it('maps a null note to an empty description', async () => {
    apiRequestMock.mockResolvedValue({
      page: 1,
      limit: 10,
      total: 1,
      data: [
        {
          id: 'expense-1',
          amount: 50,
          category: 'OTHERS',
          note: null,
          date: '2026-09-20T08:30:00.000Z',
        },
      ],
    });

    const result = await fetchExpenses();

    expect(result.data[0]).toEqual({
      id: 'expense-1',
      amount: 50,
      category: 'OTHERS',
      description: '',
      date: '2026-09-20',
    });
  });

  it('fetches expense statistics', async () => {
    const stats = [
      {
        category: 'GROCERIES' as const,
        total: 450,
      },
      {
        category: 'LEISURE' as const,
        total: 180,
      },
    ];

    apiRequestMock.mockResolvedValue(stats);

    const result = await fetchExpenseStats();

    expect(apiRequestMock).toHaveBeenCalledWith('/expenses/stats');
    expect(result).toEqual(stats);
  });

  it('fetches the expense summary for a month', async () => {
    const summary = {
      month: '2026-09',
      total: 1250.75,
    };

    apiRequestMock.mockResolvedValue(summary);

    const result = await fetchExpenseSummary('2026-09');

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/expenses/summary?month=2026-09',
    );
    expect(result).toEqual(summary);
  });

  it('fetches top expense categories with the requested limit', async () => {
    const categories = [
      {
        category: 'GROCERIES' as const,
        total: 500,
      },
      {
        category: 'UTILITIES' as const,
        total: 350,
      },
    ];

    apiRequestMock.mockResolvedValue(categories);

    const result = await fetchTopExpenseCategories(2);

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/expenses/top-categories?limit=2',
    );
    expect(result).toEqual(categories);
  });

  it('uses the default limit when fetching top expense categories', async () => {
    apiRequestMock.mockResolvedValue([]);

    await fetchTopExpenseCategories();

    expect(apiRequestMock).toHaveBeenCalledWith(
      '/expenses/top-categories?limit=5',
    );
  });

  it('creates an expense and maps the API response', async () => {
    apiRequestMock.mockResolvedValue({
      id: 'expense-1',
      amount: 75.25,
      category: 'LEISURE',
      note: 'Cinema',
      date: '2026-09-21T19:00:00.000Z',
    });

    const expense = {
      amount: 75.25,
      category: 'LEISURE' as const,
      description: 'Cinema',
      date: '2026-09-21',
    };

    const result = await createExpense(expense);

    expect(apiRequestMock).toHaveBeenCalledWith('/expenses', {
      method: 'POST',
      body: JSON.stringify({
        amount: 75.25,
        category: 'LEISURE',
        note: 'Cinema',
        date: '2026-09-21',
      }),
    });

    expect(result).toEqual({
      id: 'expense-1',
      amount: 75.25,
      category: 'LEISURE',
      description: 'Cinema',
      date: '2026-09-21',
    });
  });

  it('updates an expense and maps the API response', async () => {
    apiRequestMock.mockResolvedValue({
      id: 'expense-1',
      amount: 90,
      category: 'ELECTRONICS',
      note: 'USB cable',
      date: '2026-09-22T10:00:00.000Z',
    });

    const expense = {
      amount: 90,
      category: 'ELECTRONICS' as const,
      description: 'USB cable',
      date: '2026-09-22',
    };

    const result = await updateExpense('expense-1', expense);

    expect(apiRequestMock).toHaveBeenCalledWith('/expenses/expense-1', {
      method: 'PUT',
      body: JSON.stringify({
        amount: 90,
        category: 'ELECTRONICS',
        note: 'USB cable',
        date: '2026-09-22',
      }),
    });

    expect(result).toEqual({
      id: 'expense-1',
      amount: 90,
      category: 'ELECTRONICS',
      description: 'USB cable',
      date: '2026-09-22',
    });
  });

  it('deletes an expense', async () => {
    apiRequestMock.mockResolvedValue(undefined);

    await deleteExpense('expense-1');

    expect(apiRequestMock).toHaveBeenCalledWith('/expenses/expense-1', {
      method: 'DELETE',
    });
  });

  it('propagates API errors when fetching expenses fails', async () => {
    apiRequestMock.mockRejectedValue(new Error('Failed to fetch expenses.'));

    await expect(fetchExpenses()).rejects.toThrow(
      'Failed to fetch expenses.',
    );
  });
});
