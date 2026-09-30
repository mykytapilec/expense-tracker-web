import { useMemo } from 'react';
import type { Expense } from '../../types/expense';

interface ExpenseSummaryProps {
  expenses: Expense[];
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  const totalAmount = useMemo(
    () =>
      expenses.reduce((total, expense) => total + expense.amount, 0),
    [expenses],
  );

  return (
    <section className="expense-summary">
      <div>
        <p className="expense-summary__label">Total expenses</p>
        <strong className="expense-summary__amount">
          ${totalAmount.toFixed(2)}
        </strong>
      </div>

      <div>
        <p className="expense-summary__label">Transactions</p>
        <strong className="expense-summary__count">{expenses.length}</strong>
      </div>
    </section>
  );
}