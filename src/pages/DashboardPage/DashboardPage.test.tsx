import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DashboardPage } from './DashboardPage';

const expenseDashboardMock = vi.fn();

vi.mock('../../components/ExpenseDashboard/ExpenseDashboard', () => ({
  ExpenseDashboard: (props: { month: string }) => {
    expenseDashboardMock(props);

    return (
      <div data-testid="expense-dashboard">
        Dashboard for {props.month}
      </div>
    );
  },
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    expenseDashboardMock.mockClear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-05T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the dashboard for the current month', () => {
    render(<DashboardPage />);

    expect(screen.getByTestId('expense-dashboard')).toHaveTextContent(
      'Dashboard for 2026-10',
    );
    expect(expenseDashboardMock).toHaveBeenCalledWith({
      month: '2026-10',
    });
  });

  it('changes the dashboard month', () => {
    render(<DashboardPage />);

    const monthInput = screen.getByLabelText('Dashboard month');

    fireEvent.change(monthInput, {
      target: {
        value: '2026-09',
      },
    });

    expect(monthInput).toHaveValue('2026-09');
    expect(screen.getByTestId('expense-dashboard')).toHaveTextContent(
      'Dashboard for 2026-09',
    );
    expect(expenseDashboardMock).toHaveBeenLastCalledWith({
      month: '2026-09',
    });
  });
});
