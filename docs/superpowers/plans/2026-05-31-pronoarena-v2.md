# PronoArena V2 — Multi-ligues, Favoris, Recherche

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformer PronoArena en app multi-compétitions avec navigation par grille, favoris équipes et recherche globale.

**Architecture:** App Router Next.js avec routes dynamiques `/competition/[code]`. La grille d'accueil est un Server Component. Les pages de compétition sont des Client Components (localStorage pour pronos). Un TeamsContext global accumule les équipes des compétitions visitées pour alimenter la recherche côté client (0 appel API supplémentaire).

**Tech Stack:** Next.js 16 · TypeScript · Tailwind v4 · localStorage · React Context

---

## File Map

| Fichier | Action | Rôle |
|---------|--------|------|
| `domain/competition.ts` | Créer | Type Competition + constante COMPETITIONS (13 ligues) |
| `domain/favorite.ts` | Créer | Type FavoriteTeam |
| `services/favorites.ts` | Créer | CRUD localStorage favoris |
| `services/footballData.ts` | Modifier | Remplacer fetchMatches() par fetchCompetitionMatches(code) |
| `context/TeamsContext.tsx` | Créer | Store global des équipes chargées (React Context) |
| `app/api/competitions/route.ts` | Créer | Retourne la liste statique des 13 compétitions |
| `app/api/competitions/[code]/matches/route.ts` | Créer | Matchs d'une compétition (remplace /api/matches) |
| `app/api/competitions/[code]/teams/route.ts` | Créer | Équipes d'une compétition (cache 24h) |
| `app/api/matches/route.ts` | Supprimer | Remplacé par la route dynamique |
| `app/layout.tsx` | Modifier | Ajouter TeamsProvider |
| `app/page.tsx` | Remplacer | Grille des 13 compétitions (Server Component) |
| `app/competition/[code]/page.tsx` | Créer | Matchs + pronos d'une compétition |
| `app/favorites/page.tsx` | Créer | Mes équipes + leurs prochains matchs |
| `components/Header.tsx` | Modifier | Ajouter search icon + back nav optionnel |
| `components/CompetitionCard.tsx` | Créer | Card cliquable sur la grille |
| `components/FavoriteButton.tsx` | Créer | Bouton ⭐ toggle favori |
| `components/SearchOverlay.tsx` | Créer | Overlay recherche globale |
| `components/FavoritesMatchList.tsx` | Créer | Liste matchs pour /favorites |

---

## Task 1 — Domain : Competition + Favorite

**Files:**
- Créer : `domain/competition.ts`
- Créer : `domain/favorite.ts`

- [ ] **Step 1 : Créer `domain/competition.ts`**

```typescript
export interface Competition {
  id: number
  code: string
  name: string
  emblem: string
  area: string
  areaFlag: string
  type: "LEAGUE" | "CUP"
}

export const COMPETITIONS: Competition[] = [
  { id: 2000, code: "WC",  name: "FIFA World Cup",      emblem: "https://crests.football-data.org/wm26.png",    area: "Monde",           areaFlag: "",                                              type: "CUP"    },
  { id: 2001, code: "CL",  name: "Champions League",    emblem: "https://crests.football-data.org/CL.png",      area: "Europe",          areaFlag: "https://crests.football-data.org/EUR.svg",      type: "CUP"    },
  { id: 2018, code: "EC",  name: "Euro",                emblem: "https://crests.football-data.org/ec.png",      area: "Europe",          areaFlag: "https://crests.football-data.org/EUR.svg",      type: "CUP"    },
  { id: 2021, code: "PL",  name: "Premier League",      emblem: "https://crests.football-data.org/PL.png",      area: "Angleterre",      areaFlag: "https://crests.football-data.org/770.svg",      type: "LEAGUE" },
  { id: 2016, code: "ELC", name: "Championship",        emblem: "https://crests.football-data.org/ELC.png",     area: "Angleterre",      areaFlag: "https://crests.football-data.org/770.svg",      type: "LEAGUE" },
  { id: 2002, code: "BL1", name: "Bundesliga",          emblem: "https://crests.football-data.org/BL1.png",     area: "Allemagne",       areaFlag: "https://crests.football-data.org/759.svg",      type: "LEAGUE" },
  { id: 2019, code: "SA",  name: "Serie A",             emblem: "https://crests.football-data.org/c111.png",    area: "Italie",          areaFlag: "https://crests.football-data.org/784.svg",      type: "LEAGUE" },
  { id: 2015, code: "FL1", name: "Ligue 1",             emblem: "https://crests.football-data.org/FL1.png",     area: "France",          areaFlag: "https://crests.football-data.org/773.svg",      type: "LEAGUE" },
  { id: 2014, code: "PD",  name: "La Liga",             emblem: "https://crests.football-data.org/laliga.png",  area: "Espagne",         areaFlag: "https://crests.football-data.org/760.svg",      type: "LEAGUE" },
  { id: 2003, code: "DED", name: "Eredivisie",          emblem: "https://crests.football-data.org/ED.png",      area: "Pays-Bas",        areaFlag: "https://crests.football-data.org/8601.svg",     type: "LEAGUE" },
  { id: 2017, code: "PPL", name: "Primeira Liga",       emblem: "https://crests.football-data.org/PPL.png",     area: "Portugal",        areaFlag: "https://crests.football-data.org/765.svg",      type: "LEAGUE" },
  { id: 2013, code: "BSA", name: "Brasileiro Série A",  emblem: "https://crests.football-data.org/bsa.png",     area: "Brésil",          areaFlag: "https://crests.football-data.org/764.svg",      type: "LEAGUE" },
  { id: 2152, code: "CLI", name: "Copa Libertadores",   emblem: "https://crests.football-data.org/CLI.svg",     area: "Amérique du Sud", areaFlag: "",                                              type: "CUP"    },
]

export function getCompetition(code: string): Competition | undefined {
  return COMPETITIONS.find((c) => c.code === code)
}
```

