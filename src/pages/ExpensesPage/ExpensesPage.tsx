import { useCallback, useEffect, useState } from 'react';

import {
  createExpense,
  deleteExpense,
  fetchExpenses,
  updateExpense,
} from '../../api/expenses';
import { ExpenseFilters } from '../../components/ExpenseFilters/ExpenseFilters';
import { ExpenseForm } from '../../components/ExpenseForm/ExpenseForm';
import { ExpenseList } from '../../components/ExpenseList/ExpenseList';
import { ExpenseSummary } from '../../components/ExpenseSummary/ExpenseSummary';
import type { Expense, ExpenseCategory } from '../../types/expense';

interface ExpenseFiltersState {
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
}

export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const pageSize = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filters, setFilters] = useState<ExpenseFiltersState>({});
  const [error, setError] = useState('');

  const totalPages = Math.ceil(totalExpenses / pageSize);

  useEffect(() => {
    const loadExpenses = async () => {
      setIsLoading(true);
      setError('');

      try {
        const result = await fetchExpenses(
          filters,
          currentPage,
          pageSize,
        );

        setExpenses(result.data);
        setTotalExpenses(result.total);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Failed to load expenses.',
        );
      } finally {
        setIsLoading(false);
        setIsFiltering(false);
      }
    };

    loadExpenses();
  }, [filters, currentPage]);

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
      setTotalExpenses((currentTotal) => currentTotal + 1);
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
      setTotalExpenses((currentTotal) => Math.max(0, currentTotal - 1));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to delete expense.',
      );
      throw requestError;
    }
  }, []);

  const handleApplyFilters = useCallback(
    (nextFilters: ExpenseFiltersState) => {
      setError('');
      setIsFiltering(true);
      setCurrentPage(1);
      setFilters(nextFilters);
    },
    [],
  );

  const handleClearFilters = useCallback(() => {
    setError('');
    setIsFiltering(true);
    setCurrentPage(1);
    setFilters({});
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((page) => Math.max(1, page - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((page) => Math.min(totalPages, page + 1));
  }, [totalPages]);

  return (
    <>
      <ExpenseForm
        onAddExpense={handleAddExpense}
        isSubmitting={isCreating}
      />

      <ExpenseFilters
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        isLoading={isFiltering}
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

          {totalPages > 1 && (
            <nav
              className="expense-pagination"
              aria-label="Expenses pagination"
            >
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || isLoading}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
