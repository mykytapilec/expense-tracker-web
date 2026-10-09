import { render, screen } from '@testing-library/react';
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

  it('passes update and delete handlers to ExpenseItem', async () => {
    const onUpdateExpense = vi.fn().mockResolvedValue(undefined);
    const onDeleteExpense = vi.fn().mockResolvedValue(undefined);

    render(
      <ExpenseList
        expenses={expenses}
        onUpdateExpense={onUpdateExpense}
        onDeleteExpense={onDeleteExpense}
      />,
    );

    const firstItem = screen.getByTestId('expense-item-expense-1');

    firstItem.querySelector<HTMLButtonElement>('button')?.click();
    firstItem.querySelectorAll<HTMLButtonElement>('button')[1]?.click();

    expect(onUpdateExpense).toHaveBeenCalledWith('expense-1', {
      description: 'Groceries',
      amount: 45.5,
      category: 'GROCERIES',
      date: '2026-10-01',
    });
    expect(onDeleteExpense).toHaveBeenCalledWith('expense-1');
  });
});
