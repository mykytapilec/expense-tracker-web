import { NavLink, Outlet } from 'react-router-dom';

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

        <nav className="app-navigation" aria-label="Main navigation">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? 'app-navigation__link app-navigation__link--active'
                : 'app-navigation__link'
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              isActive
                ? 'app-navigation__link app-navigation__link--active'
                : 'app-navigation__link'
            }
          >
            Expenses
          </NavLink>
        </nav>

        <Outlet />
      </section>
    </main>
  );
}
