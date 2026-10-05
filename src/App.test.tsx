import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

vi.mock('./pages/LoginPage/LoginPage', () => ({
  LoginPage: ({
    onAuthenticated,
  }: {
    onAuthenticated: (email: string) => void;
  }) => (
    <div>
      <h1>Login Page</h1>
      <button
        type="button"
        onClick={() => onAuthenticated('user@example.com')}
      >
        Mock Login
      </button>
    </div>
  ),
}));

vi.mock('./layouts/AppLayout/AppLayout', () => ({
  AppLayout: ({
    userEmail,
    onLogout,
  }: {
    userEmail: string;
    onLogout: () => void;
  }) => (
    <div>
      <h1>App Layout</h1>
      <p>{userEmail}</p>
      <button type="button" onClick={onLogout}>
        Logout
      </button>
    </div>
  ),
}));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the login page when the user is not authenticated', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Login Page' }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('heading', { name: 'App Layout' }),
    ).not.toBeInTheDocument();
  });

  it('renders the app layout when authentication data exists', () => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('authUserEmail', 'user@example.com');

    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'App Layout' }),
    ).toBeInTheDocument();

    expect(screen.getByText('user@example.com')).toBeInTheDocument();

    expect(
      screen.queryByRole('heading', { name: 'Login Page' }),
    ).not.toBeInTheDocument();
  });

  it('passes the stored user email to the app layout', () => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('authUserEmail', 'stored@example.com');

    render(<App />);

    expect(
      screen.getByText('stored@example.com'),
    ).toBeInTheDocument();
  });

  it('switches to the app layout after successful login', async () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Mock Login' }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'App Layout' }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('clears authentication and returns to the login page after logout', async () => {
    localStorage.setItem('authToken', 'test-token');
    localStorage.setItem('authUserEmail', 'user@example.com');

    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'App Layout' }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Logout' }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Login Page' }),
      ).toBeInTheDocument();
    });

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('authUserEmail')).toBeNull();
  });
});
