# PronoArena — Coupe du Monde 2026

Application de pronostics football. Stack : Next.js 16 · TypeScript · Tailwind CSS v4 · localStorage

## Installation

```bash
npm install
```

## Configuration

```bash
cp .env.local.example .env.local
```

Renseigner la clé dans `.env.local` (clé gratuite sur [football-data.org](https://www.football-data.org/)) :

```
FOOTBALL_DATA_TOKEN=ta_clé_ici
```

## Démarrage

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Tests

```bash
npm test
```

## Déploiement Vercel

1. Importer le dépôt sur [vercel.com](https://vercel.com)
2. Dans **Settings → Environment Variables**, ajouter :

| Variable | Valeur |
|----------|--------|
| `FOOTBALL_DATA_TOKEN` | ta clé football-data.org |

3. Déployer.
