# Reusable SaaS MVP Starter (FastAPI + Next.js)

This repository is a reusable SaaS starter template intended for future MVPs.

## Production architecture (intended)

### Backend (FastAPI)
- Entry point: `backend/app/main.py`
- Core contracts:
  - Health: `GET /health`
  - Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`
  - Project example module: `POST /projects`, `GET /projects`, `GET /projects/{id}`, `DELETE /projects/{id}`

### Backend persistence layering
- Entities/models: `backend/app/models.py`
- Repository layer: `backend/app/repository.py`
- Service layer: `backend/app/service.py`
- Routes call services; services call repositories.

### Frontend (Next.js + TypeScript)
- Reusable app shell:
  - `frontend/components/shell/AppShell.tsx`
  - `frontend/components/shell/ProtectedShell.tsx`
  - `frontend/config/navigation.ts`
  - responsive sidebar + topbar + user menu + mobile nav toggle
- Reusable UX building blocks:
  - `frontend/components/shell/PageContainer.tsx`
  - `frontend/components/states/{LoadingState,ErrorState,EmptyState}.tsx`
- Example pages:
  - `/dashboard` (welcome, summary cards, quick actions, recent activity placeholder)
  - `/projects/[id]` (example detail page)

## Sandbox verification path (cloud-only)
- Backend fallback:
  - `backend/sandbox_persistence.py` (in-memory model/repo/service fallback)
  - `backend/sandbox_server.py` exposes mirrored contracts (`/health`, `/auth/*`, `/projects*`)
- Frontend fallback:
  - `frontend/sandbox_server.mjs` exposes `/health-check`, `/api/auth*`, `/api/projects*`
- Smoke tests:
  - `backend/tests/test_sandbox_health.py`
  - `backend/tests/test_sandbox_auth.py`
  - `backend/tests/test_sandbox_persistence.py`
  - `backend/tests/test_sandbox_project.py`
  - `frontend/tests/smoke.test.mjs`
  - `frontend/tests/shell_smoke.test.mjs`
  - `frontend/tests/auth_smoke.test.mjs`
  - `frontend/tests/project_smoke.test.mjs`

## Adding future MVP modules
1. Add production entity + repository + service in `backend/app/`.
2. Add matching route handlers in `backend/app/main.py`.
3. Add sandbox fallback behavior in `backend/sandbox_persistence.py` + `backend/sandbox_server.py`.
4. Add frontend module UI under `frontend/app/` using shared shell components.
5. Add sandbox smoke tests that validate module flow via fallback servers.

## Environment limitation
- In this cloud environment, pip/npm registry access is blocked (HTTP 403).
- Full production runtime install/start is blocked by policy.
- Sandbox path is designed to remain runnable and verifiable under this constraint.
