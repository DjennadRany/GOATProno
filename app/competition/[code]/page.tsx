"use client"

import { useState, useEffect, useCallback, use } from "react"
import type { Match } from "@/domain/match"
import type { Prediction } from "@/domain/prediction"
import type { Standing } from "@/domain/standing"
import { getCompetition } from "@/domain/competition"
import { fetchCompetitionMatches, fetchCompetitionTeams } from "@/services/footballData"
import { getAllPredictions } from "@/services/localPredictions"
import { getAllFavorites } from "@/services/favorites"
import { calculatePredictionPoints } from "@/domain/scoring"
import { useTeams } from "@/context/TeamsContext"
import Header from "@/components/Header"
import StatsBar from "@/components/StatsBar"
import MatchCard from "@/components/MatchCard"
import LocalLeaderboard from "@/components/LocalLeaderboard"
import LoadingState from "@/components/LoadingState"
import ErrorState from "@/components/ErrorState"
import CompetitionTabs from "@/components/CompetitionTabs"
import BracketView from "@/components/BracketView"
import StandingsTable from "@/components/StandingsTable"

export default function CompetitionPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = use(params)
  const competition = getCompetition(code)
  const isCup = competition?.type === "CUP"

  const [matches, setMatches] = useState<Match[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [standings, setStandings] = useState<Standing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFallback, setIsFallback] = useState(false)
  const [favoriteTeamIds, setFavoriteTeamIds] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState<string>("matches")

  const { addTeams } = useTeams()

  const tabs = [
    { key: "matches", label: "Matchs" },
    ...(isCup ? [{ key: "bracket", label: "Bracket" }] : [{ key: "standings", label: "Classement" }]),
  ]

  const refreshFavorites = useCallback(() => {
    setFavoriteTeamIds(new Set(getAllFavorites().map((f) => f.teamId)))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCompetitionMatches(code)
      setMatches(data.matches)
      setIsFallback(!!(data.fallback ?? data.error))
    } catch {
      setError("Impossible de charger les matchs.")
    } finally {
      setLoading(false)
    }

    fetchCompetitionTeams(code).then((teams) => {
      if (teams.length > 0 && competition) {
        addTeams(code, competition.name, teams)
      }
    })

    if (!isCup) {
      fetch(`/api/competitions/${code}/standings`)
        .then((r) => r.json())
        .then((data: { standings?: Standing[] }) => setStandings(data.standings ?? []))
        .catch(() => {})
    }
  }, [code, competition, isCup, addTeams])

  const refreshPredictions = useCallback(() => {
    setPredictions(getAllPredictions())
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => { refreshPredictions(); refreshFavorites() }, [refreshPredictions, refreshFavorites])

  const sortedMatches = [...matches].sort((a, b) => {
    const aFav = favoriteTeamIds.has(a.homeTeam.id) || favoriteTeamIds.has(a.awayTeam.id)
    const bFav = favoriteTeamIds.has(b.homeTeam.id) || favoriteTeamIds.has(b.awayTeam.id)
    if (aFav && !bFav) return -1
    if (!aFav && bFav) return 1
    return 0
  })

  const handlePredictionSaved = useCallback(() => {
    refreshPredictions()
    refreshFavorites()
  }, [refreshPredictions, refreshFavorites])

  const totalPoints = predictions.reduce((sum, p) => {
    const m = matches.find((x) => x.id === p.matchId)
    if (!m || m.status !== "FINISHED") return sum
    return sum + calculatePredictionPoints(p, m)
  }, 0)

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
          totalPoints={totalPoints}
        />

        <CompetitionTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}

        {/* Onglet Matchs */}
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

        {/* Onglet Bracket (coupes) */}
        {!loading && !error && activeTab === "bracket" && (
          <BracketView matches={matches} />
        )}

        {/* Onglet Classement (ligues) */}
        {!loading && !error && activeTab === "standings" && (
          <div className="space-y-4">
            {standings.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Classement non disponible.</p>
            ) : (
              standings.map((s, i) => (
                <StandingsTable key={i} rows={s.table} group={s.group} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
