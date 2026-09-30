import type { Expense } from '../../types/expense';

interface ExpenseItemProps {
  expense: Expense;
}

export function ExpenseItem({ expense }: ExpenseItemProps) {
  return (
    <article className="expense-item">
      <div className="expense-item__details">
        <h3>{expense.description}</h3>
        <p>
          {expense.category} · {expense.date}
        </p>
      </div>

      <strong className="expense-item__amount">
        ${expense.amount.toFixed(2)}
      </strong>
    </article>
  );
}