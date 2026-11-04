import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi, { ROLES_INSCRIPTION } from '../api/auth.api';

// Le rôle choisi ("employe" ou "admin") est envoyé au backend, qui le valide aussi.
// Pour un compte employé, le backend lie (ou crée) automatiquement sa fiche employé.
export default function RegisterPage() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('employe');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !email.trim() || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (!ROLES_INSCRIPTION.includes(role)) {
      setError('Rôle invalide : choisissez Employé ou Administrateur');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await authApi.register({ nom: nom.trim(), email: email.trim(), password, role });
      navigate('/login');
    } catch (err) {
      setError(err?.message || 'Erreur lors de la création du compte');
    }
  }

  return (
    <div className="login-screen">
      <div className="login-panel">
        <header className="login-hero">
          <h1>Inscription</h1>
        </header>

        <div className="login-card">
          <div className="login-card-header">
            <div>
              <div className="login-card-title">{role === 'admin' ? 'Compte administrateur' : 'Compte employé'}</div>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="register-nom">Nom complet</label>
              <div className="input-icon">
                <span aria-hidden="true">👤</span>
                <input
                  id="register-nom"
                  name="nom"
                  autoComplete="name"
                  type="text"
                  placeholder="Jean Dupont"
                  value={nom}
                  onChange={e => setNom(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="register-email">Adresse Email</label>
              <div className="input-icon">
                <span aria-hidden="true">📧</span>
                <input
                  id="register-email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  placeholder="employe@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="register-role">Rôle</label>
              <div className="input-icon">
                <span aria-hidden="true">🛡️</span>
                <select id="register-role" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="employe">Employé</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="register-password">Mot de passe</label>
              <div className="input-icon">
                <span aria-hidden="true">🔒</span>
                <input
                  id="register-password"
                  name="password"
                  autoComplete="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="register-confirm">Confirmer le mot de passe</label>
              <div className="input-icon">
                <span aria-hidden="true">🔒</span>
                <input
                  id="register-confirm"
                  name="confirmPassword"
                  autoComplete="new-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <div role="alert" className="error-message">{error}</div>}
            <button type="submit" className="bg-blue-600 text-white btn-full">
              Créer un compte
            </button>
          </form>
          <div className="login-footer">
            <Link to="/login">Déjà un compte ? Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
