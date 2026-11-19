import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { accueilDuRole, useAuth } from '../context/auth-context';
import { notifierToast } from '../../../shared/lib/toast';
import AuthLayout from './AuthLayout';

// Le rôle n'est pas choisi ici : il est renvoyé par le serveur après connexion.
export default function LoginPage() {
  const { erreur: erreurSession, connexion } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [envoi, setEnvoi] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setEnvoi(true);

    try {
      const user = await connexion(email.trim(), password.trim());
      notifierToast('Connexion réussie.');
      navigate(accueilDuRole(user.role), { replace: true });
    } catch (err) {
      setError(err?.message || 'Email ou mot de passe invalide');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <AuthLayout
      title="Bienvenue"
      description="Connectez-vous à votre espace de gestion."
    >
      {erreurSession && !error && <div role="alert" className="auth-error">{erreurSession}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="login-email">Adresse Email</label>
          <input
            id="login-email"
            name="email"
            autoComplete="email"
            type="email"
            placeholder="vous@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div className="auth-field">
          <label htmlFor="login-password">Mot de passe</label>
          <input
            id="login-password"
            name="password"
            autoComplete="current-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <div className="auth-options">
          <label className="auth-checkbox">
            <input type="checkbox" /> Se souvenir de moi
          </label>
          <a href="#">Mot de passe oublié ?</a>
        </div>
        {error && <div role="alert" className="auth-error">{error}</div>}
        <button type="submit" className="auth-submit" disabled={envoi}>
          {envoi ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      <footer className="auth-footer">
        <span>Vous n'avez pas encore de compte ?</span>
        <Link to="/register">Créer un compte</Link>
      </footer>
    </AuthLayout>
  );
}
