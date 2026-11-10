from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from server.app import extract_text, index_document, init_db


def main() -> None:
    parser = argparse.ArgumentParser(description="Indexe un corpus juridique local dans VIGILIA")
    parser.add_argument("path", nargs="?", default="data/corpus", help="Fichier ou dossier à indexer")
    parser.add_argument("--folder", default="legislation", help="Périmètre documentaire")
    args = parser.parse_args()
    root = Path(args.path)
    files = [root] if root.is_file() else sorted(
        item for item in root.rglob("*")
        if item.suffix.lower() in {".pdf", ".docx", ".txt", ".md"}
        and item.name.lower() != "readme.md"
    )
    init_db()
    if not files:
        print(f"Aucun document compatible dans {root}")
        return
    for path in files:
        raw = path.read_bytes()
        document_id = hashlib.sha256(raw).hexdigest()[:16]
        pages = extract_text(path.name, raw)
        metadata_path = path.with_suffix(path.suffix + ".meta.json")
        metadata = json.loads(metadata_path.read_text(encoding="utf-8")) if metadata_path.exists() else {}
        title = metadata.get("title", path.stem.replace("_", " "))
        count = index_document(document_id, args.folder, title, path.name, pages, metadata.get("source_url"), metadata.get("effective_date"))
        print(f"{path.name}: {count} passages indexés")


if __name__ == "__main__":
    main()
