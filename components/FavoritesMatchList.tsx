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

    const result: Record<number, Match[]> = {}
    for (const fav of favorites) {
      const compMatches = allMatchesByComp[fav.competitionCode] ?? []
      result[fav.teamId] = compMatches
        .filter(
          (m) =>
            m.homeTeam.id === fav.teamId || m.awayTeam.id === fav.teamId
        )
        .slice(0, 5)
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
                  <img
                    src={fav.crest}
                    alt={fav.teamName}
                    className="w-6 h-6 object-contain"
                  />
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
