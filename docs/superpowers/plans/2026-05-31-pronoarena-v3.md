# PronoArena V3 — Club Pages, Player Pages, Bracket, Standings

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter pages club/joueur avec photos Wikidata, bracket tournoi pour coupes, classement pour ligues, et page pronos enrichie avec résultats réels.

**Architecture:** Nouvelles routes dynamiques `/club/[id]` et `/player/[id]` alimentées par football-data.org v4. Photos joueurs via Wikipedia pageimage API (cachées localStorage). Onglets sur la page compétition pour basculer entre Matchs / Bracket (coupes) ou Classement (ligues).

**Tech Stack:** Next.js 16 App Router · TypeScript · Tailwind v4 · lucide-react · Wikipedia API (no key) · localStorage cache

---

## File Map

| Fichier | Action | Rôle |
|---------|--------|------|
| `domain/club.ts` | Créer | Types ClubInfo, SquadPlayer |
| `domain/player.ts` | Créer | Type PlayerInfo |
| `domain/standing.ts` | Créer | Types StandingRow, Standing |
| `domain/prediction.ts` | Modifier | Ajouter competitionCode (optionnel) |
| `services/wikidataMedia.ts` | Créer | getPlayerPhoto() via Wikipedia + cache localStorage |
| `services/wikidataMedia.test.ts` | Créer | Tests Vitest |
| `app/api/clubs/[id]/route.ts` | Créer | Proxy → football-data.org/v4/teams/{id} |
| `app/api/clubs/[id]/matches/route.ts` | Créer | Proxy → matchs d'un club |
| `app/api/players/[id]/route.ts` | Créer | Proxy → football-data.org/v4/persons/{id} |
| `app/api/competitions/[code]/standings/route.ts` | Créer | Proxy → standings (cache 1h) |
| `components/PlayerPhoto.tsx` | Créer | Photo Wikipedia + fallback silhouette |
| `components/PlayerCard.tsx` | Créer | Card joueur cliquable |
| `components/ClubHero.tsx` | Créer | Bannière logo + nom + infos |
| `components/StandingsTable.tsx` | Créer | Tableau classement ligue |
| `components/BracketView.tsx` | Créer | Arbre tournoi pour coupes |
| `components/CompetitionTabs.tsx` | Créer | Onglets Matchs / Bracket-ou-Classement |
| `app/club/[id]/page.tsx` | Créer | Page club |
| `app/player/[id]/page.tsx` | Créer | Page joueur |
| `app/competition/[code]/page.tsx` | Modifier | Ajouter CompetitionTabs |
| `app/pronos/page.tsx` | Remplacer | Charger résultats réels + points |
| `components/MatchCard.tsx` | Modifier | Logo équipe → lien vers /club/[id] |
| `components/PredictionForm.tsx` | Modifier | Sauvegarder competitionCode |

---

## Task 1 — Domain types

**Files:**
- Créer : `domain/club.ts`
- Créer : `domain/player.ts`
- Créer : `domain/standing.ts`
- Modifier : `domain/prediction.ts`

- [ ] **Step 1 : Créer `domain/club.ts`**

```typescript
export interface SquadPlayer {
  id: number
  name: string
  position: string
  dateOfBirth?: string
  nationality?: string
  shirtNumber?: number | null
}

export interface ClubInfo {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
  address?: string
  website?: string
  founded?: number
  clubColors?: string
  venue?: string
  area: { name: string; flag?: string }
  squad: SquadPlayer[]
}
```

- [ ] **Step 2 : Créer `domain/player.ts`**

```typescript
export interface PlayerInfo {
  id: number
  name: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  nationality?: string
  position?: string
  shirtNumber?: number | null
  currentTeam?: {
    id: number
    name: string
    crest: string
    contractUntilDate?: string
  }
}
```

- [ ] **Step 3 : Créer `domain/standing.ts`**

```typescript
export interface StandingRow {
  position: number
  team: { id: number; name: string; crest: string }
  playedGames: number
  won: number
  draw: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string | null
}

export interface Standing {
  stage: string
  type: string
  group: string | null
  table: StandingRow[]
}
```

- [ ] **Step 4 : Modifier `domain/prediction.ts` — ajouter competitionCode optionnel**

```typescript
export interface Prediction {
  matchId: number
  homeTeam: string
  awayTeam: string
  predictedHomeScore: number
  predictedAwayScore: number
  createdAt: string
  competitionCode?: string
}
```

- [ ] **Step 5 : Commit**

```bash
git add domain/
git commit -m "feat: add Club, Player, Standing domain types"
```

---

## Task 2 — Wikidata service (TDD)

**Files:**
- Créer : `services/wikidataMedia.ts`
- Créer : `services/wikidataMedia.test.ts`

- [ ] **Step 1 : Écrire les tests d'abord (`services/wikidataMedia.test.ts`)**

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock fetch before importing the service
const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
  }
})()
vi.stubGlobal("localStorage", localStorageMock)
vi.stubGlobal("window", { localStorage: localStorageMock })

import { getPlayerPhoto } from "./wikidataMedia"

