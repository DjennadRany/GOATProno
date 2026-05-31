# PronoArena V3 — Club Pages, Player Pages, Bracket, Standings

**Date:** 2026-05-31  
**Status:** Approved

---

## 1. Périmètre

Extension de la V2 vers un contexte club/joueur complet : pages dédiées club et joueur, vue bracket pour les coupes, classement journée pour les ligues, page pronos enrichie avec résultats réels.

---

## 2. Nouvelles routes

| Route | Contenu |
|-------|---------|
| `/competition/[code]` | MODIFIÉ : onglets Matchs / Bracket ou Classement |
| `/competition/[code]/bracket` | Arbre tournoi (coupes uniquement) |
| `/competition/[code]/standings` | Classement journée (ligues uniquement) |
| `/club/[id]` | Page club : bannière logo, effectif, forme, matchs |
| `/player/[id]` | Page joueur : photo Wikidata, infos, équipe |
| `/pronos` | MODIFIÉ : résultats réels chargés, points calculés |

---

## 3. Images

| Élément | Source | Fallback |
|---------|--------|----------|
| Logo/bannière club | `crest` football-data.org (agrandi en hero) | Placeholder initiales |
| Photo joueur | Wikidata P18 via `wikidataMedia.ts` | Silhouette SVG |

Pas de TheSportsDB — le logo du club centré et agrandi fait office de bannière.

---

## 4. Page Club `/club/[id]`

**Header** : logo club grand format (hero), nom, pays, stade si disponible.

**Sections** :
- Forme récente (5 derniers résultats : V/N/D avec scores)
- Effectif groupé par poste (Gardiens / Défenseurs / Milieux / Attaquants)
- Chaque joueur : photo Wikidata + nom + numéro + nationalité → cliquable vers `/player/[id]`
- Prochains matchs du club (3 max, avec lien vers la compétition)

**Data** :
- `GET /api/clubs/[id]` → `football-data.org/v4/teams/{id}` (squad + info)
- `GET /api/clubs/[id]/matches` → matchs récents et à venir
- Photos joueurs : chargées individuellement via `wikidataMedia.ts`, cachées localStorage

---

## 5. Page Joueur `/player/[id]`

**Header** : photo Wikidata (ou silhouette), nom, poste, nationalité + drapeau.

**Sections** :
- Infos : âge, date de naissance, numéro de maillot, nationalité
- Équipe actuelle avec lien vers `/club/[id]`
- Contrat jusqu'à (si disponible)

**Data** :
- `GET /api/players/[id]` → `football-data.org/v4/persons/{id}`
- Photo : `wikidataMedia.ts` avec cache localStorage

**Note** : stats détaillées (buts/assists) non disponibles en gratuit — on n'affiche pas de stats inventées.

---

## 6. Bracket & Standings

### Coupes (WC, CL, EC, CLI)
Onglet **"Bracket"** sur `/competition/[code]` :
- Groupes phase : tableau avec équipes et scores
- Phase knockout : arbre visuel horizontal (1/8 → 1/4 → 1/2 → Finale)
- Chaque match du bracket est cliquable → ouvre la MatchCard avec prono

### Ligues (PL, BL1, SA, FL1, PD, DED, PPL, ELC, BSA)
Onglet **"Classement"** sur `/competition/[code]` :
- Tableau : rang, logo, équipe, J/V/N/D, BP/BC, Pts, forme (5 derniers)
- Ligne surlignée si équipe en favoris
- Clic sur équipe → `/club/[id]`

**Data** :
- `GET /api/competitions/[code]/standings` → `football-data.org/v4/competitions/{code}/standings`

---

## 7. Page Pronos améliorée `/pronos`

Pour chaque prono sauvegardé :
- Charger le match correspondant via `/api/competitions/[code]/matches` (par compétition groupée)
- Afficher : score prédit / score réel (si disponible) / points gagnés
- Trier : matchs terminés en premier (avec résultats), puis à venir
- Total points en haut

---

## 8. Service Wikidata

```typescript
// services/wikidataMedia.ts
const CACHE_KEY = "pronoArena_wikidata_cache"

async function searchPlayerImage(playerName: string): Promise<string | null>
// 1. GET https://www.wikidata.org/w/api.php?action=wbsearchentities&search={name}&type=item
// 2. Prendre le premier résultat foot (QID)
// 3. GET https://www.wikidata.org/wiki/Special:EntityData/{QID}.json → propriété P18
// 4. Construire URL Wikimedia Commons
// 5. Cacher dans localStorage avec clé "wikidata_{playerName}"
```

---

## 9. Nouveaux fichiers

```
/app
  /club/[id]/page.tsx
  /player/[id]/page.tsx
  /pronos/page.tsx (remplace existant)
  /api
    /clubs/[id]/route.ts
    /clubs/[id]/matches/route.ts
    /players/[id]/route.ts
    /competitions/[code]/standings/route.ts

/components
  ClubHero.tsx          ← bannière logo + nom
  PlayerCard.tsx        ← card joueur avec photo Wikidata
  PlayerPhoto.tsx       ← photo + fallback silhouette
  BracketView.tsx       ← arbre tournoi pour coupes
  StandingsTable.tsx    ← classement pour ligues
  CompetitionTabs.tsx   ← onglets Matchs / Bracket ou Classement

/services
  wikidataMedia.ts      ← recherche images Wikidata avec cache localStorage
```

---

## 10. Règles UX

- Navigation : logo club dans MatchCard → cliquable vers `/club/[id]`
- Photos joueurs : chargées lazy (skeleton pendant fetch Wikidata)
- Bracket : scroll horizontal sur mobile
- Standings : ligne surlignée teal si équipe favorite
- Page Pronos : groupés par compétition, badge points coloré (or/argent/gris)
