import { useNavigate } from 'react-router-dom';

import { saveUserEmail } from '../../api/auth';
import { Auth } from '../../components/Auth/Auth';

interface LoginPageProps {
  onAuthenticated: (email: string) => void;
}

export function LoginPage({ onAuthenticated }: LoginPageProps) {
  const navigate = useNavigate();

  const handleAuthenticated = (email: string) => {
    saveUserEmail(email);
    onAuthenticated(email);
    navigate('/dashboard');
  };

  return <Auth onAuthenticated={handleAuthenticated} />;
}
