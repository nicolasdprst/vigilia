from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from server import app


class RagSafetyTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.previous_db = app.DB_PATH
        app.DB_PATH = Path(self.tempdir.name) / "test.db"
        app.init_db()

    def tearDown(self) -> None:
        app.DB_PATH = self.previous_db
        self.tempdir.cleanup()

    def test_common_words_do_not_create_a_lexical_false_positive(self) -> None:
        with app.database() as db:
            db.execute(
                "INSERT INTO documents(id,folder_id,title,filename,pages) VALUES(?,?,?,?,?)",
                ("doc", "legislation", "Code civil", "code.txt", 1),
            )
            db.execute(
                "INSERT INTO chunks(id,document_id,folder_id,page,ordinal,heading,content) VALUES(?,?,?,?,?,?,?)",
                ("chunk", "doc", "legislation", 1, 0, "Article 1218", "La force majeure empêche l'exécution."),
            )
            db.execute(
                "INSERT INTO chunks_fts(chunk_id,folder_id,heading,content) VALUES(?,?,?,?)",
                ("chunk", "legislation", "Article 1218", "La force majeure empêche l'exécution."),
            )

        with patch.object(app, "embed", return_value=None):
            self.assertEqual(app.retrieve("recette de tarte aux pommes", "legislation"), [])

    def test_generated_sections_must_have_a_valid_citation(self) -> None:
        response = {
            "title": "Réponse",
            "intro": "Introduction",
            "sections": [{"heading": "Règle", "body": "Une affirmation.", "citations": []}],
        }
        chunks = [{"title": "Code civil", "page": 1, "heading": "Article", "content": "Texte"}]
        with patch.object(app, "ollama", return_value={"response": __import__("json").dumps(response)}):
            with self.assertRaisesRegex(ValueError, "aucune source valide"):
                app.generate_answer("Question", chunks)


if __name__ == "__main__":
    unittest.main()
