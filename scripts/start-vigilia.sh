#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

OLLAMA_URL="${VIGILIA_OLLAMA_URL:-http://127.0.0.1:11434}"
API_URL="http://127.0.0.1:8000/api/health"
WEB_URL="http://127.0.0.1:5173"
RUNTIME_DIR="${TMPDIR:-/tmp}/vigilia-runtime"
mkdir -p "$RUNTIME_DIR"

started_pids=()

cleanup() {
  if [ "${#started_pids[@]}" -gt 0 ]; then
    echo
    echo "Arrêt des services VIGILIA…"
    for pid in "${started_pids[@]}"; do
      kill "$pid" 2>/dev/null || true
    done
    wait "${started_pids[@]}" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

wait_for_url() {
  local url="$1"
  local label="$2"
  local attempts="${3:-40}"
  for ((i=1; i<=attempts; i++)); do
    if curl --silent --fail --max-time 1 "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.25
  done
  echo "Échec du démarrage de $label. Consultez $RUNTIME_DIR."
  return 1
}

echo "VIGILIA — démarrage local"

if [ ! -x .venv/bin/uvicorn ]; then
  echo "Installation du backend Python (premier lancement)…"
  python3 -m venv .venv
  .venv/bin/python -m pip install --quiet --upgrade pip
  .venv/bin/pip install --quiet -r server/requirements.txt
fi

if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama est requis : https://ollama.com/download"
  exit 1
fi

if curl --silent --fail --max-time 1 "$OLLAMA_URL/api/tags" >/dev/null 2>&1; then
  echo "✓ Ollama est déjà actif"
else
  echo "Démarrage d’Ollama…"
  ollama serve >"$RUNTIME_DIR/ollama.log" 2>&1 &
  started_pids+=("$!")
  wait_for_url "$OLLAMA_URL/api/tags" "Ollama"
fi

if ! ollama list 2>/dev/null | awk 'NR > 1 {print $1}' | grep -Fxq 'qwen3:1.7b'; then
  echo "Téléchargement de Qwen3 1.7B (une seule fois)…"
  ollama pull qwen3:1.7b
else
  echo "✓ Qwen3 1.7B est installé"
fi

if ! ollama list 2>/dev/null | awk 'NR > 1 {print $1}' | grep -Fxq 'qwen3-embedding:0.6b'; then
  echo "Téléchargement du modèle d’embeddings (une seule fois)…"
  ollama pull qwen3-embedding:0.6b
else
  echo "✓ Modèle d’embeddings installé"
fi

document_count="$({ .venv/bin/python - <<'PY'
import sqlite3
from pathlib import Path
path = Path("data/vigilia.db")
if not path.exists():
    print(0)
else:
    try:
        with sqlite3.connect(path) as db:
            print(db.execute("SELECT COUNT(*) FROM documents").fetchone()[0])
    except sqlite3.Error:
        print(0)
PY
} 2>/dev/null)"

if [ "${document_count:-0}" = "0" ]; then
  echo "Initialisation du corpus juridique officiel…"
  .venv/bin/python -m server.ingest
else
  echo "✓ Corpus local : $document_count document(s)"
fi

if curl --silent --fail --max-time 1 "$API_URL" >/dev/null 2>&1; then
  echo "✓ API VIGILIA déjà active"
else
  echo "Démarrage de l’API VIGILIA…"
  .venv/bin/uvicorn server.app:app --host 127.0.0.1 --port 8000 >"$RUNTIME_DIR/api.log" 2>&1 &
  started_pids+=("$!")
  wait_for_url "$API_URL" "l’API VIGILIA"
fi

if curl --silent --fail --max-time 1 "$WEB_URL" >/dev/null 2>&1; then
  echo "✓ Interface déjà active : $WEB_URL"
  echo "Appuyez sur Ctrl+C pour arrêter les services lancés par cette commande."
  while true; do sleep 3600; done
fi

echo "✓ Ouverture de VIGILIA sur $WEB_URL"
echo "  Logs : $RUNTIME_DIR"
echo "  Arrêt : Ctrl+C"

npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
