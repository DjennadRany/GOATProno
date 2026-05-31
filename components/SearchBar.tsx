"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, X, Star, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { isFavorite, toggleFavorite } from "@/services/favorites"
import type { FavoriteTeam } from "@/domain/favorite"

interface SearchResult {
  id: number
  name: string
  shortName: string
  crest: string
  competitionCode: string
  competitionName: string
}

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
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [favMap, setFavMap] = useState<Record<number, boolean>>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 350)

  // Fermer en cliquant dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setFocused(false); inputRef.current?.blur() }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  // Recherche API
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    fetch(`/api/search/teams?q=${encodeURIComponent(debouncedQuery.trim())}`)
      .then((r) => r.json())
      .then((data: { teams: SearchResult[] }) => {
        setResults(data.teams ?? [])
        setSearching(false)
      })
      .catch(() => setSearching(false))
  }, [debouncedQuery])

  const getFavState = useCallback((teamId: number) =>
    teamId in favMap ? favMap[teamId] : isFavorite(teamId), [favMap])

  const handleToggle = (team: SearchResult) => {
    const favTeam: FavoriteTeam = {
      teamId: team.id,
      teamName: team.name,
      crest: team.crest,
      competitionCode: team.competitionCode,
      competitionName: team.competitionName,
    }
    toggleFavorite(favTeam)
    setFavMap((prev) => ({ ...prev, [team.id]: !getFavState(team.id) }))
  }

  const showDropdown = focused && query.trim().length >= 2

  return (
    <div ref={containerRef} className="relative bg-slate-800 border-b border-slate-700">
      <div className="max-w-2xl mx-auto px-4 py-2">
        <div className={`flex items-center gap-2 bg-slate-900 border rounded-xl px-3 py-2 transition-colors ${focused ? "border-teal-500" : "border-slate-600"}`}>
          {searching ? (
            <Loader2 size={16} className="text-teal-400 shrink-0 animate-spin" />
          ) : (
            <Search size={16} className="text-slate-400 shrink-0" />
          )}
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
            <button onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus() }} className="text-slate-500 hover:text-white shrink-0">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 bg-slate-800 border-b border-slate-700 shadow-xl max-h-72 overflow-y-auto z-20">
          <div className="max-w-2xl mx-auto px-4 py-2 space-y-1">
            {searching && (
              <p className="text-slate-500 text-xs text-center py-3">Recherche en cours…</p>
            )}

            {!searching && results.length === 0 && debouncedQuery.trim().length >= 2 && (
              <p className="text-slate-400 text-sm text-center py-4">Aucune équipe trouvée pour &ldquo;{debouncedQuery}&rdquo;</p>
            )}

            {!searching && results.map((team) => {
              const fav = getFavState(team.id)
              return (
                <Link
                  key={`${team.id}-${team.competitionCode}`}
                  href={`/club/${team.id}`}
                  onClick={() => { setFocused(false); setQuery("") }}
                  className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  {team.crest ? (
                    <div className="relative w-7 h-7 shrink-0">
                      <Image src={team.crest} alt={team.name} fill className="object-contain" unoptimized />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-600 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{team.name}</p>
                    <p className="text-xs text-slate-400 truncate">{team.competitionName}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleToggle(team)
                    }}
                    className={`transition-colors ${fav ? "text-yellow-400" : "text-slate-500 hover:text-yellow-400"}`}
                  >
                    <Star size={15} fill={fav ? "currentColor" : "none"} />
                  </button>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
