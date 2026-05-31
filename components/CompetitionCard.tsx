import Link from "next/link"
import type { Competition } from "@/domain/competition"

interface CompetitionCardProps {
  competition: Competition
}

export default function CompetitionCard({ competition }: CompetitionCardProps) {
  return (
    <Link
      href={`/competition/${competition.code}`}
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3 hover:border-teal-600 transition-colors group"
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
