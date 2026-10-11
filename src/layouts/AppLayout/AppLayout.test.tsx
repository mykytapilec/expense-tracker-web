import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { AppLayout } from './AppLayout';

function renderAppLayout(
  initialEntry = '/dashboard',
  onLogout = vi.fn(),
  userEmail = 'user@example.com',
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout
              userEmail={userEmail}
              onLogout={onLogout}
            />
          }
        >
          <Route
            path="dashboard"
            element={<div>Dashboard content</div>}
          />
          <Route
            path="expenses"
            element={<div>Expenses content</div>}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('AppLayout', () => {
  it('renders the application header and description', () => {
    renderAppLayout();

    expect(
      screen.getByRole('heading', { name: 'Expense Tracker' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Personal finance')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Keep track of your everyday expenses in one place.',
      ),
    ).toBeInTheDocument();
  });

  it('displays the authenticated user email', () => {
    renderAppLayout();

    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('does not display an email when userEmail is empty', () => {
    renderAppLayout('/dashboard', vi.fn(), '');

    expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
  });

  it('renders navigation links to the dashboard and expenses pages', () => {
    renderAppLayout();

    expect(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Dashboard' }),
    ).toHaveAttribute('href', '/dashboard');
    expect(
      screen.getByRole('link', { name: 'Expenses' }),
    ).toHaveAttribute('href', '/expenses');
  });

  it('marks the dashboard link as active on the dashboard route', () => {
    renderAppLayout('/dashboard');

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveClass(
      'app-navigation__link--active',
    );
    expect(screen.getByRole('link', { name: 'Expenses' })).not.toHaveClass(
      'app-navigation__link--active',
    );
  });

  it('marks the expenses link as active on the expenses route', () => {
    renderAppLayout('/expenses');

    expect(screen.getByRole('link', { name: 'Expenses' })).toHaveClass(
      'app-navigation__link--active',
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveClass(
      'app-navigation__link--active',
    );
  });

  it('calls onLogout when the logout button is clicked', () => {
    const onLogout = vi.fn();

    renderAppLayout('/dashboard', onLogout);

    fireEvent.click(screen.getByRole('button', { name: 'Log Out' }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('renders child route content through the outlet', () => {
    renderAppLayout('/dashboard');

    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });
});
