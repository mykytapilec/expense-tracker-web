import { useState } from 'react';

import { ExpenseDashboard } from '../../components/ExpenseDashboard/ExpenseDashboard';

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function DashboardPage() {
  const [dashboardMonth, setDashboardMonth] = useState(getCurrentMonth);

  return (
    <>
      <ExpenseDashboard month={dashboardMonth} />

      <div className="expense-dashboard__month-control">
        <label htmlFor="dashboard-month">Dashboard month</label>
        <input
          id="dashboard-month"
          type="month"
          value={dashboardMonth}
          onChange={(event) => setDashboardMonth(event.target.value)}
        />
      </div>
    </>
  );
}
