# Reusable SaaS MVP Starter (FastAPI + Next.js)

This repository is a reusable SaaS starter template. The **Project** module is included only as an example of how to add modules.

## What belongs to starter-core

### Production backend core
- FastAPI app entrypoint: `backend/app/main.py`
- Layering pattern:
  - entities/models in `backend/app/models.py`
  - repositories in `backend/app/repository.py`
  - services in `backend/app/service.py`
- Shared response convention:
  - success: `{ "data": ..., "error": null }`
  - error: `{ "data": null, "error": { "code", "message" } }`

### Production frontend core
- Reusable app shell and protected layout:
  - `frontend/components/shell/AppShell.tsx`
  - `frontend/components/shell/ProtectedShell.tsx`
  - `frontend/app/(app)/layout.tsx`
- Reusable primitives:
  - `frontend/components/shell/PageContainer.tsx`
  - `frontend/components/ui/{PageHeader,SectionHeader,Card,DataList}.tsx`
  - `frontend/components/states/{LoadingState,ErrorState,EmptyState}.tsx`
- Reusable navigation config:
  - `frontend/config/navigation.ts`

## What belongs to example-module
- `Project` entity and CRUD routes (`/projects*`) demonstrate module structure only.
- UI pages under `/dashboard` and `/projects/[id]` demonstrate module integration in the reusable shell.

## Production route contracts
- Health: `GET /health`
- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`
- Example module (Project): `POST /projects`, `GET /projects`, `GET /projects/{id}`, `DELETE /projects/{id}`

## Sandbox verification path (cloud-only)
- Backend fallback:
  - `backend/sandbox_persistence.py`
  - `backend/sandbox_server.py`
- Frontend fallback:
  - `frontend/sandbox_server.mjs` (`/health-check`, `/api/auth*`, `/api/projects*`)
- Smoke tests:
  - backend: `backend/tests/test_sandbox_*.py`, `test_sandbox_persistence.py`
  - frontend: `frontend/tests/{smoke,shell_smoke,auth_smoke,project_smoke}.test.mjs`

## How to add a new module
1. Add entity/model to `backend/app/models.py`.
2. Add repository abstraction + in-memory implementation in `backend/app/repository.py`.
3. Add service orchestration in `backend/app/service.py`.
4. Add FastAPI routes in `backend/app/main.py` using response convention.
5. Mirror behavior in sandbox fallback (`backend/sandbox_persistence.py`, `backend/sandbox_server.py`).
6. Add frontend client helper in `frontend/lib/` and pages under `frontend/app/(app)/`.
7. Add sandbox smoke tests in both `backend/tests/` and `frontend/tests/`.

## Environment limitation
- pip/npm registry access is blocked in this environment (HTTP 403), so production runtime install/start is blocked by policy.
- Sandbox path is designed to remain runnable and verifiable under this constraint.
