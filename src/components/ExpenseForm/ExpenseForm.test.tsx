import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ExpenseForm } from './ExpenseForm';

describe('ExpenseForm', () => {
  it('renders all form fields', () => {
    render(
      <ExpenseForm onAddExpense={vi.fn()} isSubmitting={false} />,
    );

    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add Expense' }),
    ).toBeInTheDocument();
  });

  it('uses the current date as the default date', () => {
    render(
      <ExpenseForm onAddExpense={vi.fn()} isSubmitting={false} />,
    );

    const dateInput = screen.getByLabelText('Date');

    expect(dateInput).toHaveValue(new Date().toISOString().slice(0, 10));
  });

  it('updates form fields when the user enters values', () => {
    render(
      <ExpenseForm onAddExpense={vi.fn()} isSubmitting={false} />,
    );

    const descriptionInput = screen.getByLabelText('Description');
    const amountInput = screen.getByLabelText('Amount');
    const categoryInput = screen.getByLabelText('Category');
    const dateInput = screen.getByLabelText('Date');

    fireEvent.change(descriptionInput, {
      target: { value: 'Weekly groceries' },
    });
    fireEvent.change(amountInput, {
      target: { value: '75.50' },
    });
    fireEvent.change(categoryInput, {
      target: { value: 'GROCERIES' },
    });
    fireEvent.change(dateInput, {
      target: { value: '2026-10-05' },
    });

    expect(descriptionInput).toHaveValue('Weekly groceries');
    expect(amountInput).toHaveValue(75.5);
    expect(categoryInput).toHaveValue('GROCERIES');
    expect(dateInput).toHaveValue('2026-10-05');
  });

  it('submits the entered expense data', () => {
    const onAddExpense = vi.fn();

    render(
      <ExpenseForm
        onAddExpense={onAddExpense}
        isSubmitting={false}
      />,
    );

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Weekly groceries' },
    });
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '75.50' },
    });
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'GROCERIES' },
    });
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2026-10-05' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Add Expense' }),
    );

    expect(onAddExpense).toHaveBeenCalledTimes(1);
    expect(onAddExpense).toHaveBeenCalledWith({
      id: expect.any(String),
      description: 'Weekly groceries',
      amount: 75.5,
      category: 'GROCERIES',
      date: '2026-10-05',
    });
  });

  it('does not submit when the amount is invalid', () => {
    const onAddExpense = vi.fn();

    render(
      <ExpenseForm
        onAddExpense={onAddExpense}
        isSubmitting={false}
      />,
    );

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Weekly groceries' },
    });
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '0' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Add Expense' }),
    );

    expect(onAddExpense).not.toHaveBeenCalled();
  });

  it('does not submit when required fields are empty', () => {
    const onAddExpense = vi.fn();

    render(
      <ExpenseForm
        onAddExpense={onAddExpense}
        isSubmitting={false}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Add Expense' }),
    );

    expect(onAddExpense).not.toHaveBeenCalled();
  });

  it('disables the form while submitting', () => {
    render(
      <ExpenseForm onAddExpense={vi.fn()} isSubmitting />,
    );

    expect(screen.getByLabelText('Description')).toBeDisabled();
    expect(screen.getByLabelText('Amount')).toBeDisabled();
    expect(screen.getByLabelText('Category')).toBeDisabled();
    expect(screen.getByLabelText('Date')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Adding Expense...' }),
    ).toBeDisabled();
  });

  it('resets the form after a successful submission', async () => {
    const onAddExpense = vi.fn();

    render(
      <ExpenseForm
        onAddExpense={onAddExpense}
        isSubmitting={false}
      />,
    );

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Weekly groceries' },
    });
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '75.50' },
    });
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'GROCERIES' },
    });
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2026-10-05' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Add Expense' }),
    );

    expect(onAddExpense).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByLabelText('Description')).toHaveValue('');
      expect(screen.getByLabelText('Amount')).toHaveValue(null);
      expect(screen.getByLabelText('Category')).toHaveValue('OTHERS');
      expect(screen.getByLabelText('Date')).toHaveValue(
        new Date().toISOString().slice(0, 10),
      );
    });
  });
});
