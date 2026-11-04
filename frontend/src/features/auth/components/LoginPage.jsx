import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { accueilDuRole, useAuth } from '../context/auth-context';

// Le rôle n'est pas choisi ici : il est renvoyé par le serveur après connexion.
export default function LoginPage() {
  const { utilisateur, chargement, erreur: erreurSession, connexion } = useAuth();
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
      navigate(accueilDuRole(user.role), { replace: true });
    } catch (err) {
      setError(err?.message || 'Email ou mot de passe invalide');
    } finally {
      setEnvoi(false);
    }
  }

  if (!chargement && utilisateur) {
    return <Navigate to={accueilDuRole(utilisateur.role)} replace />;
  }

  return (
    <div className="login-screen">
      <div className="login-panel">
        <header className="login-hero">
          <h1>Connexion</h1>
        </header>

        <div className="login-card">
          <div className="login-card-header">
            <div>
              <div className="login-card-title">Espace Scanner Badge</div>
              <div className="login-card-subtitle">Votre espace s'adapte à votre rôle (administrateur ou employé).</div>
            </div>
          </div>

          {erreurSession && !error && <div role="alert" className="error-message">{erreurSession}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="login-email">Adresse Email</label>
              <div className="input-icon">
                <span aria-hidden="true">📧</span>
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
            </div>
            <div className="form-group">
              <label htmlFor="login-password">Mot de passe</label>
              <div className="input-icon">
                <span aria-hidden="true">🔒</span>
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
            </div>
            <div className="form-helpers">
              <label className="checkbox-label">
                <input type="checkbox" /> Se souvenir de moi
              </label>
            </div>
            {error && <div role="alert" className="error-message">{error}</div>}
            <button type="submit" className="bg-blue-600 text-white btn-full" disabled={envoi}>
              {envoi ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <div className="login-footer">
            <Link to="/register">Créer un compte</Link>
            <a href="#">Mot de passe oublié ?</a>
          </div>
        </div>
      </div>
    </div>
  );
}
