import { useCallback, useEffect, useState } from 'react';
import { fetchExpenses } from './api/expenses';
import { ExpenseForm } from './components/ExpenseForm/ExpenseForm';
import { ExpenseList } from './components/ExpenseList/ExpenseList';
import { ExpenseSummary } from './components/ExpenseSummary/ExpenseSummary';
import { getStoredExpenses, saveExpenses } from './utils/storage';
import type { Expense } from './types/expense';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadExpenses = async () => {
      const storedExpenses = getStoredExpenses();

      if (storedExpenses) {
        setExpenses(storedExpenses);
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchExpenses();
        setExpenses(data);
        saveExpenses(data);
      } catch {
        setError('Failed to load expenses.');
      } finally {
        setIsLoading(false);
      }
    };

    loadExpenses();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveExpenses(expenses);
    }
  }, [expenses, isLoading]);

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

        {isLoading && (
          <p className="expense-status" role="status">
            Loading expenses...
          </p>
        )}

        {error && (
          <p className="expense-status expense-status--error" role="alert">
            {error}
          </p>
        )}

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