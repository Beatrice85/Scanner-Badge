import { Link } from 'react-router-dom';

export default function AuthLayout({ title, description, children }) {
  return (
    <main className="auth-screen">
      <div className="auth-panel">
        <aside className="auth-brand" aria-label="Scanner Badge">
          <Link className="auth-home-link" to="/">
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="m15 18-6-6 6-6M9 12h12" />
            </svg>
            Accueil
          </Link>

          <div className="auth-brand-content">
            <div className="auth-logo" aria-hidden="true">
              <svg viewBox="0 0 96 96">
                <rect x="22" y="21" width="52" height="55" rx="9" />
                <path d="M34 38h28M34 48h28M34 58h14" />
                <path d="M17 37a41 41 0 0 0 0 24M79 37a41 41 0 0 1 0 24M9 28a55 55 0 0 0 0 42M87 28a55 55 0 0 1 0 42" />
              </svg>
            </div>
            <h2>Scanner Badge</h2>
            <p>Le suivi du temps et des équipes, en toute simplicité.</p>
          </div>
        </aside>

        <section className="auth-content" aria-labelledby="auth-title">
          <div className="auth-content-inner">
            <header className="auth-heading">
              <h1 id="auth-title">{title}</h1>
              <p>{description}</p>
            </header>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
