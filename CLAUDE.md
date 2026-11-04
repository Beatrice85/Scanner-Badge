# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Scope rule: frontend only

The user is a frontend developer. **Never modify anything under `backend/`.** That covers code, the Prisma schema, migrations, `swagger.yaml`, `dist/` and config. Treat the backend as a fixed API contract.

You may read backend files to learn what endpoints exist, what payloads they expect, what they return and what errors they send. If a feature looks blocked by the backend (bug, missing route, unmounted module), tell the user. Don't patch it. Adapt the frontend to the API as it is now.

The user sometimes grants an explicit exception to modify `backend/` for one task. The exception covers only that task: after it, this rule applies again. Even with an exception, never touch `backend/dist/`.

The work in progress is adding every backend feature to the frontend, one feature at a time.

## Project overview

Scanner Badge tracks employee working time (pointage) on construction sites (chantiers). Employees badge in and out with an RFID badge. The backend compares the GPS position with the site's geofence and records ENTREE/SORTIE events. Leave (congés) and payroll (paie) are also covered. The code, identifiers and messages are in French, so follow that convention.

## Commands

Frontend (`frontend/`):
```
npm run dev       # Vite dev server
npm run build
npm run lint      # oxlint (react/rules-of-hooks is an error)
```
`VITE_API_BASE_URL` in `frontend/.env` points to the backend. The deployed API is https://scanner-badge.onrender.com, and its Swagger docs are at `/api-docs`. There is no frontend test runner, and Vite doesn't type-check.

To run the backend locally against the frontend (this runs it without modifying it): in `backend/`, run `docker compose up -d` and then `npm run dev` (port 3000). It needs `backend/.env` with `DATABASE_URL`, `DIRECT_URL` and `JWT_SECRET`. The first ADMIN account is created with `npm run seed`, which needs `ADMIN_EMAIL` and `ADMIN_PASSWORD` (and optionally `ADMIN_NOM`) in that `.env`.

`npm run link-employes` links each existing EMPLOYE account that has no employee record, using the same logic as registration (see below). It is idempotent.
- By default it **only simulates**: it lists what it would do and writes nothing.
- `npm run link-employes -- --appliquer` actually writes.
- Never run it without the user's approval. Existing employee records have no email, so the script would create duplicates for them. Fill in their email first (`PUT /employes/:id`).

## Frontend architecture

The stack is React 19 + Vite + Tailwind 3, with a mix of `.jsx` and `.tsx` files. Maps use Leaflet (react-leaflet) and charts use Recharts.

- `src/features/<domain>/` follows this pattern:
  - `api/<domain>.api.ts`: thin wrappers around the shared client.
  - `hooks/use<Domain>.ts`: local `useState` plus fetch/create/update/delete. There is no global store and no React Query.
  - `components/`
  - an optional `types.ts`

  Copy this pattern when you add a feature.
- `src/shared/lib/client-http.ts` is the only fetch wrapper. It prefixes `VITE_API_BASE_URL` and adds `Authorization: Bearer <token>`. On any non-2xx status it throws an `ErreurHttp` that keeps the HTTP `status` (check it for 401/403/409) and the backend message. The backend sends errors as `{ "message": "..." }`.
- `src/shared/lib/session.ts` is the only code that touches `localStorage`. It stores only the token, never the role.
- **Authentication:** `AuthProvider` wraps the app (see `App.jsx`), and `useAuth()` (in `features/auth/context/auth-context.ts`) exposes `utilisateur` (`{ id, nom, email, role, employeId }`), `chargement`, `connexion`, `deconnexion` and `rafraichir`.
  - **The session role always comes from the server**, from `/auth/login` then `/auth/me`, never from `localStorage`. The role is chosen only once, at registration (see below).
  - On load, the provider calls `GET /auth/me`. A 401 or 404 logs the user out.
  - A token whose payload doesn't match `/auth/me` (old token without a role, role changed, account just linked to an employee) also logs the user out. The backend no longer needs this, since it re-reads the role from the database. The check still works, but it forces a re-login that the API doesn't require.
- `src/routes/RouteurApp.tsx` holds every route. `<RouteProtegee role="ADMIN">` restricts a page to a role and sends anyone else to `/acces-refuse`. Without `role`, any logged-in user is allowed.
  - When you add a page, register its route there and add the link in the `RUBRIQUES` constant of `src/shared/components/Sidebar.tsx`. Give it its section, `roles` and an `icone` (add the SVG path to `TRACES` if needed).
  - Hiding a page in the frontend is only ergonomics: real access control is done by the backend.
- `src/shared/components/` contains reusable UI: Tableau, Pagination, FenetreModale, Bouton, Chargement, StatChart, Sidebar.

## Design and accessibility conventions

Target: WCAG 2.1 level AA. Keep the existing color code and don't introduce new hues.

**Colors:**
- `blue-600` is the primary color: links, active page, focus.
- `emerald` is for create and validate actions.
- `rose` is for errors, refusal and deletion.
- `amber` is for pending items.
- `slate` is for text and borders.
- The page background is `#eef2ff`, and modals are dark (`bg-slate-700`).

