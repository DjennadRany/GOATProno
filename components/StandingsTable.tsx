"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import type { StandingRow } from "@/domain/standing"
import { getAllFavorites } from "@/services/favorites"

interface StandingsTableProps {
  rows: StandingRow[]
  group?: string | null
}

const FORM_COLOR: Record<string, string> = {
  W: "bg-green-500",
  D: "bg-slate-500",
  L: "bg-red-500",
}

export default function StandingsTable({ rows, group }: StandingsTableProps) {
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    setFavoriteIds(new Set(getAllFavorites().map((f) => f.teamId)))
  }, [])

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {group && (
        <div className="px-4 py-2 bg-slate-700 text-xs font-bold text-slate-300 uppercase tracking-wide">
          {group}
        </div>
      )}
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 px-3 py-2 text-xs text-slate-500 font-medium border-b border-slate-700">
        <span className="w-5 text-center">#</span>
        <span>Équipe</span>
        <span className="w-6 text-center">J</span>
        <span className="w-8 text-center">Pts</span>
        <span className="w-10 text-center hidden sm:block">+/-</span>
        <span className="hidden sm:block">Forme</span>
      </div>

      {rows.map((row) => {
        const isFav = favoriteIds.has(row.team.id)
        const formArray = row.form ? row.form.split(",").slice(0, 5) : []

        return (
          <Link
            key={row.team.id}
            href={`/club/${row.team.id}`}
            className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-2 items-center px-3 py-2.5 border-b border-slate-700/50 last:border-0 hover:bg-slate-700 transition-colors ${
              isFav ? "bg-teal-900/20" : ""
            }`}
          >
            <span className={`w-5 text-center text-xs font-bold ${row.position <= 4 ? "text-teal-400" : "text-slate-400"}`}>
              {row.position}
            </span>
            <div className="flex items-center gap-2 min-w-0">
              {row.team.crest && (
                <div className="relative w-5 h-5 shrink-0">
                  <Image src={row.team.crest} alt={row.team.name} fill className="object-contain" unoptimized />
                </div>
              )}
              <span className={`text-sm truncate ${isFav ? "text-teal-300 font-semibold" : "text-white"}`}>
                {row.team.name}
              </span>
              {isFav && <span className="text-yellow-400 text-xs shrink-0">★</span>}
            </div>
            <span className="w-6 text-center text-xs text-slate-400">{row.playedGames}</span>
            <span className="w-8 text-center text-sm font-bold text-white">{row.points}</span>
            <span className="w-10 text-center text-xs text-slate-400 hidden sm:block">
              {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
            </span>
            <div className="hidden sm:flex gap-0.5">
              {formArray.map((f, i) => (
                <span
                  key={i}
                  className={`w-3 h-3 rounded-full ${FORM_COLOR[f] ?? "bg-slate-600"}`}
                  title={f === "W" ? "Victoire" : f === "D" ? "Nul" : "Défaite"}
                />
              ))}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
