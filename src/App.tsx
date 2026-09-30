import { useState } from 'react';
import { ExpenseForm } from './components/ExpenseForm/ExpenseForm';
import { ExpenseList } from './components/ExpenseList/ExpenseList';
import type { Expense } from './types/expense';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const handleAddExpense = (expense: Expense) => {
    setExpenses((currentExpenses) => [...currentExpenses, expense]);
  };

  return (
    <main className="app">
      <section className="expense-tracker">
        <header className="expense-tracker__header">
          <p className="expense-tracker__eyebrow">Personal finance</p>
          <h1>Expense Tracker</h1>
          <p className="expense-tracker__description">
            Keep track of your everyday expenses in one place.
          </p>
        </header>

        <ExpenseForm onAddExpense={handleAddExpense} />
        <ExpenseList expenses={expenses} />
      </section>
    </main>
  );
}

export default App;