describe("getPlayerPhoto", () => {
  beforeEach(() => {
    mockFetch.mockReset()
    localStorageMock.clear()
  })

  it("returns image URL when Wikipedia has thumbnail", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        query: {
          pages: {
            "123": { thumbnail: { source: "https://upload.wikimedia.org/lionel.jpg" } },
          },
        },
      }),
    })

    const result = await getPlayerPhoto("Lionel Messi")
    expect(result).toBe("https://upload.wikimedia.org/lionel.jpg")
  })

  it("returns null when page has no thumbnail", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ query: { pages: { "-1": {} } } }),
    })

    const result = await getPlayerPhoto("Unknown Player XYZ")
    expect(result).toBeNull()
  })

  it("returns null on fetch error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network"))
    const result = await getPlayerPhoto("Test Player")
    expect(result).toBeNull()
  })

  it("returns cached value on second call (no extra fetch)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        query: { pages: { "1": { thumbnail: { source: "https://img.test/photo.jpg" } } } },
      }),
    })

    await getPlayerPhoto("Cached Player")
    mockFetch.mockClear()
    const result = await getPlayerPhoto("Cached Player")

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result).toBe("https://img.test/photo.jpg")
  })
})
```

- [ ] **Step 2 : Lancer les tests — vérifier qu'ils échouent**

```powershell
cd C:\Users\GodFaz75\Desktop\appFootix
npm test -- --run
```

Résultat attendu : FAIL sur `wikidataMedia`

- [ ] **Step 3 : Implémenter `services/wikidataMedia.ts`**

```typescript
const CACHE_PREFIX = "pronoArena_wiki_"

function cacheKey(name: string): string {
  return `${CACHE_PREFIX}${name.toLowerCase().replace(/\s+/g, "_")}`
}

export async function getPlayerPhoto(playerName: string): Promise<string | null> {
  const key = cacheKey(playerName)

  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(key)
    if (cached !== null) return cached || null
  }

  try {
    const url =
      `https://en.wikipedia.org/w/api.php` +
      `?action=query&prop=pageimages&titles=${encodeURIComponent(playerName)}` +
      `&format=json&pithumbsize=250&origin=*`

    const res = await fetch(url)
    if (!res.ok) return null

    const data = (await res.json()) as {
      query?: { pages?: Record<string, { thumbnail?: { source: string } }> }
    }

    const pages = Object.values(data.query?.pages ?? {})
    const imageUrl = pages[0]?.thumbnail?.source ?? ""

    if (typeof window !== "undefined") {
      localStorage.setItem(key, imageUrl)
    }

    return imageUrl || null
  } catch {
    return null
  }
}
```

- [ ] **Step 4 : Lancer les tests — vérifier qu'ils passent**

```powershell
npm test -- --run
```

Résultat attendu : tous les tests PASS

- [ ] **Step 5 : Commit**

```bash
git add services/wikidataMedia.ts services/wikidataMedia.test.ts
git commit -m "feat: add Wikidata player photo service with localStorage cache"
```

---

## Task 3 — API Routes : clubs, players, standings

**Files:**
- Créer : `app/api/clubs/[id]/route.ts`
- Créer : `app/api/clubs/[id]/matches/route.ts`
- Créer : `app/api/players/[id]/route.ts`
- Créer : `app/api/competitions/[code]/standings/route.ts`

- [ ] **Step 1 : Créer `app/api/clubs/[id]/route.ts`**

```typescript
export const revalidate = 3600

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const token = process.env.FOOTBALL_DATA_TOKEN
  if (!token) return Response.json({ error: "No token" }, { status: 500 })

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/teams/${id}`,
      { headers: { "X-Auth-Token": token } }
    )
    if (!res.ok) return Response.json({ error: `API ${res.status}` }, { status: res.status })
    return Response.json(await res.json())
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 })
  }
}
```

- [ ] **Step 2 : Créer `app/api/clubs/[id]/matches/route.ts`**

```typescript
export const revalidate = 300

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const token = process.env.FOOTBALL_DATA_TOKEN
  if (!token) return Response.json({ matches: [] })

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/teams/${id}/matches?status=SCHEDULED,IN_PLAY,FINISHED&limit=10`,
      { headers: { "X-Auth-Token": token } }
    )
    if (!res.ok) return Response.json({ matches: [] })
    return Response.json(await res.json())
  } catch {
    return Response.json({ matches: [] })
  }
}
```

- [ ] **Step 3 : Créer `app/api/players/[id]/route.ts`**

```typescript
export const revalidate = 86400

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const token = process.env.FOOTBALL_DATA_TOKEN
  if (!token) return Response.json({ error: "No token" }, { status: 500 })

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/persons/${id}`,
      { headers: { "X-Auth-Token": token } }
    )
    if (!res.ok) return Response.json({ error: `API ${res.status}` }, { status: res.status })
    return Response.json(await res.json())
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 })
  }
}
```

- [ ] **Step 4 : Créer `app/api/competitions/[code]/standings/route.ts`**

