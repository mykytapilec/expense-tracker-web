import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Expense, ExpenseCategory } from '../../types/expense';

interface ExpenseFormProps {
  onAddExpense: (expense: Expense) => Promise<void>;
  isSubmitting: boolean;
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

export function ExpenseForm({
  onAddExpense,
  isSubmitting,
}: ExpenseFormProps) {
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('OTHERS');
  const [date, setDate] = useState(
    () => new Date().toISOString().split('T')[0],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!description.trim() || !amount || parsedAmount <= 0 || !date) {
      return;
    }

    const expense: Expense = {
      id: '',
      description: description.trim(),
      amount: parsedAmount,
      category,
      date,
    };

    await onAddExpense(expense);

    setDescription('');
    setAmount('');
    setCategory('OTHERS');
    setDate(new Date().toISOString().split('T')[0]);

    descriptionInputRef.current?.focus();
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <div className="expense-form__fields">
        <div className="form-field form-field--description">
          <label htmlFor="description">Description</label>
          <input
            ref={descriptionInputRef}
            id="description"
            name="description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter expense description"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-field">
          <label htmlFor="amount">Amount</label>
          <div className="amount-input">
            <span className="amount-input__prefix">$</span>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as ExpenseCategory)
            }
            disabled={isSubmitting}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <button
        className="expense-form__submit"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding Expense...' : 'Add Expense'}
      </button>
    </form>
  );
}
