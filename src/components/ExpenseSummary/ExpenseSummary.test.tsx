import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ExpenseSummary } from './ExpenseSummary';
import type { Expense } from '../../types/expense';

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

describe('ExpenseSummary', () => {
  it('renders the total amount and transaction count', () => {
    render(<ExpenseSummary expenses={expenses} />);

    expect(screen.getByText('Total expenses')).toBeInTheDocument();
    expect(screen.getByText('$65.50')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders zero values when there are no expenses', () => {
    render(<ExpenseSummary expenses={[]} />);

    expect(screen.getByText('$0.00')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('formats the total amount to two decimal places', () => {
    const expensesWithDecimals: Expense[] = [
      {
        id: 'expense-3',
        description: 'Coffee',
        amount: 4.2,
        category: 'GROCERIES',
        date: '2026-10-03',
      },
      {
        id: 'expense-4',
        description: 'Lunch',
        amount: 8.35,
        category: 'GROCERIES',
        date: '2026-10-04',
      },
    ];

    render(<ExpenseSummary expenses={expensesWithDecimals} />);

    expect(screen.getByText('$12.55')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('updates the summary when the expenses change', () => {
    const { rerender } = render(
      <ExpenseSummary expenses={[expenses[0]]} />,
    );

    expect(screen.getByText('$45.50')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    rerender(<ExpenseSummary expenses={expenses} />);

    expect(screen.getByText('$65.50')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});