```typescript
export const revalidate = 3600

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params
  const token = process.env.FOOTBALL_DATA_TOKEN
  if (!token) return Response.json({ standings: [] })

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${code}/standings`,
      { headers: { "X-Auth-Token": token } }
    )
    if (!res.ok) return Response.json({ standings: [] })
    return Response.json(await res.json())
  } catch {
    return Response.json({ standings: [] })
  }
}
```

- [ ] **Step 5 : Commit**

```bash
git add app/api/clubs/ app/api/players/ app/api/competitions/
git commit -m "feat: add club, player, standings API routes"
```

---

## Task 4 — PlayerPhoto + PlayerCard

**Files:**
- Créer : `components/PlayerPhoto.tsx`
- Créer : `components/PlayerCard.tsx`

- [ ] **Step 1 : Créer `components/PlayerPhoto.tsx`**

```typescript
"use client"

import { useState, useEffect } from "react"
import { User } from "lucide-react"
import { getPlayerPhoto } from "@/services/wikidataMedia"

interface PlayerPhotoProps {
  playerName: string
  size?: number
  className?: string
}

export default function PlayerPhoto({
  playerName,
  size = 48,
  className = "",
}: PlayerPhotoProps) {
  const [src, setSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPlayerPhoto(playerName).then((url) => {
      setSrc(url)
      setLoading(false)
    })
  }, [playerName])

  const style = { width: size, height: size }

  if (loading) {
    return (
      <div
        style={style}
        className={`rounded-full bg-slate-700 animate-pulse shrink-0 ${className}`}
      />
    )
  }

  if (!src) {
    return (
      <div
        style={style}
        className={`rounded-full bg-slate-700 flex items-center justify-center shrink-0 ${className}`}
      >
        <User size={size * 0.45} className="text-slate-500" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={playerName}
      style={style}
      className={`rounded-full object-cover shrink-0 ${className}`}
    />
  )
}
```

- [ ] **Step 2 : Créer `components/PlayerCard.tsx`**

```typescript
import Link from "next/link"
import type { SquadPlayer } from "@/domain/club"
import PlayerPhoto from "./PlayerPhoto"

interface PlayerCardProps {
  player: SquadPlayer
}

const POSITION_LABEL: Record<string, string> = {
  Goalkeeper: "Gardien",
  Defence: "Défenseur",
  Midfield: "Milieu",
  Offence: "Attaquant",
  Coach: "Entraîneur",
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link
      href={`/player/${player.id}`}
      className="flex items-center gap-3 bg-slate-900 rounded-xl p-3 hover:bg-slate-700 transition-colors"
    >
      <PlayerPhoto playerName={player.name} size={40} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{player.name}</p>
        <p className="text-xs text-slate-400">
          {POSITION_LABEL[player.position] ?? player.position}
          {player.nationality ? ` · ${player.nationality}` : ""}
        </p>
      </div>
      {player.shirtNumber != null && (
        <span className="text-xs font-bold text-teal-400 bg-teal-900/30 rounded-lg w-7 h-7 flex items-center justify-center shrink-0">
          {player.shirtNumber}
        </span>
      )}
    </Link>
  )
}
```

- [ ] **Step 3 : Commit**

```bash
git add components/PlayerPhoto.tsx components/PlayerCard.tsx
git commit -m "feat: PlayerPhoto (Wikidata) and PlayerCard components"
```

---

## Task 5 — ClubHero + Club Page

**Files:**
- Créer : `components/ClubHero.tsx`
- Créer : `app/club/[id]/page.tsx`

- [ ] **Step 1 : Créer `components/ClubHero.tsx`**

```typescript
import Image from "next/image"
import type { ClubInfo } from "@/domain/club"

interface ClubHeroProps {
  club: ClubInfo
}

const POSITION_GROUPS = ["Goalkeeper", "Defence", "Midfield", "Offence"]
const POSITION_LABEL: Record<string, string> = {
  Goalkeeper: "Gardiens",
  Defence: "Défenseurs",
  Midfield: "Milieux",
  Offence: "Attaquants",
}

