export type ExpenseCategory =
  | 'GROCERIES'
  | 'LEISURE'
  | 'ELECTRONICS'
  | 'UTILITIES'
  | 'CLOTHING'
  | 'HEALTH'
  | 'OTHERS';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
}
