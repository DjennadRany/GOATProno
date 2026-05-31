"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useTeams, type TeamWithComp } from "@/context/TeamsContext"
import { isFavorite, toggleFavorite } from "@/services/favorites"

interface SearchOverlayProps {
  onClose: () => void
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("")
  const [favMap, setFavMap] = useState<Record<number, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 300)
  const { teams } = useTeams()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const results: TeamWithComp[] =
    debouncedQuery.trim().length >= 2
      ? teams
          .filter(
            (t) =>
              t.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
              t.shortName?.toLowerCase().includes(debouncedQuery.toLowerCase())
          )
          .slice(0, 20)
      : []

  const getFavState = (teamId: number) => {
    if (teamId in favMap) return favMap[teamId]
    return isFavorite(teamId)
  }

  const handleToggle = (team: TeamWithComp) => {
    toggleFavorite({
      teamId: team.id,
      teamName: team.name,
      crest: team.crest,
      competitionCode: team.competitionCode,
      competitionName: team.competitionName,
    })
    setFavMap((prev) => ({ ...prev, [team.id]: !getFavState(team.id) }))
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Input */}
      <div className="max-w-2xl w-full mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3">
          <span className="text-slate-400 shrink-0">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une équipe..."
            className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none"
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg shrink-0"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Résultats */}
      <div className="max-w-2xl w-full mx-auto px-4 overflow-y-auto flex-1 pb-8">
        {debouncedQuery.length >= 2 && results.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-8">
            Aucune équipe trouvée.{" "}
            {teams.length === 0 &&
              "Visite d'abord une compétition pour activer la recherche."}
          </p>
        )}

        {results.length > 0 && (
          <div className="space-y-2 mt-2">
            <p className="text-xs text-slate-500">{results.length} équipe(s)</p>
            {results.map((team) => {
              const fav = getFavState(team.id)
              return (
                <div
                  key={`${team.id}-${team.competitionCode}`}
                  className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
                >
                  {team.crest ? (
                    <div className="relative w-8 h-8 shrink-0">
                      <Image
                        src={team.crest}
                        alt={team.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {team.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {team.competitionName}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleToggle(team)}
                      className={`text-lg transition-colors ${
                        fav
                          ? "text-yellow-400"
                          : "text-slate-500 hover:text-yellow-400"
                      }`}
                    >
                      {fav ? "⭐" : "☆"}
                    </button>
                    <Link
                      href={`/competition/${team.competitionCode}`}
                      onClick={onClose}
                      className="text-xs text-teal-400 hover:text-teal-300 font-medium"
                    >
                      Voir →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!query && (
          <p className="text-slate-500 text-sm text-center py-8">
            {teams.length === 0
              ? "Visite une compétition pour activer la recherche d'équipes."
              : `${teams.length} équipe(s) disponible(s) — tape pour chercher`}
          </p>
        )}
      </div>
    </div>
  )
}
