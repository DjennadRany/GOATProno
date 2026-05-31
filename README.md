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

3. **Important — réglages Build** (Settings → Build & Development Settings) :

| Paramètre | Valeur |
|-----------|--------|
| Framework Preset | **Next.js** |
| Build Command | `npm run build` (ou laisser vide = auto) |
| Output Directory | **vide** (ne pas mettre `.next` ni `public`) |
| Root Directory | vide (sauf si l'app est dans un sous-dossier) |

4. Redéployer (**Deployments → … → Redeploy**).

### Erreur 404 sur Vercel

Si le build réussit mais le site affiche `404 NOT FOUND` (page blanche Vercel), ce n'est **pas** un problème de variables d'environnement — **garde `FOOTBALL_DATA_TOKEN`**.

La cause est presque toujours **Output Directory** réglé sur `.next` (ancien `vercel.json`). Vercel sert alors des fichiers bruts au lieu de l'app Next.js. Vide ce champ, vérifie que le Framework est **Next.js**, puis redéploie.
