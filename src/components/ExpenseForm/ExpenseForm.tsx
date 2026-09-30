import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Expense, ExpenseCategory } from '../../types/expense';

interface ExpenseFormProps {
  onAddExpense: (expense: Expense) => void;
}

const categories: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

export function ExpenseForm({ onAddExpense }: ExpenseFormProps) {
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Other');
  const [date, setDate] = useState(
    () => new Date().toISOString().split('T')[0],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (!description.trim() || !amount || parsedAmount <= 0 || !date) {
      return;
    }

    const expense: Expense = {
      id: crypto.randomUUID(),
      description: description.trim(),
      amount: parsedAmount,
      category,
      date,
    };

    onAddExpense(expense);

    setDescription('');
    setAmount('');
    setCategory('Other');
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
          />
        </div>
      </div>

      <button className="expense-form__submit" type="submit">
        Add Expense
      </button>
    </form>
  );
}