# VIGILIA — recherche juridique locale

VIGILIA est une interface LegalTech React couplée à un moteur RAG local. Les
documents, l'index, les embeddings, les prompts et les réponses restent sur le
poste. Qwen3 1.7B synthétise uniquement les passages retrouvés et chaque réponse
juridique doit pointer vers ses sources.

Le lancement fourni écoute uniquement sur `127.0.0.1`. Il s'agit donc d'une
configuration monoposte. Une exposition sur le réseau du cabinet exige en plus
une authentification, des autorisations par dossier et un frontal TLS ; ces
contrôles ne sont pas fournis par ce prototype.

> VIGILIA est un outil de recherche, pas une consultation juridique ni une source
> officielle. La pertinence dépend de la qualité et de la date du corpus importé.

## Installation rapide

Prérequis : Node.js 20+, Python 3.11+ et Ollama.

```bash
npm install
npm run setup:local-ai
```

Ensuite, une seule commande démarre Ollama si nécessaire, l'API et l'interface :

```bash
npm start
```

L'interface est disponible sur `http://localhost:5173` et l'API locale sur
`http://127.0.0.1:8000`. Quand le backend ou Ollama est arrêté, l'interface le
signale et conserve son scénario de démonstration pour les dossiers fictifs.
Le lanceur réutilise automatiquement les services déjà actifs : l'erreur
`address already in use` d'Ollama ne doit donc plus se produire.

## Charger la législation française

Exportez les textes consolidés depuis une source officielle, placez les fichiers
PDF, DOCX, TXT ou Markdown dans `data/corpus`, puis lancez :

```bash
npm run ingest
```

Un document peut aussi être importé depuis la Bibliothèque. Pour un audit fiable,
incluez la date de consolidation dans le nom du fichier et conservez l'URL
officielle dans un fichier compagnon `nom.pdf.meta.json` (format documenté dans
`data/corpus/README.md`). L'API Légifrance requiert un compte
PISTE et des identifiants OAuth : aucune clé n'est attendue dans le frontend.

Les PDF purement scannés doivent être OCRisés avant import. Aucun texte juridique
fictif n'est préchargé. Un corpus officiel minimal et daté est indexé au premier
démarrage afin de tester immédiatement la recherche ; il ne remplace pas un
corpus métier complet et régulièrement mis à jour.

## Architecture

```text
Question
  └─ recherche lexicale SQLite FTS5 (termes et numéros d'articles)
  └─ recherche sémantique Qwen3 Embedding 0.6B (sens et paraphrases)
       └─ seuil de pertinence, fusion RRF et sélection de 6 passages
            └─ Qwen3 1.7B Q4, température 0.1, contexte 8K, no-think
                 └─ JSON validé + citations cliquables + refus sans source
```

Choix de performance : SQLite en mode WAL, embeddings calculés à l'indexation,
contexte court, modèle maintenu en mémoire 30 minutes et raisonnement long coupé.
Si le modèle d'embeddings n'est pas disponible, FTS5 continue de fonctionner.
Les passages sans embedding sont réparés en arrière-plan au prochain démarrage
où le modèle est disponible. Les réponses générées sans citation valide sont
refusées côté serveur.

## Configuration

Copiez au besoin `.env.example` vers `.env` et exportez les variables avant de
lancer le serveur. Variables principales :

- `VIGILIA_MODEL` : modèle Ollama de génération, par défaut `qwen3:1.7b` ;
- `VIGILIA_EMBED_MODEL` : embeddings, par défaut `qwen3-embedding:0.6b` ;
- `VIGILIA_OLLAMA_URL` : URL locale Ollama ;
- `VIGILIA_DB` : chemin de la base SQLite ;
- `VIGILIA_TOP_K` : nombre de passages transmis à Qwen (3 à 10).
- `VIGILIA_DENSE_MIN_SCORE` : similarité minimale d'un passage sémantique,
  par défaut `0.45` ; à calibrer avec le corpus et les tests de non-réponse.

## Vérifications

```bash
npm run build
npm test
npm run test:backend
python3 -m compileall server
```

Le backend se trouve dans `server/`, le client API dans
`src/services/localAssistant.ts`, et le diagnostic temps réel dans la page
Confidentialité.
# vigilia
