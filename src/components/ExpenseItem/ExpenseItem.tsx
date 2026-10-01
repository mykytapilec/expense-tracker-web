import { useState } from 'react';
import type { Expense, ExpenseCategory } from '../../types/expense';

interface ExpenseItemProps {
  expense: Expense;
  onUpdateExpense: (
    id: string,
    expense: Omit<Expense, 'id'>,
  ) => Promise<void>;
  onDeleteExpense: (id: string) => Promise<void>;
}

const categories: ExpenseCategory[] = [
  'GROCERIES',
  'LEISURE',
  'ELECTRONICS',
  'UTILITIES',
  'CLOTHING',
  'HEALTH',
  'OTHERS',
];

export function ExpenseItem({
  expense,
  onUpdateExpense,
  onDeleteExpense,
}: ExpenseItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [date, setDate] = useState(expense.date);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdate = async () => {
    const parsedAmount = Number(amount);

    if (!description.trim() || !amount || parsedAmount <= 0 || !date) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onUpdateExpense(expense.id, {
        description: description.trim(),
        amount: parsedAmount,
        category,
        date,
      });

      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);

    try {
      await onDeleteExpense(expense.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setDescription(expense.description);
    setAmount(String(expense.amount));
    setCategory(expense.category);
    setDate(expense.date);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <article className="expense-item expense-item--editing">
        <div className="expense-item__edit-fields">
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isSubmitting}
            aria-label="Expense description"
          />

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            disabled={isSubmitting}
            aria-label="Expense amount"
          />

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as ExpenseCategory)
            }
            disabled={isSubmitting}
            aria-label="Expense category"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            disabled={isSubmitting}
            aria-label="Expense date"
          />
        </div>

        <div className="expense-item__actions">
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </article>
    );
  }

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

      <div className="expense-item__actions">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          disabled={isSubmitting}
        >
          Edit
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </article>
  );
}