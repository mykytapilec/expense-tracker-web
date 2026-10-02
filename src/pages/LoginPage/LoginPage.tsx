import { useNavigate } from 'react-router-dom';

import { Auth } from '../../components/Auth/Auth';

interface LoginPageProps {
  onAuthenticated: (email: string) => void;
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const navigate = useNavigate();

  const handleAuthenticated = (email: string) => {
    onAuthenticated(email);
    navigate('/dashboard');
  };

  return <Auth onAuthenticated={handleAuthenticated} />;
}
