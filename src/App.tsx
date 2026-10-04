import { useCallback, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import {
  getToken,
  getUserEmail,
  removeToken,
  removeUserEmail,
} from './api/auth';
import { AppLayout } from './layouts/AppLayout/AppLayout';
import { DashboardPage } from './pages/DashboardPage/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage/ExpensesPage';
import { LoginPage } from './pages/LoginPage/LoginPage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => getToken() !== null,
  );
  const [userEmail, setUserEmail] = useState(getUserEmail);

  const handleAuthenticated = useCallback((email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    removeToken();
    removeUserEmail();
    setIsAuthenticated(false);
    setUserEmail('');
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <main className="app">
                <LoginPage
                  onAuthenticated={handleAuthenticated}
                />
              </main>
            )
          }
        />

        <Route
          element={
            isAuthenticated ? (
              <AppLayout
                userEmail={userEmail}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />
          <Route
            path="/expenses"
            element={<ExpensesPage />}
          />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? '/dashboard' : '/login'}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
