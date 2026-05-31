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
