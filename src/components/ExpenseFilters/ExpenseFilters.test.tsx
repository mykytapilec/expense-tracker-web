import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ExpenseFilters } from './ExpenseFilters';

describe('ExpenseFilters', () => {
  it('renders all filter fields and actions', () => {
    render(
      <ExpenseFilters
        onApply={vi.fn()}
        onClear={vi.fn()}
        isLoading={false}
      />,
    );

    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Apply Filters' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Clear' }),
    ).toBeInTheDocument();
  });

  it('uses empty values by default', () => {
    render(
      <ExpenseFilters
        onApply={vi.fn()}
        onClear={vi.fn()}
        isLoading={false}
      />,
    );

    expect(screen.getByLabelText('Category')).toHaveValue('');
    expect(screen.getByLabelText('From')).toHaveValue('');
    expect(screen.getByLabelText('To')).toHaveValue('');
  });

  it('updates filter fields when the user changes them', () => {
    render(
      <ExpenseFilters
        onApply={vi.fn()}
        onClear={vi.fn()}
        isLoading={false}
      />,
    );

    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'GROCERIES' },
    });
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2026-10-01' },
    });
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: '2026-10-07' },
    });

    expect(screen.getByLabelText('Category')).toHaveValue('GROCERIES');
    expect(screen.getByLabelText('From')).toHaveValue('2026-10-01');
    expect(screen.getByLabelText('To')).toHaveValue('2026-10-07');
  });

  it('applies the selected filters', () => {
    const onApply = vi.fn();

    render(
      <ExpenseFilters
        onApply={onApply}
        onClear={vi.fn()}
        isLoading={false}
      />,
    );

    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'GROCERIES' },
    });
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2026-10-01' },
    });
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: '2026-10-07' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Apply Filters' }),
    );

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith({
      category: 'GROCERIES',
      startDate: '2026-10-01',
      endDate: '2026-10-07',
    });
  });

  it('omits empty filters when applying', () => {
    const onApply = vi.fn();

    render(
      <ExpenseFilters
        onApply={onApply}
        onClear={vi.fn()}
        isLoading={false}
      />,
    );

    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2026-10-01' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Apply Filters' }),
    );

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith({
      startDate: '2026-10-01',
    });
  });

  it('clears the filters', () => {
    const onClear = vi.fn();

    render(
      <ExpenseFilters
        onApply={vi.fn()}
        onClear={onClear}
        isLoading={false}
      />,
    );

    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'GROCERIES' },
    });
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2026-10-01' },
    });
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: '2026-10-07' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Clear' }),
    );

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Category')).toHaveValue('');
    expect(screen.getByLabelText('From')).toHaveValue('');
    expect(screen.getByLabelText('To')).toHaveValue('');
  });

  it('disables controls while loading', () => {
    render(
      <ExpenseFilters
        onApply={vi.fn()}
        onClear={vi.fn()}
        isLoading
      />,
    );

    expect(screen.getByLabelText('Category')).toBeDisabled();
    expect(screen.getByLabelText('From')).toBeDisabled();
    expect(screen.getByLabelText('To')).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Loading...' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Clear' }),
    ).toBeDisabled();
  });

  it('shows loading text while loading', () => {
    render(
      <ExpenseFilters
        onApply={vi.fn()}
        onClear={vi.fn()}
        isLoading
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Loading...' }),
    ).toBeInTheDocument();
  });
});
