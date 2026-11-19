import { Link } from 'react-router-dom';
import { accueilDuRole, useAuth } from '../auth/context/auth-context';

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
    description: 'Visualisez vos sites sur une carte, avec leur zone de tolérance.',
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

// Fonctionnement réel de l'application (aucune donnée inventée).
const etapes = [
  {
    titre: 'L’employé badge sur le chantier',
    description: 'Son badge RFID enregistre l’entrée ou la sortie. La position est comparée à la zone de tolérance du chantier.',
  },
  {
    titre: 'Il demande ses congés en ligne',
    description: 'Il choisit ses dates, ajoute un motif s’il le souhaite et suit le statut de sa demande.',
  },
  {
    titre: 'L’administrateur valide, la paie suit',
    description: 'Les congés validés et les heures pointées sont pris en compte dans le calcul de la paie.',
  },
];

const profils = [
  {
    titre: 'Pour l’administrateur',
    points: [
      'Un tableau de bord qui signale les actions en attente',
      'La validation ou le refus des congés, avec un motif',
      'La gestion des employés, badges, chantiers et comptes',
    ],
  },
  {
    titre: 'Pour l’employé',
    points: [
      'Une demande de congé en quelques secondes',
      'Le suivi de ses demandes : en attente, validée ou refusée',
      'La consultation des chantiers et de leur emplacement',
    ],
  },
];

function IconeMarque({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" className={className} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3">
      <rect x="22" y="21" width="52" height="55" rx="9" />
      <path d="M34 38h28M34 48h28M34 58h14" />
      <path d="M17 37a41 41 0 0 0 0 24M79 37a41 41 0 0 1 0 24M9 28a55 55 0 0 0 0 42M87 28a55 55 0 0 1 0 42" />
    </svg>
  );
}

