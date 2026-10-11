import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ExpenseList } from './ExpenseList';
import type { Expense } from '../../types/expense';

vi.mock('../ExpenseItem/ExpenseItem', () => ({
  ExpenseItem: ({
    expense,
    onUpdateExpense,
    onDeleteExpense,
  }: {
    expense: Expense;
    onUpdateExpense: (
      id: string,
      expense: Omit<Expense, 'id'>,
    ) => Promise<void>;
    onDeleteExpense: (id: string) => Promise<void>;
  }) => (
    <article data-testid={`expense-item-${expense.id}`}>
      <span>{expense.description}</span>
      <button
        type="button"
        onClick={() => {
          void onUpdateExpense(expense.id, {
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
          });
        }}
      >
        Update
      </button>
      <button
        type="button"
        onClick={() => {
          void onDeleteExpense(expense.id);
        }}
      >
        Delete
      </button>
    </article>
  ),
}));

const expenses: Expense[] = [
  {
    id: 'expense-1',
    description: 'Groceries',
    amount: 45.5,
    category: 'GROCERIES',
    date: '2026-10-01',
  },
  {
    id: 'expense-2',
    description: 'Cinema',
    amount: 20,
    category: 'LEISURE',
    date: '2026-10-02',
  },
];

describe('ExpenseList', () => {
  it('renders the empty state when there are no expenses', () => {
    render(
      <ExpenseList
        expenses={[]}
        onUpdateExpense={vi.fn()}
        onDeleteExpense={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Expenses' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('No expenses added yet.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId(/^expense-item-/)).not.toBeInTheDocument();
  });

  it('renders an ExpenseItem for each expense', () => {
    render(
      <ExpenseList
        expenses={expenses}
        onUpdateExpense={vi.fn()}
        onDeleteExpense={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId('expense-item-expense-1'),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId('expense-item-expense-2'),
    ).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Cinema')).toBeInTheDocument();
  });

  it('preserves the order of expenses', () => {
    render(
      <ExpenseList
        expenses={expenses}
        onUpdateExpense={vi.fn()}
        onDeleteExpense={vi.fn()}
      />,
    );

    const items = screen.getAllByTestId(/^expense-item-/);

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute('data-testid', 'expense-item-expense-1');
    expect(items[1]).toHaveAttribute('data-testid', 'expense-item-expense-2');
  });

  it('passes update and delete handlers to the correct expense', () => {
    const onUpdateExpense = vi.fn().mockResolvedValue(undefined);
    const onDeleteExpense = vi.fn().mockResolvedValue(undefined);

    render(
      <ExpenseList
        expenses={expenses}
        onUpdateExpense={onUpdateExpense}
        onDeleteExpense={onDeleteExpense}
      />,
    );

    fireEvent.click(
      screen
        .getByTestId('expense-item-expense-1')
        .querySelector('button')!,
    );
    fireEvent.click(
      screen
        .getByTestId('expense-item-expense-1')
        .querySelectorAll('button')[1],
    );

    expect(onUpdateExpense).toHaveBeenCalledWith('expense-1', {
      description: 'Groceries',
      amount: 45.5,
      category: 'GROCERIES',
      date: '2026-10-01',
    });
    expect(onDeleteExpense).toHaveBeenCalledWith('expense-1');
    expect(onUpdateExpense).toHaveBeenCalledTimes(1);
    expect(onDeleteExpense).toHaveBeenCalledTimes(1);
  });

  it('passes handlers for each expense independently', () => {
    const onUpdateExpense = vi.fn().mockResolvedValue(undefined);
    const onDeleteExpense = vi.fn().mockResolvedValue(undefined);

    render(
      <ExpenseList
        expenses={expenses}
        onUpdateExpense={onUpdateExpense}
        onDeleteExpense={onDeleteExpense}
      />,
    );

    fireEvent.click(
      screen
        .getByTestId('expense-item-expense-2')
        .querySelector('button')!,
    );
    fireEvent.click(
      screen
        .getByTestId('expense-item-expense-2')
        .querySelectorAll('button')[1],
    );

    expect(onUpdateExpense).toHaveBeenCalledWith('expense-2', {
      description: 'Cinema',
      amount: 20,
      category: 'LEISURE',
      date: '2026-10-02',
    });
    expect(onDeleteExpense).toHaveBeenCalledWith('expense-2');
  });

  it('updates the rendered list when expenses change', () => {
    const { rerender } = render(
      <ExpenseList
        expenses={expenses}
        onUpdateExpense={vi.fn()}
        onDeleteExpense={vi.fn()}
      />,
    );

    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Cinema')).toBeInTheDocument();

    rerender(
      <ExpenseList
        expenses={[expenses[1]]}
        onUpdateExpense={vi.fn()}
        onDeleteExpense={vi.fn()}
      />,
    );

    expect(screen.queryByText('Groceries')).not.toBeInTheDocument();
    expect(screen.getByText('Cinema')).toBeInTheDocument();
    expect(
      screen.queryByTestId('expense-item-expense-1'),
    ).not.toBeInTheDocument();
  });

  it('returns to the empty state when all expenses are removed', () => {
    const { rerender } = render(
      <ExpenseList
        expenses={expenses}
        onUpdateExpense={vi.fn()}
        onDeleteExpense={vi.fn()}
      />,
    );

    rerender(
      <ExpenseList
        expenses={[]}
        onUpdateExpense={vi.fn()}
        onDeleteExpense={vi.fn()}
      />,
    );

    expect(
      screen.getByText('No expenses added yet.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId(/^expense-item-/)).not.toBeInTheDocument();
  });
});
