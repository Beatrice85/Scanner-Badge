import { Link } from 'react-router-dom';

const fonctionnalites = [
  {
    titre: 'Équipes',
    description: 'Retrouvez les profils et les informations de vos employés au même endroit.',
    icone: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 19c.6-3 2.6-4.5 6-4.5s5.4 1.5 6 4.5" />
        <path d="M16 5.5a3 3 0 0 1 0 5.8M18 14.5c1.8.8 2.8 2.3 3 4.5" />
      </>
    ),
  },
  {
    titre: 'Chantiers',
    description: 'Visualisez vos sites et gardez les informations essentielles accessibles.',
    icone: (
      <>
        <path d="M3 21h18M5 21V10l7-6 7 6v11" />
        <path d="M9 21v-6h6v6M9 10h.01M15 10h.01" />
      </>
    ),
  },
  {
    titre: 'Pointages',
    description: 'Consultez les entrées et sorties pour suivre le temps de travail.',
    icone: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
  {
    titre: 'Congés et paie',
    description: 'Suivez les demandes de congés et accédez aux informations de paie.',
    icone: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18M8 15h3M8 18h7" />
      </>
    ),
  },
];

function IconeMarque() {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className="h-9 w-9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
      <rect x="22" y="21" width="52" height="55" rx="9" />
      <path d="M34 38h28M34 48h28M34 58h14" />
      <path d="M17 37a41 41 0 0 0 0 24M79 37a41 41 0 0 1 0 24M9 28a55 55 0 0 0 0 42M87 28a55 55 0 0 1 0 42" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eef2ff] text-slate-900">
      <div aria-hidden="true" className="pointer-events-none absolute -right-36 -top-40 h-[28rem] w-[28rem] rounded-full bg-blue-200/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full bg-blue-200/30 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link to="/" aria-label="Scanner Badge, accueil" className="flex items-center gap-3 rounded-xl">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <IconeMarque />
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight tracking-tight text-slate-900">Scanner Badge</span>
            <span className="mt-1 block text-xs font-medium text-slate-500">Gestion des équipes</span>
          </span>
        </Link>

        <Link
          to="/login"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
        >
          Se connecter
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
            <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          </svg>
        </Link>
      </header>

      <main>
        <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 pb-12 pt-10 sm:px-8 md:pt-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-10 lg:pb-16 lg:pt-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Votre gestion, en un seul endroit
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Le suivi de vos équipes,
              <span className="mt-1 block text-blue-600">en toute simplicité.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Employés, chantiers, pointages, congés et paie : retrouvez l’essentiel de votre activité dans un espace clair et centralisé.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
              >
                Accéder à mon espace
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                  <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
              </Link>
              <a
                href="#fonctionnalites"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-white hover:text-blue-700"
              >
                Découvrir la plateforme
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 text-blue-600">
                  <path d="m5 10 3.2 3.2L15.5 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                Un espace centralisé
              </span>
              <span className="inline-flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4 text-blue-600">
                  <path d="m5 10 3.2 3.2L15.5 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                Une interface claire
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl translate-x-2 sm:translate-x-4 lg:ml-auto lg:translate-x-32 xl:translate-x-40">
            <div aria-hidden="true" className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-blue-200/70 via-white/50 to-blue-100/60 blur-xl" />
            <div className="relative rounded-[2rem] border border-white/80 bg-white/80 p-4 shadow-2xl shadow-blue-900/10 backdrop-blur sm:p-6">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Vue d’ensemble</p>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Votre activité</h2>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <IconeMarque />
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-blue-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Équipes</span>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-blue-600">
                        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M3 19c.6-3 2.6-4.5 6-4.5s5.4 1.5 6 4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
                      </svg>
                    </div>
                    <p className="mt-5 text-sm font-semibold text-blue-800">Employés</p>
                    <div className="mt-3 flex -space-x-2" aria-hidden="true">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-50 bg-blue-200 text-[10px] font-bold text-blue-800">JD</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-50 bg-slate-200 text-[10px] font-bold text-slate-700">AM</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-50 bg-blue-100 text-[10px] font-bold text-blue-700">+3</span>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Présence</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    </div>
                    <p className="mt-5 text-sm font-semibold text-slate-800">Pointages du jour</p>
                    <div className="mt-3 flex h-8 items-end gap-1.5" aria-hidden="true">
                      <span className="h-4 flex-1 rounded-t bg-blue-200" />
                      <span className="h-6 flex-1 rounded-t bg-blue-300" />
                      <span className="h-5 flex-1 rounded-t bg-blue-400" />
                      <span className="h-8 flex-1 rounded-t bg-blue-600" />
                      <span className="h-6 flex-1 rounded-t bg-blue-400" />
                      <span className="h-7 flex-1 rounded-t bg-blue-500" />
                      <span className="h-4 flex-1 rounded-t bg-blue-200" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Suivi des chantiers</p>
                      <p className="mt-1 text-xs text-slate-500">Les informations au même endroit</p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                        <path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                        <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M8 12h8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="h-2 w-2/3 rounded-full bg-slate-300" />
                      <div className="mt-2 h-1.5 w-1/2 rounded-full bg-slate-200" />
                    </div>
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">Actif</span>
                  </div>
                </div>
                <p className="mt-4 text-center text-xs text-slate-500">Une vision claire pour mieux coordonner vos équipes.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="fonctionnalites" className="relative z-10 border-y border-white/70 bg-white/55">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Une plateforme complète</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Tout ce qu’il faut pour suivre votre activité.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Les outils essentiels pour organiser le quotidien de vos équipes et de vos chantiers.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {fonctionnalites.map(({ titre, description, icone }) => (
                <article key={titre} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
                      {icone}
                    </svg>
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{titre}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <span className="font-semibold text-slate-700">Scanner Badge</span>
        <span>La gestion de vos équipes, simplement.</span>
      </footer>
    </div>
  );
}
