#!/usr/bin/env bash
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
backend_status=0
frontend_status=0

echo "[setup] backend dependencies"
cd "$ROOT_DIR/backend"
python -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
pip install -r requirements.txt || backend_status=$?

echo "[setup] frontend dependencies"
cd "$ROOT_DIR/frontend"
npm install || frontend_status=$?

if [[ $backend_status -ne 0 || $frontend_status -ne 0 ]]; then
  echo "[setup] failed (backend=$backend_status frontend=$frontend_status)"
  exit 1
fi

echo "[setup] success"
