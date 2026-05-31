interface StatsBarProps {
  matchCount: number
  predictionCount: number
  totalPoints: number
}

export default function StatsBar({
  matchCount,
  predictionCount,
  totalPoints,
}: StatsBarProps) {
  const stats = [
    { label: "Matchs", value: matchCount },
    { label: "Pronos", value: predictionCount },
    { label: "Mes points", value: totalPoints },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-slate-800 rounded-xl p-3 text-center border border-slate-700"
        >
          <div className="text-xl font-bold text-teal-400">{s.value}</div>
          <div className="text-xs text-slate-400 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  )
}
