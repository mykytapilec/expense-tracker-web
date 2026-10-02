import { useState } from 'react';
import type { ExpenseCategory } from '../../types/expense';

interface ExpenseFiltersProps {
  onApply: (filters: {
    category?: ExpenseCategory;
    startDate?: string;
    endDate?: string;
  }) => void;
  onClear: () => void;
  isLoading: boolean;
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

export function ExpenseFilters({
  onApply,
  onClear,
  isLoading,
}: ExpenseFiltersProps) {
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onApply({
      category: category || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleClear = () => {
    setCategory('');
    setStartDate('');
    setEndDate('');
    onClear();
  };

  return (
    <form className="expense-filters" onSubmit={handleSubmit}>
      <div className="expense-filters__field">
        <label htmlFor="filter-category">Category</label>
        <select
          id="filter-category"
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as ExpenseCategory | '')
          }
          disabled={isLoading}
        >
          <option value="">All categories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="expense-filters__field">
        <label htmlFor="filter-start-date">From</label>
        <input
          id="filter-start-date"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="expense-filters__field">
        <label htmlFor="filter-end-date">To</label>
        <input
          id="filter-end-date"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="expense-filters__actions">
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Apply Filters'}
        </button>

        <button type="button" onClick={handleClear} disabled={isLoading}>
          Clear
        </button>
      </div>
    </form>
  );
}