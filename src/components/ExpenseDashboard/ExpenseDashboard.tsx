import { useEffect, useState } from 'react';

import {
  fetchExpenseStats,
  fetchExpenseSummary,
  fetchTopExpenseCategories,
} from '../../api/expenses';
import type {
  ExpenseStatsItem,
  ExpenseSummary,
} from '../../api/expenses';

interface ExpenseDashboardProps {
  month: string;
}

export function ExpenseDashboard({
  month,
}: ExpenseDashboardProps) {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [stats, setStats] = useState<ExpenseStatsItem[]>([]);
  const [topCategories, setTopCategories] = useState<ExpenseStatsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [summaryData, statsData, topCategoriesData] =
          await Promise.all([
            fetchExpenseSummary(month),
            fetchExpenseStats(),
            fetchTopExpenseCategories(),
          ]);

        setSummary(summaryData);
        setStats(statsData);
        setTopCategories(topCategoriesData);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Failed to load dashboard data.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [month]);

  if (isLoading) {
    return (
      <section className="expense-dashboard">
        <p className="expense-status" role="status">
          Loading dashboard...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="expense-dashboard">
        <p className="expense-status expense-status--error" role="alert">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="expense-dashboard">
      <div className="expense-dashboard__header">
        <div>
          <p className="expense-dashboard__eyebrow">Dashboard</p>
          <h2>Expense Overview</h2>
        </div>

        <span className="expense-dashboard__month">
          {summary?.month ?? month}
        </span>
      </div>

      <div className="expense-dashboard__summary">
        <div className="expense-dashboard__card">
          <span className="expense-dashboard__card-label">
            Monthly total
          </span>
          <strong className="expense-dashboard__card-value">
            ${(summary?.total ?? 0).toFixed(2)}
          </strong>
        </div>

        <div className="expense-dashboard__card">
          <span className="expense-dashboard__card-label">
            Categories
          </span>
          <strong className="expense-dashboard__card-value">
            {stats.length}
          </strong>
        </div>
      </div>

      <div className="expense-dashboard__sections">
        <div className="expense-dashboard__section">
          <h3>Spending by category</h3>

          {stats.length === 0 ? (
            <p className="expense-dashboard__empty">
              No expense statistics available.
            </p>
          ) : (
            <div className="expense-dashboard__list">
              {stats.map((item) => (
                <div
                  className="expense-dashboard__row"
                  key={item.category}
                >
                  <span>{item.category}</span>
                  <strong>${item.total.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="expense-dashboard__section">
          <h3>Top categories</h3>

          {topCategories.length === 0 ? (
            <p className="expense-dashboard__empty">
              No top categories available.
            </p>
          ) : (
            <div className="expense-dashboard__list">
              {topCategories.map((item, index) => (
                <div
                  className="expense-dashboard__row"
                  key={item.category}
                >
                  <span>
                    {index + 1}. {item.category}
                  </span>
                  <strong>${item.total.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
