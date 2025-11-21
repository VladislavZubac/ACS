#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDS=()

cleanup() {
  if [[ ${#PIDS[@]} -gt 0 ]]; then
    echo "Stopping services..."
    for pid in "${PIDS[@]}"; do
      if kill -0 "$pid" >/dev/null 2>&1; then
        kill "$pid" >/dev/null 2>&1 || true
      fi
    done
  fi
}

trap cleanup EXIT

start_backend() {
  echo "Starting backend (http://localhost:8080)..."
  (
    cd "$ROOT_DIR/backend/acs"
    ./mvnw spring-boot:run
  ) &
  PIDS+=($!)
}

start_frontend() {
  echo "Starting user frontend (http://localhost:3000)..."
  (
    cd "$ROOT_DIR/frontend"
    npm install >/dev/null 2>&1 || true
    PORT=3000 npm run dev -- --port 3000
  ) &
  PIDS+=($!)
}

start_admin() {
  echo "Starting admin frontend (http://localhost:3001)..."
  (
    cd "$ROOT_DIR/admin"
    npm install >/dev/null 2>&1 || true
    PORT=3001 npm run dev -- --port 3001
  ) &
  PIDS+=($!)
}

start_backend
start_frontend
start_admin

echo "All services are running. Press Ctrl+C to stop."
wait


