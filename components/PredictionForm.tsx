"use client"

import { useState, useEffect } from "react"
import type { Match } from "@/domain/match"
import type { Prediction } from "@/domain/prediction"
import { savePrediction, getPrediction } from "@/services/localPredictions"
import { isMatchLocked } from "@/lib/formatDate"
import { calculatePredictionPoints } from "@/domain/scoring"

interface PredictionFormProps {
  match: Match
  onSaved: () => void
  competitionCode?: string
}

export default function PredictionForm({ match, onSaved, competitionCode }: PredictionFormProps) {
  const [homeScore, setHomeScore] = useState("")
  const [awayScore, setAwayScore] = useState("")
  const [saved, setSaved] = useState(false)
  const locked = isMatchLocked(match)

  useEffect(() => {
    const existing = getPrediction(match.id)
    if (existing) {
      setHomeScore(String(existing.predictedHomeScore))
      setAwayScore(String(existing.predictedAwayScore))
      setSaved(true)
    }
  }, [match.id])

  if (locked) {
    const existing = getPrediction(match.id)

    if (!existing) {
      return (
        <p className="mt-3 text-center text-xs text-slate-500">
          ⏱ Match déjà commencé — pronostic impossible
        </p>
      )
    }

    const points =
      match.status === "FINISHED"
        ? calculatePredictionPoints(existing, match)
        : null

    return (
      <div className="mt-3 bg-slate-900 rounded-lg px-3 py-2 flex items-center justify-between">
        <span className="text-xs text-slate-400">Ton prono :</span>
        <span className="font-bold text-teal-300 text-sm">
          {existing.predictedHomeScore} – {existing.predictedAwayScore}
        </span>
        {points !== null && (
          <span className="text-xs font-semibold text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded-full">
            {points} pts
          </span>
        )}
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ph = parseInt(homeScore, 10)
    const pa = parseInt(awayScore, 10)
    if (isNaN(ph) || isNaN(pa) || ph < 0 || pa < 0) return

    const prediction: Prediction = {
      matchId: match.id,
      competitionCode,
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      predictedHomeScore: ph,
      predictedAwayScore: pa,
      createdAt: new Date().toISOString(),
    }

    savePrediction(prediction)
    setSaved(true)
    onSaved()
  }

  const isValid =
    homeScore !== "" &&
    awayScore !== "" &&
    parseInt(homeScore, 10) >= 0 &&
    parseInt(awayScore, 10) >= 0

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
      <input
        type="number"
        min={0}
        max={99}
        value={homeScore}
        onChange={(e) => {
          setHomeScore(e.target.value)
          setSaved(false)
        }}
        placeholder="0"
        className="w-14 text-center bg-slate-900 border border-slate-600 focus:border-teal-500 focus:outline-none rounded-lg py-2 text-white font-semibold"
      />
      <span className="text-slate-400 font-bold text-lg">–</span>
      <input
        type="number"
        min={0}
        max={99}
        value={awayScore}
        onChange={(e) => {
          setAwayScore(e.target.value)
          setSaved(false)
        }}
        placeholder="0"
        className="w-14 text-center bg-slate-900 border border-slate-600 focus:border-teal-500 focus:outline-none rounded-lg py-2 text-white font-semibold"
      />
      <button
        type="submit"
        disabled={!isValid}
        className="flex-1 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
      >
        {saved ? "✓ Modifié" : "Valider mon prono"}
      </button>
    </form>
  )
}