**Contrast (4.5:1 minimum for text):**
- Buttons with white text use `bg-emerald-700 hover:bg-emerald-800` or `bg-rose-600 hover:bg-rose-700`. Never `emerald-400/500/600` or `rose-500` with white text.
- Secondary text on a light background uses `text-slate-500` at the lightest. `text-slate-400` is only allowed on a dark background.

**Structure:**
- Each page has one `<h1>` as its title, and its `<main id="contenu" tabIndex={-1}>` is the target of the "Aller au contenu" skip link rendered by `Sidebar`.
- Every table header cell has `scope="col"`.
- Loading indicators have `role="status" aria-live="polite"`; errors have `role="alert"`.
- Every form field has a `<label htmlFor>` and the matching `id`, plus `autoComplete` on login and registration.

**Shared components:**
- **Every table is paginated** with `usePagination(liste, taille?, cleReinitialisation?)` (`shared/hooks/`) plus `<Pagination … />` (`shared/components/`).
  - The user can show 10, 20, 30, 50 or 100 rows per page (`TAILLES_PAGE`), 10 by default.
  - Pagination happens client-side, because the API returns full lists.
  - Render `pagination.elementsPage` in the `<tbody>`, but keep the "Aucun …" empty-state test on the full list.
  - Pass a filter as `cleReinitialisation` to go back to page 1 when it changes (see `VueCongesAdmin`).
  - Table wrappers use `overflow-x-auto`, so tables scroll horizontally on small screens.
- `FenetreModale` is an accessible dialog: it handles `role="dialog"`, the focus trap, Escape and focus return, so reuse it for any new modal.
- `Sidebar` is responsive. On small screens it is a top bar with a "Menu" button (`aria-expanded`) that opens a side panel. From `lg` up it is a fixed card (`lg:left-4 lg:w-72`), and pages keep `lg:ml-80`.
  - Links are left-aligned, each with a decorative SVG icon (`aria-hidden`), and grouped into sections. The ADMIN sees Général, Gestion, Ressources humaines and Administration; the EMPLOYE sees Mon espace and Consultation.
  - The current page has a `bg-blue-600` background and `aria-current="page"` (`NavLink`, with `end` for `/admin`).
  - At the bottom, a user block shows initials, name, email, a role badge and "Se déconnecter".

**Global CSS (`index.css`):** keyboard focus outline (`:focus-visible`) and support for `prefers-reduced-motion`.

## Backend API contract (read-only reference)

**Authentication and roles:**
- `authMiddleware` checks the JWT Bearer token, whose payload is `{ id, email, role, employeId }`. It then **re-reads `role` and `employeId` from the database on every request**: only the token's `id` is trusted.
  - A role change or an account-to-employee link applies to the API immediately, with no re-login.
  - A valid token whose account no longer exists gets 401 "compte introuvable".
- `requireRole('ADMIN')` and the ownership checks on `/conges` and `/paie` use these fresh values. `role` is either `ADMIN` or `EMPLOYE`; an insufficient role gets 403.
- **Registration (`POST /auth/register`) takes a `role`**: `"employe"` (→ `EMPLOYE`, also the default when `role` is missing) or `"admin"` (→ `ADMIN`). Any other value gets 400. `RegisterPage` has a matching "Rôle" select, defaulting to "Employé". The user chose this deliberately, knowing the risk below. An account can also become ADMIN through the seed script or `PATCH /users/:id/role`.
- **Registering an EMPLOYE also gives it an employee record**, in the same transaction, so the employee can request leave right away. If this step fails, the account isn't created either.
  - If a free record (linked to no account) has the same `email`, ignoring case, it is linked to the account.
  - Otherwise a new record is created and linked:
    - `prenom` is the first word of the full name and `nom` is the rest;
    - `email` is stored in lowercase;
    - `chantierId` is `null`, so pointages are rejected until an admin assigns a chantier;
    - `tauxHoraire` and `volumeMensuelObligatoire` are `0`, so the paie is 0 until an admin fills them in.
  - If the record with that email is already linked to another account, registration fails with 409.
  - An ADMIN gets no record.
  - The logic is in `backend/src/modules/auth/fiche-employe.ts`.
- **`Employe.email` is optional and unique.** **`Employe.chantierId` is optional**, but deleting a chantier that still has employees is refused (`onDelete: Restrict`).

Models are defined in `backend/prisma/schema.prisma`. Request and response handling lives in `backend/src/modules/<name>/*.controller.ts`, and the business rules in `*.service.ts`.

