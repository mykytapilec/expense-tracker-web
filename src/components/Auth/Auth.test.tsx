import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { login, saveToken, signup } from '../../api/auth';
import { Auth } from './Auth';

vi.mock('../../api/auth', () => ({
  login: vi.fn(),
  saveToken: vi.fn(),
  signup: vi.fn(),
}));

const mockResponse = {
  token: 'test-token',
  user: {
    id: 'user-1',
    email: 'user@example.com',
  },
};

describe('Auth', () => {
  const onAuthenticated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login form by default', () => {
    render(<Auth onAuthenticated={onAuthenticated} />);

    expect(
      screen.getByRole('heading', { name: 'Welcome back' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password',
    );
    expect(
      screen.getByRole('button', { name: 'Log In' }),
    ).toBeInTheDocument();
  });

  it('logs in successfully and saves the token', async () => {
    vi.mocked(login).mockResolvedValue(mockResponse);

    render(<Auth onAuthenticated={onAuthenticated} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(saveToken).toHaveBeenCalledWith('test-token');
      expect(onAuthenticated).toHaveBeenCalledWith('user@example.com');
    });
  });

  it('switches to signup mode and clears the password', () => {
    render(<Auth onAuthenticated={onAuthenticated} />);

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(
      screen.getByRole('button', {
        name: "Don't have an account? Sign up",
      }),
    );

    expect(
      screen.getByRole('heading', { name: 'Create your account' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sign Up' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'autocomplete',
      'new-password',
    );
  });

  it('signs up successfully and saves the token', async () => {
    vi.mocked(signup).mockResolvedValue(mockResponse);

    render(<Auth onAuthenticated={onAuthenticated} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(
      screen.getByRole('button', {
        name: "Don't have an account? Sign up",
      }),
    );

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => {
      expect(signup).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(saveToken).toHaveBeenCalledWith('test-token');
      expect(onAuthenticated).toHaveBeenCalledWith('user@example.com');
    });
  });

  it('shows an error when login fails', async () => {
    vi.mocked(login).mockRejectedValue(new Error('Invalid credentials'));

    render(<Auth onAuthenticated={onAuthenticated} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid credentials',
    );
    expect(saveToken).not.toHaveBeenCalled();
    expect(onAuthenticated).not.toHaveBeenCalled();
  });

  it('disables the submit button while the request is pending', async () => {
    let resolveLogin!: (value: typeof mockResponse) => void;

    vi.mocked(login).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );

    render(<Auth onAuthenticated={onAuthenticated} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    expect(
      await screen.findByRole('button', { name: 'Please wait...' }),
    ).toBeDisabled();

    resolveLogin(mockResponse);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Log In' }),
      ).toBeEnabled();
    });
  });

  it('returns to login mode and clears the password and error', async () => {
    vi.mocked(login).mockRejectedValue(new Error('Invalid credentials'));

    render(<Auth onAuthenticated={onAuthenticated} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Log In' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid credentials',
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: "Don't have an account? Sign up",
      }),
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Already have an account? Log in',
      }),
    );

    expect(
      screen.getByRole('heading', { name: 'Welcome back' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });
});