- [ ] **Step 2 : Créer `domain/favorite.ts`**

```typescript
export interface FavoriteTeam {
  teamId: number
  teamName: string
  crest: string
  competitionCode: string
  competitionName: string
}
```

- [ ] **Step 3 : Commit**

```bash
git add domain/competition.ts domain/favorite.ts
git commit -m "feat: add Competition and FavoriteTeam domain types"
```

---

## Task 2 — Services : Favorites + FootballData update

**Files:**
- Créer : `services/favorites.ts`
- Modifier : `services/footballData.ts`

- [ ] **Step 1 : Créer `services/favorites.ts`**

```typescript
import type { FavoriteTeam } from "@/domain/favorite"

const LS_KEY = "pronoArena_v1_favorites"

export function getAllFavorites(): FavoriteTeam[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as FavoriteTeam[]) : []
  } catch {
    return []
  }
}

export function isFavorite(teamId: number): boolean {
  return getAllFavorites().some((f) => f.teamId === teamId)
}

export function addFavorite(team: FavoriteTeam): void {
  const all = getAllFavorites()
  if (!all.some((f) => f.teamId === team.teamId)) {
    localStorage.setItem(LS_KEY, JSON.stringify([...all, team]))
  }
}

export function removeFavorite(teamId: number): void {
  const filtered = getAllFavorites().filter((f) => f.teamId !== teamId)
  localStorage.setItem(LS_KEY, JSON.stringify(filtered))
}

export function toggleFavorite(team: FavoriteTeam): void {
  if (isFavorite(team.teamId)) {
    removeFavorite(team.teamId)
  } else {
    addFavorite(team)
  }
}
```

- [ ] **Step 2 : Remplacer `services/footballData.ts`**

```typescript
import type { Match, ApiMeta } from "@/domain/match"

export interface MatchesResponse {
  matches: Match[]
  meta: ApiMeta
  error?: string
  fallback?: boolean
}

export interface ApiTeam {
  id: number
  name: string
  shortName: string
  crest: string
}

export async function fetchCompetitionMatches(code: string): Promise<MatchesResponse> {
  const res = await fetch(`/api/competitions/${code}/matches`, { cache: "no-store" })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<MatchesResponse>
}

export async function fetchCompetitionTeams(code: string): Promise<ApiTeam[]> {
  const res = await fetch(`/api/competitions/${code}/teams`)
  if (!res.ok) return []
  const data = (await res.json()) as { teams: ApiTeam[] }
  return data.teams ?? []
}
```

- [ ] **Step 3 : Commit**

```bash
git add services/favorites.ts services/footballData.ts
git commit -m "feat: add favorites service and update footballData service"
```

---

## Task 3 — TeamsContext

**Files:**
- Créer : `context/TeamsContext.tsx`

- [ ] **Step 1 : Créer `context/TeamsContext.tsx`**