function Fleche() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function Coche({ className = 'h-4 w-4 text-blue-600' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className={className}>
      <path d="m5 10 3.2 3.2L15.5 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

// Boutons : contraste AA conservé au survol (blue-700, jamais blue-500 avec du texte blanc).
const boutonPrincipal =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700';
const boutonSecondaire =
  'inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white/70 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-white hover:text-blue-700';

export default function Home() {
  const { utilisateur } = useAuth();
  const monEspace = utilisateur ? accueilDuRole(utilisateur.role) : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eef2ff] text-slate-900">
      <div aria-hidden="true" className="pointer-events-none absolute -right-36 -top-40 h-[28rem] w-[28rem] rounded-full bg-blue-200/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full bg-blue-200/30 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
        <Link to="/" aria-label="Scanner Badge, accueil" className="flex items-center gap-3 rounded-xl">
          <span className="flex h-11 w-11 items-center justify-center rounded-bloc bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <IconeMarque />
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight tracking-tight text-slate-900">Scanner Badge</span>
            <span className="mt-1 block text-xs font-medium text-slate-500">Gestion des équipes</span>
          </span>
        </Link>

        {/* Utilisateur connecté : accès direct à son espace, sans repasser par la connexion */}
        {monEspace ? (
          <Link to={monEspace} className={`${boutonPrincipal} min-h-11 px-5 py-2.5`}>
            Mon espace <Fleche />
          </Link>
        ) : (
          <nav aria-label="Compte" className="flex items-center gap-2">
            <Link to="/register" className="hidden min-h-11 items-center rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white/70 hover:text-blue-700 sm:inline-flex">
              Créer un compte
            </Link>
            <Link to="/login" className={`${boutonPrincipal} min-h-11 px-5 py-2.5`}>
              Se connecter <Fleche />
            </Link>
          </nav>
        )}
      </header>

      <main>
        {/* Accroche */}
        <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 pb-12 pt-10 sm:px-8 md:pt-16 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-10 lg:pb-16 lg:pt-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700 shadow-sm">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-blue-600" />
              Votre gestion, en un seul endroit
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Le suivi de vos équipes,
              <span className="mt-1 block text-blue-600">en toute simplicité.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Employés, chantiers, pointages, congés et paie : retrouvez l’essentiel de votre activité dans un espace clair et centralisé.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={monEspace ?? '/login'} className={boutonPrincipal}>
                Accéder à mon espace <Fleche />
              </Link>
              <a href="#fonctionnement" className={boutonSecondaire}>
                Voir comment ça marche
              </a>
            </div>
            {!monEspace && (
              <p className="mt-4 text-sm text-slate-600">
                Pas encore de compte ?{' '}
                <Link to="/register" className="font-semibold text-blue-700 underline-offset-4 hover:underline">
                  Créez-le en une minute
                </Link>
              </p>
            )}
            <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
              <li className="inline-flex items-center gap-2"><Coche /> Pointage par badge et géolocalisation</li>
              <li className="inline-flex items-center gap-2"><Coche /> Congés validés en ligne</li>
            </ul>
          </div>

          {/* Aperçu illustratif : purement décoratif (aria-hidden), ce ne sont pas des données réelles */}
          <div aria-hidden="true" className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-blue-200/70 via-white/50 to-blue-100/60 blur-xl" />
            <div className="relative rounded-[2rem] border border-white/80 bg-white/80 p-4 shadow-2xl shadow-blue-900/10 backdrop-blur sm:p-6">
              <div className="rounded-carte border border-slate-200 bg-white p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Vue d’ensemble</p>
                    <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">Votre activité</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <IconeMarque className="h-7 w-7" />
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-bloc bg-blue-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Équipes</span>
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-blue-600">
                        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M3 19c.6-3 2.6-4.5 6-4.5s5.4 1.5 6 4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
                      </svg>
                    </div>
                    <p className="mt-5 text-sm font-semibold text-blue-800">Employés</p>
                    <div className="mt-3 flex -space-x-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-50 bg-blue-200 text-[10px] font-bold text-blue-800">JD</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-50 bg-slate-200 text-[10px] font-bold text-slate-700">AM</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-50 bg-blue-100 text-[10px] font-bold text-blue-700">+3</span>
                    </div>
                  </div>
                  <div className="rounded-bloc bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">Présence</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    </div>
                    <p className="mt-5 text-sm font-semibold text-slate-800">Pointages du jour</p>
                    <div className="mt-3 flex h-8 items-end gap-1.5">
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

                <div className="mt-4 rounded-bloc border border-slate-200 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Suivi des chantiers</p>
                      <p className="mt-1 text-xs text-slate-500">Les informations au même endroit</p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                        <path d="M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                      <IconeMarque className="h-6 w-6" />
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

        {/* Fonctionnalités : cartes informatives, non cliquables (pas d'effet de soulèvement trompeur) */}
        <section id="fonctionnalites" aria-labelledby="titre-fonctionnalites" className="relative z-10 scroll-mt-6 border-y border-white/70 bg-white/55">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Une plateforme complète</p>
              <h2 id="titre-fonctionnalites" className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Tout ce qu’il faut pour suivre votre activité.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Les outils essentiels pour organiser le quotidien de vos équipes et de vos chantiers.
              </p>
            </div>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {fonctionnalites.map(({ titre, description, icone }) => (
                <li key={titre} className="rounded-carte border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-bloc bg-blue-50 text-blue-600">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
                      {icone}
                    </svg>
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-slate-900">{titre}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Comment ça marche */}
        <section id="fonctionnement" aria-labelledby="titre-fonctionnement" className="relative z-10 scroll-mt-6 mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Comment ça marche</p>
            <h2 id="titre-fonctionnement" className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Du badge à la paie, en trois étapes.
            </h2>
          </div>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {etapes.map((etape, index) => (
              <li key={etape.titre} className="relative rounded-carte border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white" aria-hidden="true">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  <span className="sr-only">Étape {index + 1} : </span>
                  {etape.titre}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{etape.description}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Pour qui */}
        <section aria-labelledby="titre-profils" className="relative z-10 border-y border-white/70 bg-white/55">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
            <h2 id="titre-profils" className="max-w-2xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Un espace adapté à chacun.
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {profils.map((profil) => (
                <div key={profil.titre} className="rounded-carte border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <h3 className="text-xl font-semibold text-slate-900">{profil.titre}</h3>
                  <ul className="mt-5 space-y-3">
                    {profil.points.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50">
                          <Coche className="h-3.5 w-3.5 text-blue-600" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Appel à l'action final */}
        <section aria-labelledby="titre-cta" className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="flex flex-col items-start gap-6 rounded-carte bg-blue-600 px-6 py-10 text-white shadow-xl shadow-blue-900/15 sm:px-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 id="titre-cta" className="text-2xl font-bold tracking-tight sm:text-3xl">Prêt à commencer ?</h2>
              <p className="mt-2 text-blue-50">
                {monEspace ? 'Retrouvez vos informations dans votre espace.' : 'Connectez-vous ou créez votre compte employé.'}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {monEspace ? (
                <Link to={monEspace} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                  Mon espace <Fleche />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                    Se connecter <Fleche />
                  </Link>
                  <Link to="/register" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                    Créer un compte
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span>
            <span className="font-semibold text-slate-800">Scanner Badge</span> · La gestion de vos équipes, simplement.
          </span>
          <span>© {new Date().getFullYear()} Scanner Badge</span>
        </div>
      </footer>
    </div>
  );
}
