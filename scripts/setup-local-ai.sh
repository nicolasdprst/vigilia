#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/pip install -r server/requirements.txt

if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama n'est pas installé : https://ollama.com/download"
  exit 1
fi

ollama pull qwen3:1.7b
ollama pull qwen3-embedding:0.6b
mkdir -p data/corpus

echo "Installation terminée. Lancez dans deux terminaux :"
echo "  npm run server"
echo "  npm run dev"