```typescript
"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"

export interface TeamWithComp {
  id: number
  name: string
  shortName: string
  crest: string
  competitionCode: string
  competitionName: string
}

interface TeamsContextValue {
  teams: TeamWithComp[]
  addTeams: (
    competitionCode: string,
    competitionName: string,
    teams: Array<{ id: number; name: string; shortName: string; crest: string }>
  ) => void
}

const TeamsContext = createContext<TeamsContextValue>({
  teams: [],
  addTeams: () => {},
})

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<TeamWithComp[]>([])

  const addTeams = useCallback(
    (
      competitionCode: string,
      competitionName: string,
      newTeams: Array<{ id: number; name: string; shortName: string; crest: string }>
    ) => {
      setTeams((prev) => {
        const existingIds = new Set(prev.map((t) => t.id))
        const toAdd = newTeams
          .filter((t) => !existingIds.has(t.id))
          .map((t) => ({ ...t, competitionCode, competitionName }))
        return toAdd.length > 0 ? [...prev, ...toAdd] : prev
      })
    },
    []
  )

  return (
    <TeamsContext.Provider value={{ teams, addTeams }}>
      {children}
    </TeamsContext.Provider>
  )
}

export function useTeams() {
  return useContext(TeamsContext)
}
```

- [ ] **Step 2 : Modifier `app/layout.tsx` pour ajouter TeamsProvider**

```typescript
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TeamsProvider } from "@/context/TeamsContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PronoArena — Football",
  description: "Pronostique, gagne des points, grimpe au classement.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body
        className={`${inter.className} bg-slate-900 text-slate-100 min-h-screen antialiased`}
      >
        <TeamsProvider>{children}</TeamsProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3 : Commit**

```bash
git add context/TeamsContext.tsx app/layout.tsx
git commit -m "feat: add TeamsContext for global team search"
```

---

## Task 4 — API Routes

**Files:**
- Créer : `app/api/competitions/route.ts`
- Créer : `app/api/competitions/[code]/matches/route.ts`
- Créer : `app/api/competitions/[code]/teams/route.ts`
- Supprimer : `app/api/matches/route.ts`

- [ ] **Step 1 : Créer `app/api/competitions/route.ts`**

```typescript
import { COMPETITIONS } from "@/domain/competition"

export async function GET() {
  return Response.json({ competitions: COMPETITIONS })
}
```

- [ ] **Step 2 : Créer `app/api/competitions/[code]/matches/route.ts`**

```typescript
import type { Match, ApiMeta } from "@/domain/match"
import { COMPETITIONS } from "@/domain/competition"

export const revalidate = 300

const FUTURE = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString()

function getMockMatches(code: string): Match[] {
  const comp = COMPETITIONS.find((c) => c.code === code)
  if (!comp) return []
  return [
    {
      id: 90001,
      utcDate: FUTURE,
      status: "SCHEDULED",
      stage: "GROUP_STAGE",
      group: "Group A",
      homeTeam: { id: 1, name: "Équipe A", crest: "" },
      awayTeam: { id: 2, name: "Équipe B", crest: "" },
      score: { fullTime: { home: null, away: null }, halfTime: { home: null, away: null } },
      competition: { name: comp.name, emblem: comp.emblem },
    },
  ]
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params
  const token = process.env.FOOTBALL_DATA_TOKEN

  if (!token) {
    return Response.json({
      matches: getMockMatches(code),
      meta: { requestsAvailable: null, requestCounterReset: null },
      fallback: true,
    })
  }

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${code}/matches`,
      { headers: { "X-Auth-Token": token } }
    )

    const meta: ApiMeta = {
      requestsAvailable: res.headers.get("X-RequestsAvailable"),
      requestCounterReset: res.headers.get("X-RequestCounter-Reset"),
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return Response.json({
        matches: getMockMatches(code),
        meta,
        error: (body as { message?: string }).message ?? `Erreur API ${res.status}`,
        fallback: true,
      })
    }

    const data = (await res.json()) as { matches?: Match[] }
    const matches = data.matches ?? []

    if (matches.length === 0) {
      return Response.json({ matches: getMockMatches(code), meta, fallback: true })
    }

    return Response.json({ matches, meta })
  } catch {
    return Response.json({
      matches: getMockMatches(code),
      meta: { requestsAvailable: null, requestCounterReset: null },
      fallback: true,
    })
  }
}
```

- [ ] **Step 3 : Créer `app/api/competitions/[code]/teams/route.ts`**

```typescript
export const revalidate = 86400

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params
  const token = process.env.FOOTBALL_DATA_TOKEN

  if (!token) return Response.json({ teams: [] })

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${code}/teams`,
      { headers: { "X-Auth-Token": token } }
    )
    if (!res.ok) return Response.json({ teams: [] })

    const data = (await res.json()) as {
      teams?: Array<{ id: number; name: string; shortName: string; crest: string }>
    }
    return Response.json({ teams: data.teams ?? [] })
  } catch {
    return Response.json({ teams: [] })
  }
}
```

- [ ] **Step 4 : Supprimer `app/api/matches/route.ts`**

```bash
rm app/api/matches/route.ts
```

- [ ] **Step 5 : Commit**

```bash
git add app/api/competitions/
git rm app/api/matches/route.ts
git commit -m "feat: add competition API routes, remove old /api/matches"
```

---

## Task 5 — Header mis à jour

**Files:**
- Modifier : `components/Header.tsx`

- [ ] **Step 1 : Remplacer `components/Header.tsx`**

```typescript
"use client"

