import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { login } from '../../api/auth';
import { LoginPage } from './LoginPage';

vi.mock('../../api/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api/auth')>();

  return {
    ...actual,
    login: vi.fn(),
  };
});

const loginMock = vi.mocked(login);

function renderLoginPage(onAuthenticated = vi.fn()) {
  return render(
    <MemoryRouter>
      <LoginPage onAuthenticated={onAuthenticated} />
    </MemoryRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the login form', () => {
    renderLoginPage();

    expect(
      screen.getByRole('heading', { name: /welcome back/i }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /log in/i }),
    ).toBeInTheDocument();
  });

  it('updates email and password fields', () => {
    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, {
      target: { value: 'user@example.com' },
    });

    fireEvent.change(passwordInput, {
      target: { value: 'password123' },
    });

    expect(emailInput).toHaveValue('user@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('submits the login credentials', async () => {
    loginMock.mockResolvedValue({
      token: 'test-token',
      user: {
        id: 'user-1',
        email: 'user@example.com',
      },
    });

    const onAuthenticated = vi.fn();

    renderLoginPage(onAuthenticated);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /log in/i }),
    );

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });

  it('stores authentication data and notifies the parent after successful login', async () => {
    loginMock.mockResolvedValue({
      token: 'test-token',
      user: {
        id: 'user-1',
        email: 'user@example.com',
      },
    });

    const onAuthenticated = vi.fn();

    renderLoginPage(onAuthenticated);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /log in/i }),
    );

    await waitFor(() => {
      expect(onAuthenticated).toHaveBeenCalledWith('user@example.com');
    });

    expect(localStorage.getItem('authToken')).toBe('test-token');
    expect(localStorage.getItem('authUserEmail')).toBe('user@example.com');
  });

  it('displays an API error when login fails', async () => {
    loginMock.mockRejectedValue(new Error('Invalid credentials.'));

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'user@example.com' },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrong-password' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /log in/i }),
    );

    expect(
      await screen.findByText('Invalid credentials.'),
    ).toBeInTheDocument();
  });
});
