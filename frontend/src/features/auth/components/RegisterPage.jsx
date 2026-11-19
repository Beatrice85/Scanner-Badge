import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi, { ROLES_INSCRIPTION } from '../api/auth.api';
import { notifierToast } from '../../../shared/lib/toast';
import AuthLayout from './AuthLayout';

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
      notifierToast('Compte créé avec succès.');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err?.message || 'Erreur lors de la création du compte');
    }
  }

  return (
    <AuthLayout
      title="Créer votre compte"
      description="Rejoignez Scanner Badge pour gérer votre espace."
    >
      <div className="auth-account-type">
        Création d'un compte {role === 'admin' ? 'administrateur' : 'employé'}
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="register-nom">Nom complet</label>
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
        <div className="auth-field">
          <label htmlFor="register-email">Adresse Email</label>
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
        <div className="auth-field">
          <label htmlFor="register-role">Rôle</label>
          <select id="register-role" value={role} onChange={e => setRole(e.target.value)}>
            <option value="employe">Employé</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>
        <div className="auth-field">
          <label htmlFor="register-password">Mot de passe</label>
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
        <div className="auth-field">
          <label htmlFor="register-confirm">Confirmer le mot de passe</label>
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
        {error && <div role="alert" className="auth-error">{error}</div>}
        <button type="submit" className="auth-submit">
          Créer un compte
        </button>
      </form>
      <footer className="auth-footer">
        <span>Vous avez déjà un compte ?</span>
        <Link to="/login">Se connecter</Link>
      </footer>
    </AuthLayout>
  );
}