import Link from "next/link"
import { useState } from "react"
import SearchOverlay from "./SearchOverlay"

interface HeaderProps {
  title?: string
  backHref?: string
  competitionEmblem?: string
}

export default function Header({ title, backHref, competitionEmblem }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {backHref ? (
            <Link href={backHref} className="text-slate-400 hover:text-white transition-colors mr-1">
              ←
            </Link>
          ) : null}

          {competitionEmblem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={competitionEmblem} alt="" className="w-7 h-7 object-contain" />
          ) : (
            <span className="text-2xl" role="img" aria-label="football">⚽</span>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-teal-400 leading-none truncate">
              {title ?? "PronoArena"}
            </h1>
            {!title && (
              <p className="text-xs text-slate-400">
                Pronostique, gagne des points, grimpe au classement.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/favorites"
              className="text-slate-400 hover:text-yellow-400 transition-colors text-lg"
              title="Mes équipes"
            >
              ⭐
            </Link>
            <button
              onClick={() => setSearchOpen(true)}
              className="text-slate-400 hover:text-white transition-colors text-lg"
              aria-label="Rechercher"
            >
              🔍
            </button>
          </div>
        </div>
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add components/Header.tsx
git commit -m "feat: update Header with search icon, back nav, favorites link"
```

---

## Task 6 — CompetitionCard + Home Page

**Files:**
- Créer : `components/CompetitionCard.tsx`
- Remplacer : `app/page.tsx`

- [ ] **Step 1 : Créer `components/CompetitionCard.tsx`**

```typescript
import Link from "next/link"
import type { Competition } from "@/domain/competition"

interface CompetitionCardProps {
  competition: Competition
}

export default function CompetitionCard({ competition }: CompetitionCardProps) {
  return (
    <Link
      href={`/competition/${competition.code}`}
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-teal-600 hover:bg-slate-750 transition-colors group"
    >
      {competition.emblem ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={competition.emblem}
          alt={competition.name}
          className="w-14 h-14 object-contain"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-2xl">
          🏆
        </div>
      )}
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-100 group-hover:text-teal-400 transition-colors leading-tight">
          {competition.name}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{competition.area}</p>
      </div>
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          competition.type === "CUP"
            ? "bg-yellow-900/40 text-yellow-400"
            : "bg-teal-900/40 text-teal-400"
        }`}
      >
        {competition.type === "CUP" ? "Coupe" : "Ligue"}
      </span>
    </Link>
  )
}
```

- [ ] **Step 2 : Remplacer `app/page.tsx` (Server Component)**

```typescript
import { COMPETITIONS } from "@/domain/competition"
import Header from "@/components/Header"
import CompetitionCard from "@/components/CompetitionCard"

export default function HomePage() {
  const cups = COMPETITIONS.filter((c) => c.type === "CUP")
  const leagues = COMPETITIONS.filter((c) => c.type === "LEAGUE")

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Coupes &amp; Compétitions internationales
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cups.map((comp) => (
              <CompetitionCard key={comp.code} competition={comp} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Championnats
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {leagues.map((comp) => (
              <CompetitionCard key={comp.code} competition={comp} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
```

- [ ] **Step 3 : Commit**

```bash
git add components/CompetitionCard.tsx app/page.tsx
git commit -m "feat: competition grid home page"
```

---

## Task 7 — FavoriteButton

**Files:**
- Créer : `components/FavoriteButton.tsx`

- [ ] **Step 1 : Créer `components/FavoriteButton.tsx`**

```typescript
"use client"

import { useState, useEffect } from "react"
import { isFavorite, toggleFavorite } from "@/services/favorites"
import type { FavoriteTeam } from "@/domain/favorite"

interface FavoriteButtonProps {
  team: FavoriteTeam
}

export default function FavoriteButton({ team }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    setFavorited(isFavorite(team.teamId))
  }, [team.teamId])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(team)
    setFavorited((prev) => !prev)
  }

  return (
    <button
      onClick={handleClick}
      title={favorited ? "Ne plus suivre" : "Suivre cette équipe"}
      className={`text-sm transition-all ${
        favorited
          ? "text-yellow-400 hover:text-yellow-300"
          : "text-slate-500 hover:text-yellow-400"
      }`}
    >
      {favorited ? "⭐" : "☆"}
    </button>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add components/FavoriteButton.tsx
git commit -m "feat: add FavoriteButton component"
```

---

## Task 8 — MatchCard mis à jour + Competition Page

**Files:**
- Modifier : `components/MatchCard.tsx`
- Créer : `app/competition/[code]/page.tsx`

- [ ] **Step 1 : Modifier `components/MatchCard.tsx` pour accepter `isFavoriteMatch`**

Lire le fichier d'abord, puis remplacer le début du composant pour accepter le prop :

```typescript
"use client"

import Image from "next/image"
import type { Match } from "@/domain/match"
import { formatMatchDate } from "@/lib/formatDate"
import PredictionForm from "./PredictionForm"
import FavoriteButton from "./FavoriteButton"

interface MatchCardProps {
  match: Match
  onPredictionSaved: () => void
  isFavoriteMatch?: boolean
  competitionCode?: string
  competitionName?: string
}

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Programmé",
  TIMED: "Programmé",
  IN_PLAY: "🔴 En direct",
  PAUSED: "⏸ Pause",
  FINISHED: "Terminé",
  POSTPONED: "Reporté",
  CANCELLED: "Annulé",
  SUSPENDED: "Suspendu",
}

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: "text-slate-400",
  TIMED: "text-slate-400",
  IN_PLAY: "text-green-400 animate-pulse",
  PAUSED: "text-yellow-400",
  FINISHED: "text-blue-400",
  POSTPONED: "text-orange-400",
  CANCELLED: "text-red-400",
  SUSPENDED: "text-red-400",
}

function TeamCrest({ src, name }: { src: string; name: string }) {
  if (!src) return <div className="w-10 h-10 rounded-full bg-slate-700" />
  return (
    <div className="relative w-10 h-10">
      <Image src={src} alt={name} fill className="object-contain" unoptimized />
    </div>
  )
}

export default function MatchCard({
  match,
  onPredictionSaved,
  isFavoriteMatch = false,
  competitionCode = "",
  competitionName = "",
}: MatchCardProps) {
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED"
  const isFinished = match.status === "FINISHED"
  const showScore =
    (isLive || isFinished) &&
    match.score.fullTime.home !== null &&
    match.score.fullTime.away !== null

  return (
    <article
      className={`rounded-xl p-4 border transition-colors ${
        isFavoriteMatch
          ? "bg-slate-800 border-teal-700"
          : "bg-slate-800 border-slate-700"
      }`}
    >
      {/* Meta */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400 truncate flex items-center gap-1">
          {isFavoriteMatch && <span className="text-yellow-400">⭐</span>}
          {match.stage.replace(/_/g, " ")}
          {match.group ? ` · ${match.group}` : ""}
        </span>
        <span
          className={`text-xs font-medium ml-2 shrink-0 ${
            STATUS_COLOR[match.status] ?? "text-slate-400"
          }`}
        >
          {STATUS_LABEL[match.status] ?? match.status}
        </span>
      </div>

      {/* Équipes */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-1 flex-1">
          <div className="relative">
            <TeamCrest src={match.homeTeam.crest} name={match.homeTeam.name} />
            <div className="absolute -top-1 -right-1">
              <FavoriteButton
                team={{
                  teamId: match.homeTeam.id,
                  teamName: match.homeTeam.name,
                  crest: match.homeTeam.crest,
                  competitionCode,
                  competitionName,
                }}
              />
            </div>
          </div>
          <span className="text-sm font-semibold text-center leading-tight line-clamp-2">
            {match.homeTeam.name}
          </span>
        </div>

        <div className="flex flex-col items-center min-w-[72px]">
          {showScore ? (
            <span className="text-2xl font-bold text-white tabular-nums">
              {match.score.fullTime.home} – {match.score.fullTime.away}
            </span>
          ) : (
            <>
              <span className="text-xs text-slate-400 text-center leading-tight">
                {formatMatchDate(match.utcDate)}
              </span>
              <span className="text-lg font-bold text-slate-500 mt-1">VS</span>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-1 flex-1">
          <div className="relative">
            <TeamCrest src={match.awayTeam.crest} name={match.awayTeam.name} />
            <div className="absolute -top-1 -right-1">
              <FavoriteButton
                team={{
                  teamId: match.awayTeam.id,
                  teamName: match.awayTeam.name,
                  crest: match.awayTeam.crest,
                  competitionCode,
                  competitionName,
                }}
              />
            </div>
          </div>
          <span className="text-sm font-semibold text-center leading-tight line-clamp-2">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Pronostic */}
      <PredictionForm match={match} onSaved={onPredictionSaved} />
    </article>
  )
}
```

- [ ] **Step 2 : Créer `app/competition/[code]/page.tsx`**

```typescript
"use client"

import { useState, useEffect, useCallback } from "react"
import { use } from "react"
import type { Match, ApiMeta } from "@/domain/match"
import type { Prediction } from "@/domain/prediction"
import { getCompetition } from "@/domain/competition"
import { fetchCompetitionMatches, fetchCompetitionTeams } from "@/services/footballData"
import { getAllPredictions } from "@/services/localPredictions"
import { getAllFavorites } from "@/services/favorites"
import { useTeams } from "@/context/TeamsContext"
import Header from "@/components/Header"
import StatsBar from "@/components/StatsBar"
import MatchCard from "@/components/MatchCard"
import LocalLeaderboard from "@/components/LocalLeaderboard"
import LoadingState from "@/components/LoadingState"
import ErrorState from "@/components/ErrorState"

export default function CompetitionPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = use(params)
  const competition = getCompetition(code)

  const [matches, setMatches] = useState<Match[]>([])
  const [meta, setMeta] = useState<ApiMeta>({ requestsAvailable: null, requestCounterReset: null })
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFallback, setIsFallback] = useState(false)
  const [favoriteTeamIds, setFavoriteTeamIds] = useState<Set<number>>(new Set())

  const { addTeams } = useTeams()

  const refreshFavorites = useCallback(() => {
    const ids = new Set(getAllFavorites().map((f) => f.teamId))
    setFavoriteTeamIds(ids)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCompetitionMatches(code)
      setMatches(data.matches)
      setMeta(data.meta)
      setIsFallback(!!(data.fallback ?? data.error))
    } catch {
      setError("Impossible de charger les matchs.")
    } finally {
      setLoading(false)
    }

    // Charger les équipes en background pour la recherche
    fetchCompetitionTeams(code).then((teams) => {
      if (teams.length > 0 && competition) {
        addTeams(code, competition.name, teams)
      }
    })
  }, [code, competition, addTeams])

  const refreshPredictions = useCallback(() => {
    setPredictions(getAllPredictions())
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    refreshPredictions()
    refreshFavorites()
  }, [refreshPredictions, refreshFavorites])

  // Trier : matchs d'équipes favorites en premier
  const sortedMatches = [...matches].sort((a, b) => {
    const aFav =
      favoriteTeamIds.has(a.homeTeam.id) || favoriteTeamIds.has(a.awayTeam.id)
    const bFav =
      favoriteTeamIds.has(b.homeTeam.id) || favoriteTeamIds.has(b.awayTeam.id)
    if (aFav && !bFav) return -1
    if (!aFav && bFav) return 1
    return 0
  })

  return (
    <div className="min-h-screen bg-slate-900">
      <Header
        title={competition?.name ?? code}
        backHref="/"
        competitionEmblem={competition?.emblem}
      />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {isFallback && !loading && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-xl px-4 py-2.5 text-sm text-yellow-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>Données de démonstration — API non disponible</span>
          </div>
        )}

        <StatsBar
          matchCount={matches.length}
          predictionCount={predictions.length}
          requestsAvailable={meta.requestsAvailable}
        />

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && matches.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-4xl mb-3">🔍</div>
            <p>Aucun match disponible pour cette compétition.</p>
          </div>
        )}

        {!loading && !error && sortedMatches.length > 0 && (
          <div className="space-y-4">
            {sortedMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onPredictionSaved={() => {
                  refreshPredictions()
                  refreshFavorites()
                }}
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

        {!loading && !error && predictions.length > 0 && (
          <LocalLeaderboard predictions={predictions} matches={matches} />
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 3 : Commit**

```bash
git add components/MatchCard.tsx app/competition/
git commit -m "feat: competition detail page with favorites highlighting"
```

---

## Task 9 — SearchOverlay

**Files:**
- Créer : `components/SearchOverlay.tsx`

- [ ] **Step 1 : Créer `components/SearchOverlay.tsx`**

```typescript
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useTeams, type TeamWithComp } from "@/context/TeamsContext"
import { isFavorite, toggleFavorite } from "@/services/favorites"
import Image from "next/image"

interface SearchOverlayProps {
  onClose: () => void
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const [favoriteMap, setFavoriteMap] = useState<Record<number, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 300)
  const { teams } = useTeams()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const results: TeamWithComp[] = debouncedQuery.trim().length >= 2
    ? teams.filter(
        (t) =>
          t.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          t.shortName?.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 20)
    : []

  const handleToggleFavorite = (team: TeamWithComp) => {
    toggleFavorite({
      teamId: team.id,
      teamName: team.name,
      crest: team.crest,
      competitionCode: team.competitionCode,
      competitionName: team.competitionName,
    })
    setFavoriteMap((prev) => ({ ...prev, [team.id]: !prev[team.id] }))
  }

  const getFavState = (teamId: number) => {
    if (teamId in favoriteMap) return favoriteMap[teamId]
    return isFavorite(teamId)
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Input */}
      <div className="max-w-2xl w-full mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3">
          <span className="text-slate-400">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une équipe..."
            className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">
            ✕
          </button>
        </div>
      </div>

      {/* Résultats */}
      <div className="max-w-2xl w-full mx-auto px-4 overflow-y-auto flex-1">
        {debouncedQuery.length >= 2 && results.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-8">
            Aucune équipe trouvée.{" "}
            {teams.length === 0 && "Visite d'abord une compétition pour activer la recherche."}
          </p>
        )}

        {results.length > 0 && (
          <div className="space-y-2 pb-8">
            <p className="text-xs text-slate-500 mb-3">{results.length} équipe(s)</p>
            {results.map((team) => {
              const fav = getFavState(team.id)
              return (
                <div
                  key={`${team.id}-${team.competitionCode}`}
                  className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                >
                  {team.crest ? (
                    <div className="relative w-8 h-8 shrink-0">
                      <Image src={team.crest} alt={team.name} fill className="object-contain" unoptimized />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{team.name}</p>
                    <p className="text-xs text-slate-400 truncate">{team.competitionName}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleFavorite(team)}
                      className={`text-lg transition-colors ${
                        fav ? "text-yellow-400" : "text-slate-500 hover:text-yellow-400"
                      }`}
                    >
                      {fav ? "⭐" : "☆"}
                    </button>
                    <Link
                      href={`/competition/${team.competitionCode}`}
                      onClick={onClose}
                      className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                    >
                      Voir →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!query && teams.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-8">
            Visite une compétition pour activer la recherche d&apos;équipes.
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add components/SearchOverlay.tsx
git commit -m "feat: add SearchOverlay component"
```

---

## Task 10 — Page Favorites

**Files:**
- Créer : `components/FavoritesMatchList.tsx`
- Créer : `app/favorites/page.tsx`

- [ ] **Step 1 : Créer `components/FavoritesMatchList.tsx`**

```typescript
"use client"

import { useState, useEffect, useCallback } from "react"
import type { Match } from "@/domain/match"
import type { FavoriteTeam } from "@/domain/favorite"
import { fetchCompetitionMatches } from "@/services/footballData"
import { removeFavorite } from "@/services/favorites"
import { getAllPredictions } from "@/services/localPredictions"
import MatchCard from "./MatchCard"
import LoadingState from "./LoadingState"

interface FavoritesMatchListProps {
  favorites: FavoriteTeam[]
  onFavoritesChanged: () => void
}

export default function FavoritesMatchList({
  favorites,
  onFavoritesChanged,
}: FavoritesMatchListProps) {
  const [matchesByTeam, setMatchesByTeam] = useState<Record<number, Match[]>>({})
  const [loading, setLoading] = useState(true)
  const [predictions, setPredictions] = useState(getAllPredictions())

  const loadMatches = useCallback(async () => {
    if (favorites.length === 0) {
      setLoading(false)
      return
    }

    setLoading(true)

    // Grouper par compétition pour éviter les doublons d'appel API
    const compCodes = [...new Set(favorites.map((f) => f.competitionCode))]

    const allMatchesByComp: Record<string, Match[]> = {}
    await Promise.allSettled(
      compCodes.map(async (code) => {
        try {
          const data = await fetchCompetitionMatches(code)
          allMatchesByComp[code] = data.matches
        } catch {
          allMatchesByComp[code] = []
        }
      })
    )

    // Filtrer les matchs par équipe favorite
    const result: Record<number, Match[]> = {}
    for (const fav of favorites) {
      const compMatches = allMatchesByComp[fav.competitionCode] ?? []
      result[fav.teamId] = compMatches
        .filter(
          (m) => m.homeTeam.id === fav.teamId || m.awayTeam.id === fav.teamId
        )
        .slice(0, 5) // 5 prochains matchs max par équipe
    }

    setMatchesByTeam(result)
    setLoading(false)
  }, [favorites])

  useEffect(() => {
    loadMatches()
  }, [loadMatches])

  if (loading) return <LoadingState />

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="text-4xl mb-3">⭐</div>
        <p>Aucune équipe suivie.</p>
        <p className="text-sm mt-2">
          Visite une compétition et clique sur ☆ pour suivre une équipe.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {favorites.map((fav) => {
        const matches = matchesByTeam[fav.teamId] ?? []
        return (
          <section key={fav.teamId}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {fav.crest && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fav.crest} alt={fav.teamName} className="w-6 h-6 object-contain" />
                )}
                <h2 className="text-sm font-bold text-white">{fav.teamName}</h2>
                <span className="text-xs text-slate-400">{fav.competitionName}</span>
              </div>
              <button
                onClick={() => {
                  removeFavorite(fav.teamId)
                  onFavoritesChanged()
                }}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                ✕ Ne plus suivre
              </button>
            </div>

            {matches.length === 0 ? (
              <p className="text-xs text-slate-500 pl-2">Aucun match disponible.</p>
            ) : (
              <div className="space-y-3">
                {matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onPredictionSaved={() => setPredictions(getAllPredictions())}
                    isFavoriteMatch
                    competitionCode={fav.competitionCode}
                    competitionName={fav.competitionName}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2 : Créer `app/favorites/page.tsx`**

```typescript
"use client"

import { useState, useEffect, useCallback } from "react"
import type { FavoriteTeam } from "@/domain/favorite"
import { getAllFavorites } from "@/services/favorites"
import Header from "@/components/Header"
import FavoritesMatchList from "@/components/FavoritesMatchList"

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteTeam[]>([])

  const refresh = useCallback(() => {
    setFavorites(getAllFavorites())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <div className="min-h-screen bg-slate-900">
      <Header title="Mes équipes" backHref="/" />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <FavoritesMatchList favorites={favorites} onFavoritesChanged={refresh} />
      </main>
    </div>
  )
}
```

- [ ] **Step 3 : Commit**

```bash
git add components/FavoritesMatchList.tsx app/favorites/page.tsx
git commit -m "feat: favorites page with team matches"
```

---

## Self-Review

| Exigence spec | Tâche |
|---------------|-------|
| Grille 13 compétitions (`/`) | ✅ Task 6 |
| Page `/competition/[code]` | ✅ Task 8 |
| `/favorites` avec matchs des équipes suivies | ✅ Task 10 |
| Surlignage + tri favoris dans liste matchs | ✅ Task 8 (`isFavoriteMatch`, sort) |
| Bouton ⭐ Suivre/Ne plus suivre | ✅ Task 7 |
| Search overlay depuis Header | ✅ Tasks 5 + 9 |
| Résultats équipes avec toggle favori | ✅ Task 9 |
| 0 appel API supplémentaire pour search | ✅ TeamsContext (Task 3) |
| Route `/api/competitions/[code]/matches` | ✅ Task 4 |
| Route `/api/competitions/[code]/teams` (cache 24h) | ✅ Task 4 |
| Token jamais côté client | ✅ Toutes les routes serveur |
