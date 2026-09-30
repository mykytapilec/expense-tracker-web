import './App.css';
import { ExpenseForm } from './components/ExpenseForm/ExpenseForm';
import type { Expense } from './types/expense';

function App() {
  const handleAddExpense = (expense: Expense) => {
    console.log('Expense added:', expense);
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
      </section>
    </main>
  );
}

export default App;