import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExpenseItem } from './ExpenseItem';
import type { Expense } from '../../types/expense';

const mockExpense: Expense = {
id: 'expense-1',
description: 'Weekly groceries',
amount: 45.5,
category: 'GROCERIES',
date: '2026-09-28',
};

const renderExpenseItem = (
onUpdateExpense = vi.fn().mockResolvedValue(undefined),
onDeleteExpense = vi.fn().mockResolvedValue(undefined),
) =>
render( <ExpenseItem
   expense={mockExpense}
   onUpdateExpense={onUpdateExpense}
   onDeleteExpense={onDeleteExpense}
 />,
);

describe('ExpenseItem', () => {
it('renders the expense details', () => {
renderExpenseItem();

expect(
  screen.getByRole('heading', { name: 'Weekly groceries' }),
).toBeInTheDocument();
expect(screen.getByText('GROCERIES · 2026-09-28')).toBeInTheDocument();
expect(screen.getByText('$45.50')).toBeInTheDocument();
expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();

});

it('opens the edit form with the current expense values', () => {
renderExpenseItem();

fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

expect(
  screen.getByRole('textbox', { name: 'Expense description' }),
).toHaveValue('Weekly groceries');
expect(
  screen.getByRole('spinbutton', { name: 'Expense amount' }),
).toHaveValue(45.5);
expect(
  screen.getByRole('combobox', { name: 'Expense category' }),
).toHaveValue('GROCERIES');
expect(screen.getByLabelText('Expense date')).toHaveValue('2026-09-28');

});

it('saves the updated expense and exits edit mode', async () => {
const onUpdateExpense = vi.fn().mockResolvedValue(undefined);
renderExpenseItem(onUpdateExpense);

fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
fireEvent.change(
  screen.getByRole('textbox', { name: 'Expense description' }),
  { target: { value: '  Monthly groceries  ' } },
);
fireEvent.change(
  screen.getByRole('spinbutton', { name: 'Expense amount' }),
  { target: { value: '72.25' } },
);
fireEvent.change(
  screen.getByRole('combobox', { name: 'Expense category' }),
  { target: { value: 'HEALTH' } },
);
fireEvent.change(screen.getByLabelText('Expense date'), {
  target: { value: '2026-09-29' },
});

fireEvent.click(screen.getByRole('button', { name: 'Save' }));

await waitFor(() => {
  expect(onUpdateExpense).toHaveBeenCalledWith('expense-1', {
    description: 'Monthly groceries',
    amount: 72.25,
    category: 'HEALTH',
    date: '2026-09-29',
  });
});

expect(
  screen.queryByRole('button', { name: 'Cancel' }),
).not.toBeInTheDocument();

});

it('cancels editing and restores the original values', () => {
renderExpenseItem();

fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
fireEvent.change(
  screen.getByRole('textbox', { name: 'Expense description' }),
  { target: { value: 'Changed description' } },
);
fireEvent.change(
  screen.getByRole('spinbutton', { name: 'Expense amount' }),
  { target: { value: '100' } },
);

fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

expect(
  screen.getByRole('textbox', { name: 'Expense description' }),
).toHaveValue('Weekly groceries');
expect(
  screen.getByRole('spinbutton', { name: 'Expense amount' }),
).toHaveValue(45.5);

});

it.each([
['an empty description', '   ', '45.50', '2026-09-28'],
['an empty amount', 'Weekly groceries', '', '2026-09-28'],
['a zero amount', 'Weekly groceries', '0', '2026-09-28'],
['a negative amount', 'Weekly groceries', '-5', '2026-09-28'],
['an empty date', 'Weekly groceries', '45.50', ''],
])(
'does not save when the expense has %s',
(_case, description, amount, date) => {
const onUpdateExpense = vi.fn().mockResolvedValue(undefined);
renderExpenseItem(onUpdateExpense);

  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  fireEvent.change(
    screen.getByRole('textbox', { name: 'Expense description' }),
    { target: { value: description } },
  );
  fireEvent.change(
    screen.getByRole('spinbutton', { name: 'Expense amount' }),
    { target: { value: amount } },
  );
  fireEvent.change(screen.getByLabelText('Expense date'), {
    target: { value: date },
  });

  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(onUpdateExpense).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
},

);

it('deletes the expense', async () => {
const onDeleteExpense = vi.fn().mockResolvedValue(undefined);
renderExpenseItem(undefined, onDeleteExpense);

fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

await waitFor(() => {
  expect(onDeleteExpense).toHaveBeenCalledWith('expense-1');
});

});

it('disables actions while saving an update', async () => {
let resolveUpdate!: () => void;
const onUpdateExpense = vi.fn(
() =>
new Promise<void>((resolve) => {
resolveUpdate = resolve;
}),
);


renderExpenseItem(onUpdateExpense);
fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
fireEvent.click(screen.getByRole('button', { name: 'Save' }));

expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();
expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
expect(
  screen.getByRole('textbox', { name: 'Expense description' }),
).toBeDisabled();

resolveUpdate();

await waitFor(() => {
  expect(
    screen.queryByRole('button', { name: 'Saving...' }),
  ).not.toBeInTheDocument();
});

});

it('disables actions while deleting the expense', async () => {
let resolveDelete!: () => void;
const onDeleteExpense = vi.fn(
() =>
new Promise<void>((resolve) => {
resolveDelete = resolve;
}),
);

renderExpenseItem(undefined, onDeleteExpense);
fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

expect(screen.getByRole('button', { name: 'Deleting...' })).toBeDisabled();
expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();

resolveDelete();

await waitFor(() => {
  expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled();
});

});
});
