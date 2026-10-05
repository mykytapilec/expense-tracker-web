import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createExpense,
  deleteExpense,
  fetchExpenses,
  updateExpense,
} from '../../api/expenses';
import type {
  Expense,
  ExpenseCategory,
} from '../../types/expense';
import { ExpensesPage } from './ExpensesPage';

vi.mock('../../api/expenses', () => ({
  createExpense: vi.fn(),
  deleteExpense: vi.fn(),
  fetchExpenses: vi.fn(),
  updateExpense: vi.fn(),
}));

vi.mock('../../components/ExpenseForm/ExpenseForm', () => ({
  ExpenseForm: ({
    onAddExpense,
    isSubmitting,
  }: {
    onAddExpense: (expense: Expense) => Promise<void>;
    isSubmitting: boolean;
  }) => (
    <div>
      <button
        type="button"
        disabled={isSubmitting}
        onClick={() =>
          void onAddExpense({
            id: 'new-expense',
            description: 'New expense',
            amount: 25,
            category: 'GROCERIES',
            date: '2026-09-30',
          })
        }
      >
        Add Mock Expense
      </button>
    </div>
  ),
}));

vi.mock('../../components/ExpenseFilters/ExpenseFilters', () => ({
  ExpenseFilters: ({
    onApply,
    onClear,
    isLoading,
  }: {
    onApply: (filters: {
      category?: ExpenseCategory;
      startDate?: string;
      endDate?: string;
    }) => void;
    onClear: () => void;
    isLoading: boolean;
  }) => (
    <div>
      <button
        type="button"
        disabled={isLoading}
        onClick={() =>
          onApply({
            category: 'GROCERIES',
            startDate: '2026-09-01',
            endDate: '2026-09-30',
          })
        }
      >
        Apply Mock Filters
      </button>

      <button
        type="button"
        disabled={isLoading}
        onClick={onClear}
      >
        Clear Mock Filters
      </button>
    </div>
  ),
}));

vi.mock('../../components/ExpenseSummary/ExpenseSummary', () => ({
  ExpenseSummary: ({ expenses }: { expenses: Expense[] }) => (
    <div data-testid="expense-summary">
      <span>Total expenses: {expenses.length}</span>
    </div>
  ),
}));

vi.mock('../../components/ExpenseList/ExpenseList', () => ({
  ExpenseList: ({
    expenses,
    onUpdateExpense,
    onDeleteExpense,
  }: {
    expenses: Expense[];
    onUpdateExpense: (
      id: string,
      expense: Omit<Expense, 'id'>,
    ) => Promise<void>;
    onDeleteExpense: (id: string) => Promise<void>;
  }) => (
    <div data-testid="expense-list">
      {expenses.map((expense) => (
        <div key={expense.id}>
          <span>{expense.description}</span>
          <span>{expense.category}</span>

          <button
            type="button"
            onClick={() => {
              void onUpdateExpense(expense.id, {
                amount: expense.amount + 10,
                category: expense.category,
                description: 'Updated expense',
                date: expense.date,
              }).catch(() => undefined);
            }}
          >
            Update {expense.id}
          </button>

          <button
            type="button"
            onClick={() => {
              void onDeleteExpense(expense.id).catch(() => undefined);
            }}
          >
            Delete {expense.id}
          </button>
        </div>
      ))}
    </div>
  ),
}));

const fetchExpensesMock = vi.mocked(fetchExpenses);
const createExpenseMock = vi.mocked(createExpense);
const updateExpenseMock = vi.mocked(updateExpense);
const deleteExpenseMock = vi.mocked(deleteExpense);

const firstExpense: Expense = {
  id: 'expense-1',
  description: 'First page expense',
  amount: 50,
  category: 'GROCERIES',
  date: '2026-09-30',
};

const secondExpense: Expense = {
  id: 'expense-2',
  description: 'Filtered groceries',
  amount: 75,
  category: 'GROCERIES',
  date: '2026-09-29',
};

const createdExpense: Expense = {
  id: 'expense-3',
  description: 'New expense',
  amount: 25,
  category: 'GROCERIES',
  date: '2026-09-30',
};

function mockInitialExpenses(
  total = 1,
  data: Expense[] = [firstExpense],
) {
  fetchExpensesMock.mockResolvedValue({
    page: 1,
    limit: 10,
    total,
    data,
  });
}

function renderPage() {
  return render(<ExpensesPage />);
}

