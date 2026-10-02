import { Outlet } from 'react-router-dom';

interface AppLayoutProps {
  userEmail: string;
  onLogout: () => void;
}

export function AppLayout({
  userEmail,
  onLogout,
}: AppLayoutProps) {
  return (
    <main className="app">
      <section className="expense-tracker">
        <header className="expense-tracker__header">
          <div>
            <p className="expense-tracker__eyebrow">Personal finance</p>
            <h1>Expense Tracker</h1>
            <p className="expense-tracker__description">
              Keep track of your everyday expenses in one place.
            </p>
          </div>

          <div className="expense-tracker__account">
            {userEmail && <span>{userEmail}</span>}

            <button type="button" onClick={onLogout}>
              Log Out
            </button>
          </div>
        </header>

        <Outlet />
      </section>
    </main>
  );
}
