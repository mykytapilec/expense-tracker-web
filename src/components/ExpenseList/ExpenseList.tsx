import { ExpenseItem } from '../ExpenseItem/ExpenseItem';
import type { Expense } from '../../types/expense';

interface ExpenseListProps {
  expenses: Expense[];
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <section className="expense-list">
        <h2>Expenses</h2>
        <p className="expense-list__empty">No expenses added yet.</p>
      </section>
    );
  }

  return (
    <section className="expense-list">
      <h2>Expenses</h2>

      <div className="expense-list__items">
        {expenses.map((expense) => (
          <ExpenseItem key={expense.id} expense={expense} />
        ))}
      </div>
    </section>
  );
}