| Prefix | Endpoints | Access |
|---|---|---|
| `/auth` | `POST /register`, `POST /login` (returns `{ token, role, employeId }`) | public |
| `/auth` | `GET /me` (returns `{ id, nom, email, role, employeId }`) | logged in |
| `/users` | `GET /`, `PATCH /:id/employe` (`{ employeId }`), `PATCH /:id/role` (`{ role }`) | ADMIN |
| `/conges` | `GET /?statut=`, `PATCH /:id/valider`, `PATCH /:id/refuser` (`{ motifRefus }`) | ADMIN |
| `/conges` | `GET /moi`, `GET /employe/:employeId`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` | ADMIN, or the employee concerned |
| `/paie` | `GET /:employeId?dateDebut=&dateFin=` (calculation only) | ADMIN, or the employee concerned |
| `/chantiers` | CRUD: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` | logged in (no role check) |
| `/employes` | CRUD (same shape) | logged in (no role check) |
| `/pointages` | CRUD (same shape) | **no authentication** |
| `/badges` | `POST /associate`, `GET /:uid/employe` | **no authentication** |
| `/geofencing` | `POST /check` | **no authentication** |

Backend rules the UI should reflect:
- **Changing a role** (`PATCH /users/:id/role`) returns these errors:
  - 400 if the role is missing or invalid
  - 403 if the admin targets their own account
  - 404 if the account is unknown
  - 409 if it would demote the last ADMIN. The count and the update run in one transaction with the ADMIN rows locked, so two simultaneous demotions can't remove the last ADMIN.
- **Congés** have a `statut`: `EN_ATTENTE` (initial), `VALIDE` or `REFUSE`, plus `motifRefus`, `traiteParId` and `traiteLe`.
  - `motif` is the optional reason for the request.
    - The backend trims it.
    - Empty or `null` is stored as `null`.
    - It is limited to 500 characters; anything that isn't text or is longer gets 400.
    - On `PUT`, a missing `motif` keeps the current one, and an empty one clears it.
  - The form sends `motif`; the admin and employee tables and the refusal dialog show it.
  - Don't confuse it with `motifRefus`, the admin's reason for refusing.
  - An EMPLOYE always creates leave for themselves: the employee comes from the token, so don't send `employeId`.
  - An EMPLOYE can only modify or delete their own leave while it is `EN_ATTENTE`, otherwise the backend returns 409.
  - Only `EN_ATTENTE` can be validated or refused. Anything else returns 409.
  - Overlap is checked against `EN_ATTENTE` and `VALIDE` leave only.
  - An account not linked to an employee gets 403 "Ce compte n'est associé à aucun employé". This only happens for accounts created before automatic linking that haven't been processed by `link-employes`, or for an account whose link was changed. "Mes congés" shows this message.
- **Creating a pointage** is rejected when any of these holds. The status alternates ENTREE → SORTIE automatically.
  - the employee is unknown
  - the employee has no badge, or the badge is inactive
  - the chantier is unknown
  - the GPS position is outside `rayonToleranceM`
  - the employee isn't assigned to that chantier
- **Paie** returns these figures:
  - hours worked
  - paid leave hours (`VALIDE` leave only, 8h per day)
  - overtime above `volumeMensuelObligatoire`, paid at ×1.25
  - deductions for unjustified absences
  - total salary

## Frontend integration status

Frontend types and API files were written by hand and can drift from the backend. Always check them against the backend controllers and the schema.

- **Done:**
  - authentication (`useAuth`, routes by role)
  - congés: the admin view with validation and refusal, and the employee view "Mes congés"
  - the "Utilisateurs" page (`/utilisateurs`, ADMIN): list of accounts and role changes
- **Paie:** the API layer is ready. `paie.api.ts` has `calculer`, `types.ts` has `ResultatPaie`, and `usePaie` exposes `calculer`. The backend route is mounted. The page and the `/paie` route are still missing, and the "Paies" link stays commented out in `Sidebar.tsx`.
- **Not done:**
  - no UI to link an account to an employee (`PATCH /users/:id/employe`), and no backend route to unlink one
  - the frontend `Employee` type doesn't have the new `email` field yet, and still types `chantierId` as always present
  - `/geofencing/check` isn't used anywhere. It is an optional preview, since the backend recomputes the geofence when a pointage is created.

## Bloqué côté backend

Report these to the user. Don't fix them, and don't work around them in the frontend.
- **Anyone can become ADMIN:** `POST /auth/register` is public and accepts `role: "admin"`, so any visitor can create an ADMIN account. The user chose this knowingly. Don't remove it without being asked, but mention it whenever security comes up.
- **Routes without authentication:** `/pointages`, `/badges` and `/geofencing` have no `authMiddleware`.
- **No role check on `/chantiers` and `/employes`:** they only require being logged in.
  - The frontend restricts the `/employes` page to ADMIN.
  - The `/chantiers` page is open to EMPLOYE in **read-only** mode: the add, edit and delete buttons are hidden when `role !== 'ADMIN'`, in `TableauChantiers.tsx`.
  - Both are ergonomics only: an EMPLOYE can still call `POST`, `PUT` and `DELETE /chantiers` directly on the API.
- **`alertHorsZone` is always `false`:** the backend rejects out-of-zone pointages instead of flagging them. Any frontend "hors zone" alert can't come from real data.
- **`backend/dist/` is out of date:** it is committed to git but doesn't include conges, paie, roles or users.
