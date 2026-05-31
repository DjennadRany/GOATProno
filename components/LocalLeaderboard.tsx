"use client"

import type { Prediction } from "@/domain/prediction"
import type { Match } from "@/domain/match"
import { calculatePredictionPoints } from "@/domain/scoring"

interface LocalLeaderboardProps {
  predictions: Prediction[]
  matches: Match[]
}

const FICTITIOUS_PLAYERS = [
  { name: "FootballFan42", bonus: 47 },
  { name: "PronoKing", bonus: 38 },
  { name: "GoalHunter", bonus: 31 },
  { name: "BallWatcher", bonus: 22 },
]

const MEDALS = ["🥇", "🥈", "🥉"]

export default function LocalLeaderboard({
  predictions,
  matches,
}: LocalLeaderboardProps) {
  const myPoints = predictions.reduce((total, p) => {
    const match = matches.find((m) => m.id === p.matchId)
    if (!match || match.status !== "FINISHED") return total
    return total + calculatePredictionPoints(p, match)
  }, 0)

  const leaderboard = [
    { name: "Toi", points: myPoints, isMe: true },
    ...FICTITIOUS_PLAYERS.map((p) => ({
      name: p.name,
      points: myPoints + p.bonus,
      isMe: false,
    })),
  ].sort((a, b) => b.points - a.points)

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <h2 className="text-sm font-bold text-teal-400 mb-3">🏆 Classement local</h2>
      <div className="space-y-2">
        {leaderboard.map((entry, idx) => (
          <div
            key={entry.name}
            className={`flex items-center justify-between py-2 px-3 rounded-lg ${
              entry.isMe
                ? "bg-teal-900/40 border border-teal-700"
                : "bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm w-5">{MEDALS[idx] ?? `${idx + 1}.`}</span>
              <span
                className={`text-sm ${
                  entry.isMe ? "text-teal-300 font-semibold" : "text-slate-300"
                }`}
              >
                {entry.name}
              </span>
            </div>
            <span className="text-sm font-bold text-yellow-400">{entry.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  )
}
