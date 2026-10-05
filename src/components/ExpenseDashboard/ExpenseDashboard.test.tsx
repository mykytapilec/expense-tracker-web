import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  fetchExpenseStats,
  fetchExpenseSummary,
  fetchTopExpenseCategories,
} from '../../api/expenses';
import { ExpenseDashboard } from './ExpenseDashboard';

vi.mock('../../api/expenses', () => ({
  fetchExpenseStats: vi.fn(),
  fetchExpenseSummary: vi.fn(),
  fetchTopExpenseCategories: vi.fn(),
}));

const fetchExpenseStatsMock = vi.mocked(fetchExpenseStats);
const fetchExpenseSummaryMock = vi.mocked(fetchExpenseSummary);
const fetchTopExpenseCategoriesMock = vi.mocked(
  fetchTopExpenseCategories,
);

describe('ExpenseDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    fetchExpenseStatsMock.mockResolvedValue([
      {
        category: 'GROCERIES',
        total: 250,
      },
      {
        category: 'LEISURE',
        total: 150,
      },
    ]);

    fetchExpenseSummaryMock.mockResolvedValue({
      month: '2026-10',
      total: 400,
    });

    fetchTopExpenseCategoriesMock.mockResolvedValue([
      {
        category: 'GROCERIES',
        total: 250,
      },
      {
        category: 'LEISURE',
        total: 150,
      },
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads dashboard data for the selected month', async () => {
    render(<ExpenseDashboard month="2026-10" />);

    await waitFor(() => {
      expect(fetchExpenseStatsMock).toHaveBeenCalledTimes(1);
      expect(fetchExpenseSummaryMock).toHaveBeenCalledTimes(1);
      expect(fetchTopExpenseCategoriesMock).toHaveBeenCalledTimes(1);
    });

    expect(fetchExpenseSummaryMock).toHaveBeenCalledWith('2026-10');
    expect(fetchExpenseStatsMock).toHaveBeenCalledWith();
    expect(fetchTopExpenseCategoriesMock).toHaveBeenCalledWith();
  });

  it('displays the monthly total', async () => {
    render(<ExpenseDashboard month="2026-10" />);

    expect(await screen.findByText('Monthly total')).toBeInTheDocument();
    expect(screen.getByText('2026-10')).toBeInTheDocument();
    expect(screen.getByText('$400.00')).toBeInTheDocument();
  });

  it('displays expense statistics by category', async () => {
    render(<ExpenseDashboard month="2026-10" />);

    expect(await screen.findByText('GROCERIES')).toBeInTheDocument();
    expect(screen.getByText('LEISURE')).toBeInTheDocument();
  });

  it('displays top expense categories', async () => {
    render(<ExpenseDashboard month="2026-10" />);

    expect(await screen.findByText('Top categories')).toBeInTheDocument();
    expect(screen.getAllByText('GROCERIES').length).toBeGreaterThan(0);
    expect(screen.getAllByText('LEISURE').length).toBeGreaterThan(0);
  });

  it('displays a loading state while dashboard data is loading', () => {
    fetchExpenseStatsMock.mockReturnValue(new Promise(() => {}));
    fetchExpenseSummaryMock.mockReturnValue(new Promise(() => {}));
    fetchTopExpenseCategoriesMock.mockReturnValue(new Promise(() => {}));

    render(<ExpenseDashboard month="2026-10" />);

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('displays an error when dashboard data loading fails', async () => {
    fetchExpenseStatsMock.mockRejectedValue(
      new Error('Failed to load dashboard.'),
    );

    render(<ExpenseDashboard month="2026-10" />);

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Failed to load dashboard.');
  });

  it('reloads dashboard data when the month changes', async () => {
    const { rerender } = render(
      <ExpenseDashboard month="2026-10" />,
    );

    await waitFor(() => {
      expect(fetchExpenseSummaryMock).toHaveBeenCalledWith('2026-10');
    });

    rerender(<ExpenseDashboard month="2026-09" />);

    await waitFor(() => {
      expect(fetchExpenseSummaryMock).toHaveBeenCalledWith('2026-09');
    });

    expect(fetchExpenseSummaryMock).toHaveBeenCalledTimes(2);
    expect(fetchExpenseStatsMock).toHaveBeenCalledTimes(2);
    expect(fetchTopExpenseCategoriesMock).toHaveBeenCalledTimes(2);
  });
});
