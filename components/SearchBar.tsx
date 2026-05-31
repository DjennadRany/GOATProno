"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useTeams, type TeamWithComp } from "@/context/TeamsContext"
import { isFavorite, toggleFavorite } from "@/services/favorites"

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [favMap, setFavMap] = useState<Record<number, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)
  const { teams } = useTeams()

  // Fermer quand on clique en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFocused(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const results: TeamWithComp[] =
    debouncedQuery.trim().length >= 2
      ? teams
          .filter(
            (t) =>
              t.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
              t.shortName?.toLowerCase().includes(debouncedQuery.toLowerCase())
          )
          .slice(0, 10)
      : []

  const showDropdown = focused && (debouncedQuery.length >= 2 || teams.length > 0)

  const getFavState = (teamId: number) =>
    teamId in favMap ? favMap[teamId] : isFavorite(teamId)

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
    <div ref={containerRef} className="relative bg-slate-800 border-b border-slate-700">
      <div className="max-w-2xl mx-auto px-4 py-2">
        <div
          className={`flex items-center gap-2 bg-slate-900 border rounded-xl px-3 py-2 transition-colors ${
            focused ? "border-teal-500" : "border-slate-600"
          }`}
        >
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Rechercher une équipe…"
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("")
                inputRef.current?.focus()
              }}
              className="text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown résultats */}
      {showDropdown && (
        <div className="absolute left-0 right-0 bg-slate-800 border-b border-slate-700 shadow-xl max-h-80 overflow-y-auto z-20">
          <div className="max-w-2xl mx-auto px-4 py-2 space-y-1">
            {debouncedQuery.length >= 2 && results.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">
                Aucune équipe trouvée.{" "}
                {teams.length === 0 && (
                  <span className="block text-xs mt-1 text-slate-500">
                    Visite une compétition pour activer la recherche.
                  </span>
                )}
              </p>
            )}

            {!debouncedQuery && teams.length > 0 && (
              <p className="text-xs text-slate-500 py-2">
                {teams.length} équipe(s) disponible(s) — tape pour chercher
              </p>
            )}

            {results.map((team) => {
              const fav = getFavState(team.id)
              return (
                <div
                  key={`${team.id}-${team.competitionCode}`}
                  className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  {team.crest ? (
                    <div className="relative w-7 h-7 shrink-0">
                      <Image
                        src={team.crest}
                        alt={team.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-600 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{team.name}</p>
                    <p className="text-xs text-slate-400 truncate">{team.competitionName}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(team)}
                      className={`transition-colors ${
                        fav ? "text-yellow-400" : "text-slate-500 hover:text-yellow-400"
                      }`}
                    >
                      <Star size={15} fill={fav ? "currentColor" : "none"} />
                    </button>
                    <Link
                      href={`/competition/${team.competitionCode}`}
                      onClick={() => { setFocused(false); setQuery("") }}
                      className="text-teal-400 hover:text-teal-300"
                    >
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
