import { useCallback, useEffect, useState } from 'react';
import { fetchExpenses } from './api/expenses';
import { ExpenseForm } from './components/ExpenseForm/ExpenseForm';
import { ExpenseList } from './components/ExpenseList/ExpenseList';
import { ExpenseSummary } from './components/ExpenseSummary/ExpenseSummary';
import type { Expense } from './types/expense';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const data = await fetchExpenses();
        setExpenses(data);
      } catch {
        setError('Failed to load expenses.');
      } finally {
        setIsLoading(false);
      }
    };

    loadExpenses();
  }, []);

  const handleAddExpense = useCallback((expense: Expense) => {
    setExpenses((currentExpenses) => [...currentExpenses, expense]);
  }, []);

  return (
    <main className="app">
      <section className="expense-tracker">
        <header className="expense-tracker__header">
          <p className="expense-tracker__eyebrow">Personal finance</p>
          <h1>Expense Tracker</h1>
          <p className="expense-tracker__description">
            Keep track of your everyday expenses in one place.
          </p>
        </header>

        <ExpenseForm onAddExpense={handleAddExpense} />

        {isLoading && <p>Loading expenses...</p>}
        {error && <p>{error}</p>}
        {!isLoading && !error && (
          <>
            <ExpenseSummary expenses={expenses} />
            <ExpenseList expenses={expenses} />
          </>
        )}
      </section>
    </main>
  );
}

export default App;