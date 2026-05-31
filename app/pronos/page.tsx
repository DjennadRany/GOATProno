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
    if (predictions.length === 0) { setEnriched([]); setLoading(false); return }

    const codes = [...new Set(predictions.map((p) => p.competitionCode).filter(Boolean))] as string[]
    const matchesByCode: Record<string, Match[]> = {}

    await Promise.allSettled(
      codes.map(async (code) => {
        try {
          const data = await fetchCompetitionMatches(code)
          matchesByCode[code] = data.matches
        } catch { matchesByCode[code] = [] }
      })
    )

    const result: EnrichedPrediction[] = predictions.map((p) => {
      const compMatches = p.competitionCode ? matchesByCode[p.competitionCode] ?? [] : []
      const match = compMatches.find((m) => m.id === p.matchId)
      const points = match?.status === "FINISHED" ? calculatePredictionPoints(p, match) : undefined
      return { ...p, match, points }
    })

    result.sort((a, b) => {
      if (a.match?.status === "FINISHED" && b.match?.status !== "FINISHED") return -1
      if (a.match?.status !== "FINISHED" && b.match?.status === "FINISHED") return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    setEnriched(result)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const totalPoints = enriched.reduce((sum, p) => sum + (p.points ?? 0), 0)
  const finished = enriched.filter((p) => p.match?.status === "FINISHED").length

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
            <p className="text-sm mb-6">Visite une compétition et entre ton score prédit pour chaque match.</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Voir les compétitions <ArrowRight size={16} />
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
            <div className="text-xl font-bold text-blue-400">{finished}</div>
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
            const ah = p.match?.score.fullTime.home
            const aa = p.match?.score.fullTime.away
            const isPen = p.match?.score.duration === "PENALTY_SHOOTOUT"
            const regH = p.match?.score.regularTime?.home
            const regA = p.match?.score.regularTime?.away
            const displayH = isPen && regH !== undefined ? regH : ah
            const displayA = isPen && regA !== undefined ? regA : aa

            return (
              <div key={p.matchId} className={`bg-slate-800 rounded-xl border p-4 ${isFinished ? "border-slate-600" : "border-slate-700"}`}>
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                  <span>
                    {new Date(p.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {isFinished ? (
                    <span className="flex items-center gap-1 text-blue-400"><CheckCircle size={12} />Terminé</span>
                  ) : (
                    <span className="flex items-center gap-1"><Clock size={12} />À venir</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex-1 text-sm font-semibold text-right text-slate-100 truncate">{p.homeTeam}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Score prédit */}
                    <span className="bg-teal-900/50 border border-teal-700 text-teal-300 font-bold text-base w-8 h-8 flex items-center justify-center rounded-lg">{p.predictedHomeScore}</span>
                    <span className="text-slate-400 font-bold text-xs">–</span>
                    <span className="bg-teal-900/50 border border-teal-700 text-teal-300 font-bold text-base w-8 h-8 flex items-center justify-center rounded-lg">{p.predictedAwayScore}</span>

                    {/* Score réel */}
                    {isFinished && displayH !== null && displayA !== null && displayH !== undefined && displayA !== undefined && (
                      <>
                        <span className="text-slate-500 text-xs mx-1">vs</span>
                        <span className="bg-slate-700 border border-slate-600 text-slate-200 font-bold text-base w-8 h-8 flex items-center justify-center rounded-lg">{displayH}</span>
                        <span className="text-slate-400 font-bold text-xs">–</span>
                        <span className="bg-slate-700 border border-slate-600 text-slate-200 font-bold text-base w-8 h-8 flex items-center justify-center rounded-lg">{displayA}</span>
                        {isPen && p.match?.score.penalties && (
                          <span className="text-xs text-yellow-400 ml-1">t.a.b.</span>
                        )}
                      </>
                    )}
                  </div>
                  <span className="flex-1 text-sm font-semibold text-left text-slate-100 truncate">{p.awayTeam}</span>
                </div>

                {p.points !== undefined && (
                  <div className="mt-3 text-center">
                    <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full ${
                      p.points >= 8 ? "bg-yellow-900/40 text-yellow-400" :
                      p.points >= 3 ? "bg-teal-900/40 text-teal-400" :
                      p.points > 0 ? "bg-slate-700 text-slate-300" : "bg-slate-800 text-slate-500"
                    }`}>
                      {p.points >= 8 && "🏆 "}{p.points} pt{p.points > 1 ? "s" : ""}
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
