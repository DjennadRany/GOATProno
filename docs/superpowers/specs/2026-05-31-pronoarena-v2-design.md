# PronoArena V2 — Multi-ligues, Favoris, Recherche

**Date:** 2026-05-31  
**Status:** Approved

---

## 1. Périmètre

Extension de la V1 (CdM 2026 uniquement) vers une app multi-compétitions avec recherche et favoris équipes.

---

## 2. Compétitions disponibles (tier gratuit)

| Code | Nom | Zone |
|------|-----|------|
| WC | FIFA World Cup | Monde |
| CL | UEFA Champions League | Europe |
| EC | European Championship | Europe |
| PL | Premier League | Angleterre |
| ELC | Championship | Angleterre |
| BL1 | Bundesliga | Allemagne |
| SA | Serie A | Italie |
| FL1 | Ligue 1 | France |
| PD | Primera Division (La Liga) | Espagne |
| DED | Eredivisie | Pays-Bas |
| PPL | Primeira Liga | Portugal |
| BSA | Brasileiro Série A | Brésil |
| CLI | Copa Libertadores | Amérique du Sud |

---

## 3. Routing

| Route | Contenu |
|-------|---------|
| `/` | Grille des 13 compétitions |
| `/competition/[code]` | Matchs + pronos d'une compétition |
| `/favorites` | Mes équipes + leurs prochains matchs |

Barre de recherche globale : overlay accessible depuis toutes les pages via icône loupe dans le Header.

---

## 4. API Routes

| Endpoint | Source | Cache |
|----------|--------|-------|
| `GET /api/competitions` | Liste statique hardcodée | Statique |
| `GET /api/competitions/[code]/matches` | Football-Data.org | 5 min |
| `GET /api/competitions/[code]/teams` | Football-Data.org | 24h |

- `/api/competitions` retourne les 13 compétitions hardcodées (pas d'appel réseau)
- `/api/competitions/[code]/matches` remplace l'ancien `/api/matches`
- `/api/competitions/[code]/teams` charge les équipes une fois, cache 24h côté serveur

---

## 5. Favoris

**Stockage :** `localStorage` — clé `pronoArena_v1_favorites`

```ts
interface FavoriteTeam {
  teamId: number
  teamName: string
  crest: string
  competitionCode: string
  competitionName: string
}
```

**Dans `/competition/[code]`** :
- Les MatchCards d'une équipe favorite ont une bordure teal + badge ⭐
- Ces matchs remontent en haut de la liste
- Bouton "⭐ Suivre / Ne plus suivre" sur chaque équipe dans la MatchCard

**Dans `/favorites`** :
- Liste de toutes les équipes suivies
- Leurs prochains matchs (toutes compétitions) triés par date
- Bouton "✕ Ne plus suivre" sur chaque équipe

---

## 6. Recherche

**Déclenchement :** icône loupe dans le Header → overlay fullscreen

**Fonctionnement :**
- Input avec debounce 300ms
- Recherche client-side sur les données déjà chargées en mémoire
- 0 appel API supplémentaire

**Résultats :**
- Section "Équipes" → clic = toggle favori OU lien vers la compétition
- Section "Matchs" → clic = lien vers `/competition/[code]`

**Données sources :**
- Les équipes sont pré-chargées via `/api/competitions/[code]/teams` (cache 24h)
- Un store global (React Context ou simple module) agrège les équipes de toutes les compétitions visitées

---

## 7. Nouveaux fichiers

```
/app
  page.tsx                          ← Grille compétitions (remplace page actuelle)
  /competition
    /[code]
      page.tsx                      ← Matchs d'une compétition
  /favorites
    page.tsx                        ← Mes équipes
  /api
    /competitions
      route.ts                      ← Liste statique
      /[code]
        /matches
          route.ts                  ← Matchs d'une compétition
        /teams
          route.ts                  ← Équipes d'une compétition

/components
  CompetitionCard.tsx               ← Card cliquable sur la grille d'accueil
  SearchOverlay.tsx                 ← Overlay de recherche globale
  FavoriteButton.tsx                ← Bouton ⭐ sur les équipes
  FavoritesMatchList.tsx            ← Liste de matchs sur /favorites

/services
  favorites.ts                      ← CRUD localStorage favoris
  teamsCache.ts                     ← Cache in-memory des équipes chargées

/domain
  competition.ts                    ← Type Competition, COMPETITIONS constant
  favorite.ts                       ← Type FavoriteTeam
```

---

## 8. Contraintes

- **Quota API** : ne jamais appeler Football-Data.org directement depuis le navigateur
- **Rate limit** : pas de recherche cross-API en temps réel ; tout se fait en client-side sur données cachées
- **localStorage** : favoris + pronos uniquement, pas de données API
