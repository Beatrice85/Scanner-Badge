# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Scope rule: frontend only

The user is a frontend developer. **Never modify anything under `backend/`.** That covers code, the Prisma schema, migrations, `swagger.yaml`, `dist/` and config. Treat the backend as a fixed API contract.

You may read backend files to learn what endpoints exist, what payloads they expect, what they return and what errors they send. If a feature looks blocked by the backend (bug, missing route, unmounted module), tell the user. Don't patch it. Adapt the frontend to the API as it is now.

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
`VITE_API_BASE_URL` in `frontend/.env` points to the backend. The deployed API is https://scanner-badge.onrender.com, and its Swagger docs are at `/api-docs`. There is no frontend test runner.

To run the backend locally against the frontend (this runs it without modifying it): in `backend/`, run `docker compose up -d` and then `npm run dev` (port 3000). It needs `backend/.env` with `DATABASE_URL`, `DIRECT_URL` and `JWT_SECRET`.

## Frontend architecture

The stack is React 19 + Vite + Tailwind 3, with a mix of `.jsx` and `.tsx` files. Maps use Leaflet (react-leaflet) and charts use Recharts.

- `src/features/<domain>/` follows this pattern:
  - `api/<domain>.api.ts`: thin wrappers around the shared client.
  - `hooks/use<Domain>.ts`: local `useState` plus fetch/create/update/delete. There is no global store and no React Query.
  - `components/`
  - an optional `types.ts`

  Copy this pattern when you add a feature.
- `src/shared/lib/client-http.ts` is the only fetch wrapper. It prefixes `VITE_API_BASE_URL`, adds `Authorization: Bearer <localStorage.auth_token>`, and throws an `Error` whose message is the response body text on any non-2xx status. The backend sends errors as `{ "message": "..." }`.
- `src/routes/RouteurApp.tsx` holds every route. `RouteProtegee` only checks that `auth_token` exists in localStorage. When you add a page, register its route here and add the link in `src/shared/components/Sidebar.tsx`.
- `src/shared/components/` contains reusable UI: Tableau, Pagination, FenetreModale, Bouton, Chargement, StatChart, Sidebar.

## Backend API contract (read-only reference)

Every route except `/auth` needs a JWT Bearer token. Models are defined in `backend/prisma/schema.prisma`. Request and response handling lives in `backend/src/modules/<name>/*.controller.ts`, and the business rules in `*.service.ts`.

| Prefix | Endpoints |
|---|---|
| `/auth` | `POST /register`, `POST /login` |
| `/chantiers` | CRUD: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` |
| `/employes` | CRUD (same shape) |
| `/pointages` | CRUD (same shape) |
| `/conges` | CRUD, plus `GET /employe/:employeId` |
| `/badges` | `POST /associate`, `GET /:uid/employe` |
| `/geofencing` | `POST /check` |
| `/paie` | `GET /:employeId?dateDebut=&dateFin=` (calculation only, no CRUD). **Not mounted yet, see "Bloqué côté backend".** |

Backend rules the UI should reflect:
- **Creating a pointage** is rejected when any of these holds. The status alternates ENTREE → SORTIE automatically.
  - the employee is unknown
  - the employee has no badge, or the badge is inactive
  - the chantier is unknown
  - the GPS position is outside `rayonToleranceM`
  - the employee isn't assigned to that chantier
- **Congés**: `{ employeId, dateDebut, dateFin }` only. A request is rejected if `dateDebut > dateFin` or if it overlaps another leave period of the same employee.
- **Paie** returns these figures:
  - hours worked
  - paid leave hours (8h per day)
  - overtime above `volumeMensuelObligatoire`, paid at ×1.25
  - deductions for unjustified absences
  - total salary

## Frontend integration status

Frontend types and API files were written by hand and can drift from the backend. Always check them against the backend controllers and the schema. `features/conges` has been aligned with the backend.

- **Paie:** the API layer is ready: `paie.api.ts` has `calculer(employeId, dateDebut, dateFin)`, `types.ts` has `ResultatPaie`, and `usePaie` exposes `calculer`. The page and the `/paie` route are still missing. The "Paies" link in `Sidebar.tsx` is commented out until the backend mounts the router.
- **Geofencing:** `/geofencing/check` isn't used anywhere. It is an optional preview: the backend recomputes the geofence itself when a pointage is created.

## Bloqué côté backend

Report these to the user. Don't fix them.
- The paie router is not mounted in `backend/src/app.ts`, so `GET /paie/:employeId` returns 404.
- `alertHorsZone` is always stored as `false`, because the backend rejects out-of-zone pointages instead of flagging them. Any frontend "hors zone" alert can't come from real data.
- `backend/dist/` is committed to git and out of date: it has no conges or paie.
