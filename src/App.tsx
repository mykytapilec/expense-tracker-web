import { useCallback, useEffect, useState } from 'react';

import { getToken, removeToken } from './api/auth';
import {
  createExpense,
  deleteExpense,
  fetchExpenses,
  updateExpense,
} from './api/expenses';
import { Auth } from './components/Auth/Auth';
import { ExpenseForm } from './components/ExpenseForm/ExpenseForm';
import { ExpenseList } from './components/ExpenseList/ExpenseList';
import { ExpenseSummary } from './components/ExpenseSummary/ExpenseSummary';
import type { Expense } from './types/expense';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => getToken() !== null,
  );
  const [userEmail, setUserEmail] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(() => getToken() !== null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadExpenses = async () => {
      try {
        const data = await fetchExpenses();
        setExpenses(data);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Failed to load expenses.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadExpenses();
  }, [isAuthenticated]);

  const handleAuthenticated = useCallback((email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    setIsLoading(true);
    setError('');
  }, []);

  const handleLogout = useCallback(() => {
    removeToken();
    setIsAuthenticated(false);
    setUserEmail('');
    setExpenses([]);
    setError('');
  }, []);

  const handleAddExpense = useCallback(async (expense: Expense) => {
    setError('');
    setIsCreating(true);

    try {
      const createdExpense = await createExpense({
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: expense.date,
      });

      setExpenses((currentExpenses) => [
        createdExpense,
        ...currentExpenses,
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to create expense.',
      );
    } finally {
      setIsCreating(false);
    }
  }, []);

  const handleUpdateExpense = useCallback(
    async (id: string, expense: Omit<Expense, 'id'>) => {
      setError('');

      try {
        const updatedExpense = await updateExpense(id, {
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: expense.date,
        });

        setExpenses((currentExpenses) =>
          currentExpenses.map((currentExpense) =>
            currentExpense.id === id ? updatedExpense : currentExpense,
          ),
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Failed to update expense.',
        );
        throw requestError;
      }
    },
    [],
  );

  const handleDeleteExpense = useCallback(async (id: string) => {
    setError('');

    try {
      await deleteExpense(id);

      setExpenses((currentExpenses) =>
        currentExpenses.filter((expense) => expense.id !== id),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to delete expense.',
      );
      throw requestError;
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <main className="app">
        <Auth onAuthenticated={handleAuthenticated} />
      </main>
    );
  }

  return (
    <main className="app">
      <section className="expense-tracker">
        <header className="expense-tracker__header">
          <div>
            <p className="expense-tracker__eyebrow">Personal finance</p>
            <h1>Expense Tracker</h1>
            <p className="expense-tracker__description">
              Keep track of your everyday expenses in one place.
            </p>
          </div>

          <div className="expense-tracker__account">
            {userEmail && <span>{userEmail}</span>}
            <button type="button" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </header>

        <ExpenseForm
          onAddExpense={handleAddExpense}
          isSubmitting={isCreating}
        />

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
            <ExpenseList
              expenses={expenses}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          </>
        )}
      </section>
    </main>
  );
}

export default App;