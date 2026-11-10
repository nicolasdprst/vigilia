# Corpus juridique local

Déposez ici les exports PDF, DOCX, TXT ou Markdown provenant de sources officielles,
puis lancez `npm run ingest`. Conservez la date de consolidation dans le nom du
fichier (par exemple `code_civil_2026-11-10.pdf`) pour faciliter les audits.

Un fichier compagnon optionnel `code_civil.pdf.meta.json` permet d'afficher la
version et le lien officiel dans chaque citation :

```json
{
  "title": "Code civil — version consolidée",
  "effective_date": "2026-11-10",
  "source_url": "https://www.legifrance.gouv.fr/"
}
```

VIGILIA inclut seulement un corpus officiel minimal clairement daté pour rendre la
première recherche testable. Il ne prétend pas couvrir l'ensemble du droit
français et doit être complété par les textes nécessaires au cabinet.