export default function ClubHero({ club }: ClubHeroProps) {
  return (
    <div className="bg-slate-800 border-b border-slate-700">
      {/* Bannière logo */}
      <div className="flex flex-col items-center justify-center py-8 gap-4 bg-gradient-to-b from-slate-700 to-slate-800">
        {club.crest ? (
          <div className="relative w-24 h-24">
            <Image
              src={club.crest}
              alt={club.name}
              fill
              className="object-contain drop-shadow-xl"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-slate-600 flex items-center justify-center text-3xl font-bold text-white">
            {club.tla}
          </div>
        )}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">{club.name}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {club.area.name}
            {club.venue ? ` · ${club.venue}` : ""}
            {club.founded ? ` · Fondé en ${club.founded}` : ""}
          </p>
          {club.clubColors && (
            <p className="text-xs text-slate-500 mt-0.5">{club.clubColors}</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2 : Créer `app/club/[id]/page.tsx`**

```typescript
"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { ClubInfo, SquadPlayer } from "@/domain/club"
import ClubHero from "@/components/ClubHero"
import PlayerCard from "@/components/PlayerCard"
import LoadingState from "@/components/LoadingState"
import ErrorState from "@/components/ErrorState"

const POSITION_GROUPS: Array<{ key: string; label: string }> = [
  { key: "Goalkeeper", label: "Gardiens" },
  { key: "Defence", label: "Défenseurs" },
  { key: "Midfield", label: "Milieux" },
  { key: "Offence", label: "Attaquants" },
]

export default function ClubPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [club, setClub] = useState<ClubInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/clubs/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<ClubInfo>
      })
      .then((data) => {
        setClub(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Impossible de charger les informations du club.")
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <LoadingState />
        </div>
      </div>
    )
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <ErrorState
            message={error ?? "Club introuvable"}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Back nav */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm text-slate-300 truncate font-medium">{club.name}</span>
        </div>
      </div>

      <ClubHero club={club} />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {POSITION_GROUPS.map(({ key, label }) => {
          const players = club.squad.filter(
            (p: SquadPlayer) => p.position === key
          )
          if (players.length === 0) return null
          return (
            <section key={key}>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                {label} ({players.length})
              </h2>
              <div className="space-y-2">
                {players.map((player: SquadPlayer) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            </section>
          )
        })}

        {/* Joueurs sans position groupée */}
        {club.squad.filter(
          (p: SquadPlayer) =>
            !POSITION_GROUPS.map((g) => g.key).includes(p.position)
        ).length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Staff
            </h2>
            <div className="space-y-2">
              {club.squad
                .filter(
                  (p: SquadPlayer) =>
                    !POSITION_GROUPS.map((g) => g.key).includes(p.position)
                )
                .map((player: SquadPlayer) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 3 : Commit**

```bash
git add components/ClubHero.tsx app/club/
git commit -m "feat: club page with squad grouped by position"
```

---

## Task 6 — Player Page

**Files:**
- Créer : `app/player/[id]/page.tsx`

- [ ] **Step 1 : Créer `app/player/[id]/page.tsx`**

```typescript
"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import type { PlayerInfo } from "@/domain/player"
import PlayerPhoto from "@/components/PlayerPhoto"
import LoadingState from "@/components/LoadingState"
import ErrorState from "@/components/ErrorState"
import Image from "next/image"

function age(dateOfBirth: string): number {
  return Math.floor(
    (Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000)
  )
}

const POSITION_LABEL: Record<string, string> = {
  Goalkeeper: "Gardien",
  Defence: "Défenseur",
  Midfield: "Milieu",
  Offence: "Attaquant",
}

export default function PlayerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [player, setPlayer] = useState<PlayerInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/players/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<PlayerInfo>
      })
      .then((data) => {
        setPlayer(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Impossible de charger les informations du joueur.")
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <LoadingState />
        </div>
      </div>
    )
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-slate-900">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <ErrorState
            message={error ?? "Joueur introuvable"}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  const infos: Array<{ label: string; value: string }> = [
    ...(player.position
      ? [{ label: "Poste", value: POSITION_LABEL[player.position] ?? player.position }]
      : []),
    ...(player.nationality
      ? [{ label: "Nationalité", value: player.nationality }]
      : []),
    ...(player.dateOfBirth
      ? [
          {
            label: "Âge",
            value: `${age(player.dateOfBirth)} ans (${new Date(player.dateOfBirth).toLocaleDateString("fr-FR")})`,
          },
        ]
      : []),
    ...(player.shirtNumber != null
      ? [{ label: "Numéro", value: `#${player.shirtNumber}` }]
      : []),
    ...(player.currentTeam?.contractUntilDate
      ? [
          {
            label: "Contrat jusqu'au",
            value: new Date(player.currentTeam.contractUntilDate).toLocaleDateString("fr-FR"),
          },
        ]
      : []),
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Back nav */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm text-slate-300 truncate font-medium">{player.name}</span>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-700 to-slate-800 py-10">
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-6">
          <PlayerPhoto playerName={player.name} size={96} />
          <div>
            <h1 className="text-2xl font-bold text-white">{player.name}</h1>
            {player.currentTeam && (
              <Link
                href={`/club/${player.currentTeam.id}`}
                className="flex items-center gap-2 mt-2 hover:opacity-80 transition-opacity"
              >
                {player.currentTeam.crest && (
                  <div className="relative w-5 h-5">
                    <Image
                      src={player.currentTeam.crest}
                      alt={player.currentTeam.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
                <span className="text-sm text-teal-400 font-medium">
                  {player.currentTeam.name}
                </span>
                <ExternalLink size={12} className="text-slate-500" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Infos */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 divide-y divide-slate-700">
          {infos.map((info) => (
            <div key={info.label} className="flex justify-between px-4 py-3">
              <span className="text-sm text-slate-400">{info.label}</span>
              <span className="text-sm text-white font-medium">{info.value}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-500 text-center mt-6">
          Stats détaillées disponibles avec un abonnement API premium.
        </p>
      </main>
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add app/player/
git commit -m "feat: player detail page with Wikidata photo"
```

---

## Task 7 — StandingsTable

**Files:**
- Créer : `components/StandingsTable.tsx`

- [ ] **Step 1 : Créer `components/StandingsTable.tsx`**

```typescript
"use client"

import Link from "next/link"
import Image from "next/image"
import type { StandingRow } from "@/domain/standing"
import { getAllFavorites } from "@/services/favorites"
import { useEffect, useState } from "react"

interface StandingsTableProps {
  rows: StandingRow[]
  group?: string | null
}

const FORM_COLOR: Record<string, string> = {
  W: "bg-green-500",
  D: "bg-slate-500",
  L: "bg-red-500",
}

export default function StandingsTable({ rows, group }: StandingsTableProps) {
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    setFavoriteIds(new Set(getAllFavorites().map((f) => f.teamId)))
  }, [])

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {group && (
        <div className="px-4 py-2 bg-slate-700 text-xs font-bold text-slate-300 uppercase tracking-wide">
          {group}
        </div>
      )}
      {/* Header */}
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 px-3 py-2 text-xs text-slate-500 font-medium border-b border-slate-700">
        <span className="w-5 text-center">#</span>
        <span>Équipe</span>
        <span className="w-6 text-center">J</span>
        <span className="w-8 text-center">Pts</span>
        <span className="w-10 text-center hidden sm:block">+/-</span>
        <span className="hidden sm:block">Forme</span>
      </div>

      {/* Rows */}
      {rows.map((row) => {
        const isFav = favoriteIds.has(row.team.id)
        const formArray = row.form ? row.form.split(",").slice(0, 5) : []

        return (
          <Link
            key={row.team.id}
            href={`/club/${row.team.id}`}
            className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 items-center px-3 py-2.5 border-b border-slate-700/50 last:border-0 hover:bg-slate-700 transition-colors ${
              isFav ? "bg-teal-900/20" : ""
            }`}
          >
            <span className={`w-5 text-center text-xs font-bold ${row.position <= 4 ? "text-teal-400" : "text-slate-400"}`}>
              {row.position}
            </span>

            <div className="flex items-center gap-2 min-w-0">
              {row.team.crest && (
                <div className="relative w-5 h-5 shrink-0">
                  <Image src={row.team.crest} alt={row.team.name} fill className="object-contain" unoptimized />
                </div>
              )}
              <span className={`text-sm truncate ${isFav ? "text-teal-300 font-semibold" : "text-white"}`}>
                {row.team.name}
              </span>
              {isFav && <span className="text-yellow-400 text-xs shrink-0">★</span>}
            </div>

            <span className="w-6 text-center text-xs text-slate-400">{row.playedGames}</span>
            <span className="w-8 text-center text-sm font-bold text-white">{row.points}</span>
            <span className="w-10 text-center text-xs text-slate-400 hidden sm:block">
              {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
            </span>

            <div className="hidden sm:flex gap-0.5">
              {formArray.map((f, i) => (
                <span
                  key={i}
                  className={`w-3 h-3 rounded-full text-[8px] flex items-center justify-center text-white font-bold ${
                    FORM_COLOR[f] ?? "bg-slate-600"
                  }`}
                  title={f === "W" ? "Victoire" : f === "D" ? "Nul" : "Défaite"}
                />
              ))}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add components/StandingsTable.tsx
git commit -m "feat: StandingsTable component with favorites highlight"
```

---

## Task 8 — BracketView

**Files:**
- Créer : `components/BracketView.tsx`

- [ ] **Step 1 : Créer `components/BracketView.tsx`**

```typescript
import type { Match } from "@/domain/match"
import Image from "next/image"

interface BracketViewProps {
  matches: Match[]
}

const STAGE_ORDER = [
  "GROUP_STAGE",
  "LEAGUE_PHASE",
  "PLAYOFF_ROUND_ONE",
  "PLAYOFF_ROUND_TWO",
  "ROUND_OF_128",
  "ROUND_OF_64",
  "ROUND_OF_32",
  "ROUND_OF_16",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL",
]

const STAGE_LABEL: Record<string, string> = {
  GROUP_STAGE: "Phase de groupes",
  LEAGUE_PHASE: "Phase de ligue",
  PLAYOFF_ROUND_ONE: "Barrages (1er tour)",
  PLAYOFF_ROUND_TWO: "Barrages (2e tour)",
  ROUND_OF_128: "Tour préliminaire",
  ROUND_OF_64: "64e de finale",
  ROUND_OF_32: "32e de finale",
  ROUND_OF_16: "16e de finale",
  LAST_16: "Huitièmes de finale",
  QUARTER_FINALS: "Quarts de finale",
  SEMI_FINALS: "Demi-finales",
  THIRD_PLACE: "Match pour la 3e place",
  FINAL: "Finale",
}

function MatchNode({ match }: { match: Match }) {
  const finished = match.status === "FINISHED"
  const live = match.status === "IN_PLAY" || match.status === "PAUSED"

  return (
    <div className={`bg-slate-900 border rounded-xl p-3 w-full max-w-xs ${
      match.status === "FINAL" ? "border-yellow-500" : finished ? "border-slate-600" : "border-slate-700"
    }`}>
      {[match.homeTeam, match.awayTeam].map((team, idx) => {
        const score = idx === 0 ? match.score.fullTime.home : match.score.fullTime.away
        return (
          <div key={team.id} className={`flex items-center justify-between gap-2 ${idx === 0 ? "mb-1.5" : ""}`}>
            <div className="flex items-center gap-2 min-w-0">
              {team.crest && (
                <div className="relative w-5 h-5 shrink-0">
                  <Image src={team.crest} alt={team.name} fill className="object-contain" unoptimized />
                </div>
              )}
              <span className="text-xs text-white truncate">{team.name}</span>
            </div>
            {(finished || live) && score !== null && (
              <span className={`text-sm font-bold shrink-0 ${live ? "text-green-400" : "text-white"}`}>
                {score}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function BracketView({ matches }: BracketViewProps) {
  const grouped = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const key = m.stage
    acc[key] = [...(acc[key] ?? []), m]
    return acc
  }, {})

  const stages = Object.keys(grouped).sort(
    (a, b) => STAGE_ORDER.indexOf(a) - STAGE_ORDER.indexOf(b)
  )

  if (stages.length === 0) {
    return (
      <p className="text-slate-400 text-sm text-center py-8">
        Le bracket n&apos;est pas encore disponible.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {stages.map((stage) => (
        <section key={stage}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {STAGE_LABEL[stage] ?? stage.replace(/_/g, " ")}
          </h3>

          {/* Groupes (phase de groupes) */}
          {(stage === "GROUP_STAGE" || stage === "LEAGUE_PHASE") ? (
            (() => {
              const byGroup = grouped[stage].reduce<Record<string, Match[]>>((acc, m) => {
                const g = m.group ?? "—"
                acc[g] = [...(acc[g] ?? []), m]
                return acc
              }, {})
              return (
                <div className="space-y-4">
                  {Object.entries(byGroup).map(([group, gMatches]) => (
                    <div key={group}>
                      {group !== "—" && (
                        <p className="text-xs text-slate-500 mb-2">{group}</p>
                      )}
                      <div className="space-y-2">
                        {gMatches.map((m) => <MatchNode key={m.id} match={m} />)}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()
          ) : (
            /* Phase éliminatoire */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {grouped[stage].map((m) => <MatchNode key={m.id} match={m} />)}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add components/BracketView.tsx
git commit -m "feat: BracketView component for cup competitions"
```

---

## Task 9 — CompetitionTabs + mise à jour competition page

**Files:**
- Créer : `components/CompetitionTabs.tsx`
- Modifier : `app/competition/[code]/page.tsx`

- [ ] **Step 1 : Créer `components/CompetitionTabs.tsx`**

```typescript
"use client"

interface Tab {
  key: string
  label: string
}

interface CompetitionTabsProps {
  tabs: Tab[]
  active: string
  onChange: (key: string) => void
}

export default function CompetitionTabs({ tabs, active, onChange }: CompetitionTabsProps) {
  return (
    <div className="flex gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            active === tab.key
              ? "bg-teal-600 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2 : Ajouter les imports manquants dans `app/competition/[code]/page.tsx`**

Ajouter en haut du fichier après les imports existants :

```typescript
import CompetitionTabs from "@/components/CompetitionTabs"
import BracketView from "@/components/BracketView"
import StandingsTable from "@/components/StandingsTable"
import type { Standing } from "@/domain/standing"
```

- [ ] **Step 3 : Ajouter l'état tabs + standings dans `app/competition/[code]/page.tsx`**

Après la ligne `const { addTeams } = useTeams()`, ajouter :

```typescript
  const [activeTab, setActiveTab] = useState<"matches" | "bracket" | "standings">("matches")
  const [standings, setStandings] = useState<Standing[]>([])
  const isCup = competition?.type === "CUP"

  const tabs = [
    { key: "matches", label: "Matchs" },
    ...(isCup ? [{ key: "bracket", label: "Bracket" }] : [{ key: "standings", label: "Classement" }]),
  ]
```

- [ ] **Step 4 : Charger standings dans `load()` pour les ligues**

Dans la fonction `load`, après le bloc `fetchCompetitionTeams`, ajouter :

```typescript
    if (!isCup) {
      fetch(`/api/competitions/${code}/standings`)
        .then((r) => r.json())
        .then((data: { standings?: Standing[] }) => {
          setStandings(data.standings ?? [])
        })
        .catch(() => {})
    }
```

- [ ] **Step 5 : Ajouter les tabs et vues dans le JSX de `app/competition/[code]/page.tsx`**

Remplacer le bloc `<StatsBar .../>` et ce qui suit par :

```typescript
        <StatsBar
          matchCount={matches.length}
          predictionCount={predictions.length}
          totalPoints={predictions.reduce((sum, p) => {
            const m = matches.find((x) => x.id === p.matchId)
            if (!m || m.status !== "FINISHED") return sum
            return sum + calculatePredictionPoints(p, m)
          }, 0)}
        />

        <CompetitionTabs
          tabs={tabs}
          active={activeTab}
          onChange={(k) => setActiveTab(k as typeof activeTab)}
        />

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}

        {!loading && !error && activeTab === "matches" && (
          <>
            {sortedMatches.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <div className="text-4xl mb-3">🔍</div>
                <p>Aucun match disponible pour cette compétition.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onPredictionSaved={handlePredictionSaved}
                    isFavoriteMatch={
                      favoriteTeamIds.has(match.homeTeam.id) ||
                      favoriteTeamIds.has(match.awayTeam.id)
                    }
                    competitionCode={code}
                    competitionName={competition?.name ?? code}
                  />
                ))}
              </div>
            )}
            {predictions.length > 0 && (
              <LocalLeaderboard predictions={predictions} matches={matches} />
            )}
          </>
        )}

        {!loading && !error && activeTab === "bracket" && (
          <BracketView matches={matches} />
        )}

        {!loading && !error && activeTab === "standings" && (
          <div className="space-y-4">
            {standings.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Classement non disponible.</p>
            ) : (
              standings.map((s, i) => (
                <StandingsTable
                  key={i}
                  rows={s.table}
                  group={s.group}
                />
              ))
            )}
          </div>
        )}
```

- [ ] **Step 6 : Commit**

```bash
git add components/CompetitionTabs.tsx app/competition/
git commit -m "feat: competition page tabs with bracket and standings views"
```

---

## Task 10 — MatchCard : logo cliquable vers /club/[id]

**Files:**
- Modifier : `components/MatchCard.tsx`

- [ ] **Step 1 : Rendre les logos cliquables dans `components/MatchCard.tsx`**

Dans `MatchCard.tsx`, modifier la fonction `TeamCrest` pour accepter `teamId` et l'envelopper d'un `Link` :

```typescript
function TeamCrest({ src, name, teamId }: { src: string; name: string; teamId: number }) {
  const img = src ? (
    <div className="relative w-10 h-10">
      <Image src={src} alt={name} fill className="object-contain" unoptimized />
    </div>
  ) : (
    <div className="w-10 h-10 rounded-full bg-slate-700" />
  )

  return (
    <Link href={`/club/${teamId}`} onClick={(e) => e.stopPropagation()}>
      {img}
    </Link>
  )
}
```

Puis mettre à jour les deux appels dans le JSX :

```typescript
<TeamCrest src={match.homeTeam.crest} name={match.homeTeam.name} teamId={match.homeTeam.id} />
// ...
<TeamCrest src={match.awayTeam.crest} name={match.awayTeam.name} teamId={match.awayTeam.id} />
```

Ajouter l'import `Link` en haut du fichier :
```typescript
import Link from "next/link"
```

- [ ] **Step 2 : Commit**

```bash
git add components/MatchCard.tsx
git commit -m "feat: club logo in MatchCard links to /club/[id]"
```

---

## Task 11 — Page Pronos enrichie

**Files:**
- Remplacer : `app/pronos/page.tsx`
- Modifier : `components/PredictionForm.tsx` (sauvegarder competitionCode)

- [ ] **Step 1 : Modifier `components/PredictionForm.tsx` pour sauvegarder competitionCode**

Ajouter le prop dans l'interface et la sauvegarde :

```typescript
interface PredictionFormProps {
  match: Match
  onSaved: () => void
  competitionCode?: string
}

export default function PredictionForm({ match, onSaved, competitionCode }: PredictionFormProps) {
```

Dans `handleSubmit`, ajouter `competitionCode` à l'objet `prediction` :

```typescript
    const prediction: Prediction = {
      matchId: match.id,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      predictedHomeScore: ph,
      predictedAwayScore: pa,
      createdAt: new Date().toISOString(),
      competitionCode,
    }
```

- [ ] **Step 2 : Mettre à jour les appels à PredictionForm dans MatchCard**

Dans `components/MatchCard.tsx`, passer `competitionCode` à `PredictionForm` :

```typescript
<PredictionForm match={match} onSaved={onPredictionSaved} competitionCode={competitionCode} />
```

- [ ] **Step 3 : Remplacer `app/pronos/page.tsx`**

```typescript
"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowRight, Trophy, CheckCircle, Clock } from "lucide-react"
import type { Prediction } from "@/domain/prediction"
import type { Match } from "@/domain/match"
import { getAllPredictions } from "@/services/localPredictions"
import { fetchCompetitionMatches } from "@/services/footballData"
import { calculatePredictionPoints } from "@/domain/scoring"
import Header from "@/components/Header"
import LoadingState from "@/components/LoadingState"

interface EnrichedPrediction extends Prediction {
  match?: Match
  points?: number
}

export default function PronosPage() {
  const [enriched, setEnriched] = useState<EnrichedPrediction[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    const predictions = getAllPredictions()
    if (predictions.length === 0) {
      setEnriched([])
      setLoading(false)
      return
    }

    // Grouper par compétition pour minimiser les appels API
    const codes = [...new Set(predictions.map((p) => p.competitionCode).filter(Boolean))] as string[]

    const matchesByCode: Record<string, Match[]> = {}
    await Promise.allSettled(
      codes.map(async (code) => {
        try {
          const data = await fetchCompetitionMatches(code)
          matchesByCode[code] = data.matches
        } catch {
          matchesByCode[code] = []
        }
      })
    )

    const result: EnrichedPrediction[] = predictions.map((p) => {
      const compMatches = p.competitionCode ? matchesByCode[p.competitionCode] ?? [] : []
      const match = compMatches.find((m) => m.id === p.matchId)
      const points =
        match?.status === "FINISHED"
          ? calculatePredictionPoints(p, match)
          : undefined
      return { ...p, match, points }
    })

    // Trier : terminés en premier, puis par date
    result.sort((a, b) => {
      if (a.match?.status === "FINISHED" && b.match?.status !== "FINISHED") return -1
      if (a.match?.status !== "FINISHED" && b.match?.status === "FINISHED") return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    setEnriched(result)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const totalPoints = enriched.reduce((sum, p) => sum + (p.points ?? 0), 0)
  const finished = enriched.filter((p) => p.match?.status === "FINISHED")

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header title="Mes pronostics" backHref="/" />
        <div className="max-w-2xl mx-auto px-4 py-6"><LoadingState /></div>
      </div>
    )
  }

  if (enriched.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header title="Mes pronostics" backHref="/" />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center py-16 text-slate-400">
            <Trophy size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold mb-2">Aucun pronostic pour l&apos;instant</p>
            <p className="text-sm mb-6">
              Visite une compétition et entre ton score prédit pour chaque match.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Voir les compétitions
              <ArrowRight size={16} />
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header title="Mes pronostics" backHref="/" />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Résumé */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
            <div className="text-xl font-bold text-teal-400">{enriched.length}</div>
            <div className="text-xs text-slate-400 mt-1">Pronostics</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
            <div className="text-xl font-bold text-blue-400">{finished.length}</div>
            <div className="text-xs text-slate-400 mt-1">Terminés</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700">
            <div className="text-xl font-bold text-yellow-400">{totalPoints}</div>
            <div className="text-xs text-slate-400 mt-1">Points</div>
          </div>
        </div>

        {/* Liste */}
        <div className="space-y-3">
          {enriched.map((p) => {
            const isFinished = p.match?.status === "FINISHED"
            const actualHome = p.match?.score.fullTime.home
            const actualAway = p.match?.score.fullTime.away

            return (
              <div
                key={p.matchId}
                className={`bg-slate-800 rounded-xl border p-4 ${
                  isFinished ? "border-slate-600" : "border-slate-700"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                  <span>
                    {new Date(p.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isFinished ? (
                    <span className="flex items-center gap-1 text-blue-400">
                      <CheckCircle size={12} />
                      Terminé
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      À venir
                    </span>
                  )}
                </div>

                {/* Équipes + scores */}
                <div className="flex items-center gap-3">
                  <span className="flex-1 text-sm font-semibold text-right text-slate-100 truncate">
                    {p.homeTeam}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Score prédit */}
                    <div className="flex items-center gap-1">
                      <span className="bg-teal-900/50 border border-teal-700 text-teal-300 font-bold text-base w-8 h-8 flex items-center justify-center rounded-lg">
                        {p.predictedHomeScore}
                      </span>
                      <span className="text-slate-400 font-bold text-xs">–</span>
                      <span className="bg-teal-900/50 border border-teal-700 text-teal-300 font-bold text-base w-8 h-8 flex items-center justify-center rounded-lg">
                        {p.predictedAwayScore}
                      </span>
                    </div>

                    {/* Score réel */}
                    {isFinished && actualHome !== null && actualAway !== null && (
                      <>
                        <span className="text-slate-500 text-xs mx-1">vs</span>
                        <div className="flex items-center gap-1">
                          <span className="bg-slate-700 border border-slate-600 text-slate-200 font-bold text-base w-8 h-8 flex items-center justify-center rounded-lg">
                            {actualHome}
                          </span>
                          <span className="text-slate-400 font-bold text-xs">–</span>
                          <span className="bg-slate-700 border border-slate-600 text-slate-200 font-bold text-base w-8 h-8 flex items-center justify-center rounded-lg">
                            {actualAway}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <span className="flex-1 text-sm font-semibold text-left text-slate-100 truncate">
                    {p.awayTeam}
                  </span>
                </div>

                {/* Points */}
                {p.points !== undefined && (
                  <div className="mt-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full ${
                        p.points >= 8
                          ? "bg-yellow-900/40 text-yellow-400"
                          : p.points >= 3
                          ? "bg-teal-900/40 text-teal-400"
                          : p.points > 0
                          ? "bg-slate-700 text-slate-300"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {p.points >= 8 && "🏆 "}
                      {p.points} pt{p.points > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 4 : Vérification TypeScript**

```powershell
cd C:\Users\GodFaz75\Desktop\appFootix
node_modules/.bin/tsc --noEmit
```

Résultat attendu : 0 erreur

- [ ] **Step 5 : Lancer les tests**

```powershell
npm test -- --run
```

Résultat attendu : tous PASS

- [ ] **Step 6 : Commit final**

```bash
git add .
git commit -m "feat: V3 complete — club/player pages, bracket, standings, enriched pronos"
```

---

## Self-Review

| Exigence spec | Tâche |
|---------------|-------|
| Page club avec effectif groupé par poste | ✅ Tasks 5 |
| Bannière = logo agrandi (pas TheSportsDB) | ✅ Task 5 — ClubHero |
| Page joueur avec photo Wikidata | ✅ Tasks 4, 6 |
| Photo Wikidata cachée localStorage | ✅ Task 2 — wikidataMedia.ts |
| Bracket pour coupes | ✅ Task 8 — BracketView |
| Classement pour ligues | ✅ Task 7 — StandingsTable |
| Onglets sur page compétition | ✅ Task 9 — CompetitionTabs |
| Page pronos avec résultats réels + points | ✅ Task 11 |
| Logo équipe → lien vers /club/[id] | ✅ Task 10 |
| competitionCode sauvegardé dans Prediction | ✅ Task 11 — PredictionForm |
| Standings surligne équipes favorites | ✅ Task 7 — StandingsTable |
| Fallback silhouette si pas de photo | ✅ Task 4 — PlayerPhoto |
| 0 erreur TypeScript | ✅ Task 11 — vérification finale |
