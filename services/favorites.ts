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
