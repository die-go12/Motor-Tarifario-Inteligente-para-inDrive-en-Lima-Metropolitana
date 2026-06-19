#!/usr/bin/env bash
# ============================================================
#  inDrive+ · Script de inicio
#
#  Uso:
#    ./start.sh          → Inicia servicios y carga datos demo
#                          (conserva usuarios existentes)
#    ./start.sh --reset  → Borra datos y parte de cero
# ============================================================
set -e

DOCKER_DIR="$(cd "$(dirname "$0")/indrive-plus/docker" && pwd)"
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
SEED="$ROOT_DIR/admin-panel/seed.js"

# ─── helpers ──────────────────────────────────────────────
log()  { echo -e "\033[1;32m[inDrive+]\033[0m $*"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $*"; }
err()  { echo -e "\033[1;31m[ERROR]\033[0m $*"; exit 1; }

wait_service() {
  local url=$1 label=$2 max=${3:-30} i=0
  log "Esperando $label..."
  until curl -s "$url" >/dev/null 2>&1; do
    ((i++)) && [ $i -ge $max ] && err "$label no respondió en $max s"
    sleep 1
  done
  log "$label ✓"
}

# ─── RESET opcional ───────────────────────────────────────
if [[ "$1" == "--reset" ]]; then
  warn "⚠️  Modo RESET: se borrarán todos los datos y usuarios."
  read -rp "  ¿Confirmar? (s/n): " confirm
  [[ "$confirm" != "s" && "$confirm" != "S" ]] && { log "Cancelado."; exit 0; }

  cd "$DOCKER_DIR"
  docker compose down --remove-orphans 2>/dev/null || true
  docker volume rm docker_postgres_data docker_mongo_data 2>/dev/null || true
  log "Volúmenes eliminados. Se inicializará la BD desde cero."
fi

# ─── Inicio de servicios ──────────────────────────────────
log "Iniciando servicios Docker..."
cd "$DOCKER_DIR"
docker compose up -d --remove-orphans

# ─── Esperar que ms-base responda ─────────────────────────
wait_service "http://localhost:3001/api" "ms-base (puerto 3001)" 60

# ─── Seed idempotente (no borra usuarios existentes) ──────
log "Cargando datos demo (idempotente)..."
if node "$SEED"; then
  log "Seed completado ✓"
else
  warn "Seed saltó algunos pasos (usuarios demo ya existen, eso es normal)."
fi

# ─── Resumen ──────────────────────────────────────────────
echo ""
log "========================================"
log "  Todo listo "
log "========================================"
echo "  Admin panel : http://localhost:8080"
echo "  API Gateway : http://localhost:3000"
echo "  ms-base     : http://localhost:3001"
echo "  ms-pricing  : http://localhost:3002"
echo ""
echo "  Usuario admin : admin.demo@indrive.pe"
echo "  Contraseña    : Secret123"
echo ""