describe('ExpensesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays expenses', async () => {
    let resolveRequest!: (value: {
      page: number;
      limit: number;
      total: number;
      data: Expense[];
    }) => void;

    fetchExpensesMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    renderPage();

    expect(
      screen.getByText('Loading expenses...'),
    ).toBeInTheDocument();

    resolveRequest({
      page: 1,
      limit: 10,
      total: 1,
      data: [firstExpense],
    });

    expect(
      await screen.findByText('First page expense'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Total expenses: 1'),
    ).toBeInTheDocument();

    expect(fetchExpensesMock).toHaveBeenCalledWith({}, 1, 10);
  });

  it('displays an error when loading expenses fails', async () => {
    fetchExpensesMock.mockRejectedValue(
      new Error('Failed to load expenses.'),
    );

    renderPage();

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Failed to load expenses.');

    expect(
      screen.queryByTestId('expense-list'),
    ).not.toBeInTheDocument();
  });

  it('creates an expense and updates the list', async () => {
    mockInitialExpenses();

    createExpenseMock.mockResolvedValue(createdExpense);

    renderPage();

    expect(
      await screen.findByText('First page expense'),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add Mock Expense',
      }),
    );

    expect(
      await screen.findByText('New expense'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Total expenses: 2'),
    ).toBeInTheDocument();

    expect(createExpenseMock).toHaveBeenCalledWith({
      amount: 25,
      category: 'GROCERIES',
      description: 'New expense',
      date: '2026-09-30',
    });
  });

  it('displays an error when creating an expense fails', async () => {
    mockInitialExpenses();

    createExpenseMock.mockRejectedValue(
      new Error('Failed to create expense.'),
    );

    renderPage();

    expect(
      await screen.findByText('First page expense'),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add Mock Expense',
      }),
    );

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Failed to create expense.');

    expect(
      screen.queryByTestId('expense-list'),
    ).not.toBeInTheDocument();
  });

  it('updates an expense and replaces it in the list', async () => {
    mockInitialExpenses();

    const updatedExpense: Expense = {
      ...firstExpense,
      description: 'Updated expense',
      amount: 60,
    };

    updateExpenseMock.mockResolvedValue(updatedExpense);

    renderPage();

    const list = await screen.findByTestId('expense-list');

    expect(
      within(list).getByText('First page expense'),
    ).toBeInTheDocument();

    fireEvent.click(
      within(list).getByRole('button', {
        name: 'Update expense-1',
      }),
    );

    expect(
      await within(list).findByText('Updated expense'),
    ).toBeInTheDocument();

    expect(updateExpenseMock).toHaveBeenCalledWith(
      'expense-1',
      {
        amount: 60,
        category: 'GROCERIES',
        description: 'Updated expense',
        date: '2026-09-30',
      },
    );
  });

  it('displays an error when updating an expense fails', async () => {
    mockInitialExpenses();

    updateExpenseMock.mockRejectedValue(
      new Error('Failed to update expense.'),
    );

    renderPage();

    const list = await screen.findByTestId('expense-list');

    fireEvent.click(
      within(list).getByRole('button', {
        name: 'Update expense-1',
      }),
    );

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Failed to update expense.');

    expect(
      screen.queryByTestId('expense-list'),
    ).not.toBeInTheDocument();
  });

  it('deletes an expense and updates the total', async () => {
    mockInitialExpenses();

    deleteExpenseMock.mockResolvedValue(undefined);

    renderPage();

    const list = await screen.findByTestId('expense-list');

    expect(
      within(list).getByText('First page expense'),
    ).toBeInTheDocument();

    fireEvent.click(
      within(list).getByRole('button', {
        name: 'Delete expense-1',
      }),
    );

    await waitFor(() => {
      expect(
        within(list).queryByText('First page expense'),
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByText('Total expenses: 0'),
    ).toBeInTheDocument();

    expect(deleteExpenseMock).toHaveBeenCalledWith(
      'expense-1',
    );
  });

  it('displays an error when deleting an expense fails', async () => {
    mockInitialExpenses();

    deleteExpenseMock.mockRejectedValue(
      new Error('Failed to delete expense.'),
    );

    renderPage();

    const list = await screen.findByTestId('expense-list');

    fireEvent.click(
      within(list).getByRole('button', {
        name: 'Delete expense-1',
      }),
    );

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent('Failed to delete expense.');

    expect(
      screen.queryByTestId('expense-list'),
    ).not.toBeInTheDocument();
  });

  it('applies filters and reloads expenses from the first page', async () => {
    fetchExpensesMock.mockImplementation(
      async (filters = {}, page = 1, limit = 10) => {
        if (
          filters.category === 'GROCERIES' &&
          filters.startDate === '2026-09-01' &&
          filters.endDate === '2026-09-30'
        ) {
          return {
            page: 1,
            limit,
            total: 1,
            data: [secondExpense],
          };
        }

        return {
          page,
          limit,
          total: 20,
          data: [firstExpense],
        };
      },
    );

    renderPage();

    const initialList = await screen.findByTestId('expense-list');

    expect(
      within(initialList).getByText('First page expense'),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Apply Mock Filters',
      }),
    );

    const filteredList = await screen.findByTestId(
      'expense-list',
    );

    expect(
      within(filteredList).getByText('Filtered groceries'),
    ).toBeInTheDocument();

    expect(
      within(filteredList).queryByText('First page expense'),
    ).not.toBeInTheDocument();

    expect(fetchExpensesMock).toHaveBeenLastCalledWith(
      {
        category: 'GROCERIES',
        startDate: '2026-09-01',
        endDate: '2026-09-30',
      },
      1,
      10,
    );
  });

  it('clears filters and reloads expenses from the first page', async () => {
    fetchExpensesMock.mockImplementation(
      async (filters = {}, page = 1, limit = 10) => {
        if (filters.category === 'GROCERIES') {
          return {
            page,
            limit,
            total: 1,
            data: [secondExpense],
          };
        }

        return {
          page,
          limit,
          total: 1,
          data: [firstExpense],
        };
      },
    );

    renderPage();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Apply Mock Filters',
      }),
    );

    const filteredList = await screen.findByTestId(
      'expense-list',
    );

    expect(
      within(filteredList).getByText('Filtered groceries'),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Clear Mock Filters',
      }),
    );

    const clearedList = await screen.findByTestId(
      'expense-list',
    );

    expect(
      within(clearedList).getByText('First page expense'),
    ).toBeInTheDocument();

    expect(
      within(clearedList).queryByText('Filtered groceries'),
    ).not.toBeInTheDocument();

    expect(fetchExpensesMock).toHaveBeenLastCalledWith(
      {},
      1,
      10,
    );
  });

  it('paginates to the next and previous pages', async () => {
    const secondPageExpense: Expense = {
      ...firstExpense,
      id: 'expense-2',
      description: 'Second page expense',
    };

    fetchExpensesMock.mockImplementation(
      async (
        filters = {},
        page = 1,
        limit = 10,
      ) => {
        void filters;

        if (page === 2) {
          return {
            page: 2,
            limit,
            total: 20,
            data: [secondPageExpense],
          };
        }

        return {
          page: 1,
          limit,
          total: 20,
          data: [firstExpense],
        };
      },
    );

    renderPage();

    const initialList = await screen.findByTestId('expense-list');

    expect(
      within(initialList).getByText('First page expense'),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Next',
      }),
    );

    const secondPageList = await screen.findByTestId(
      'expense-list',
    );

    expect(
      within(secondPageList).getByText('Second page expense'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Page 2 of 2'),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Previous',
      }),
    );

    const firstPageList = await screen.findByTestId(
      'expense-list',
    );

    expect(
      within(firstPageList).getByText('First page expense'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Page 1 of 2'),
    ).toBeInTheDocument();

    expect(fetchExpensesMock).toHaveBeenNthCalledWith(
      1,
      {},
      1,
      10,
    );

    expect(fetchExpensesMock).toHaveBeenNthCalledWith(
      2,
      {},
      2,
      10,
    );

    expect(fetchExpensesMock).toHaveBeenNthCalledWith(
      3,
      {},
      1,
      10,
    );
  });

  it('disables pagination buttons on the first and last pages', async () => {
    const secondPageExpense: Expense = {
      ...firstExpense,
      id: 'expense-2',
      description: 'Second page expense',
    };

    fetchExpensesMock.mockImplementation(
      async (
        filters = {},
        page = 1,
        limit = 10,
      ) => {
        void filters;

        if (page === 2) {
          return {
            page: 2,
            limit,
            total: 20,
            data: [secondPageExpense],
          };
        }

        return {
          page: 1,
          limit,
          total: 20,
          data: [firstExpense],
        };
      },
    );

    renderPage();

    expect(
      await screen.findByText('First page expense'),
    ).toBeInTheDocument();

    const previousButton = screen.getByRole('button', {
      name: 'Previous',
    });

    const nextButton = screen.getByRole('button', {
      name: 'Next',
    });

    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeEnabled();

    fireEvent.click(nextButton);

    expect(
      await screen.findByText('Second page expense'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Previous',
      }),
    ).toBeEnabled();

    expect(
      screen.getByRole('button', {
        name: 'Next',
      }),
    ).toBeDisabled();
  });
});
