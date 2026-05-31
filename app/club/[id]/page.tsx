"use client"

import { useState, useEffect, use } from "react"
import { ArrowLeft } from "lucide-react"
import type { ClubInfo, SquadPlayer } from "@/domain/club"
import ClubHero from "@/components/ClubHero"
import PlayerCard from "@/components/PlayerCard"
import LoadingState from "@/components/LoadingState"
import ErrorState from "@/components/ErrorState"
import FieldView from "@/components/FieldView"

const POSITION_GROUPS = [
  { key: "Goalkeeper", label: "Gardiens" },
  { key: "Defence", label: "Défenseurs" },
  { key: "Midfield", label: "Milieux" },
  { key: "Offence", label: "Attaquants" },
]

export default function ClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [club, setClub] = useState<ClubInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/clubs/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() as Promise<ClubInfo> })
      .then((data) => { setClub(data); setLoading(false) })
      .catch(() => { setError("Impossible de charger ce club."); setLoading(false) })
  }, [id])

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => window.history.back()} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm text-slate-300 font-medium truncate">{club?.name ?? "Club"}</span>
        </div>
      </div>

      {loading && <div className="max-w-2xl mx-auto px-4 py-6"><LoadingState /></div>}
      {!loading && (error || !club) && (
        <div className="max-w-2xl mx-auto px-4 py-6">
          <ErrorState message={error ?? "Club introuvable"} onRetry={() => window.location.reload()} />
        </div>
      )}

      {!loading && club && (
        <>
          <ClubHero club={club} />
          <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            {/* Terrain avec composition */}
            {club.squad && club.squad.length > 0 && (
              <FieldView
                teamName={club.name}
                players={club.squad.map((p: SquadPlayer) => ({
                  id: p.id,
                  name: p.name,
                  position: p.position === "Goalkeeper" ? "GK" : p.position === "Defence" ? "DEF" : p.position === "Midfield" ? "MID" : "FWD",
                  shirt: p.shirtNumber || 0,
                  crest: p.countryFlag,
                }))}
              />
            )}

            {POSITION_GROUPS.map(({ key, label }) => {
              const players = club.squad.filter((p: SquadPlayer) => p.position === key)
              if (players.length === 0) return null
              return (
                <section key={key}>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    {label} ({players.length})
                  </h2>
                  <div className="space-y-2">
                    {players.map((p: SquadPlayer) => <PlayerCard key={p.id} player={p} />)}
                  </div>
                </section>
              )
            })}

            {club.squad.filter((p: SquadPlayer) => !POSITION_GROUPS.map((g) => g.key).includes(p.position)).length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Staff</h2>
                <div className="space-y-2">
                  {club.squad
                    .filter((p: SquadPlayer) => !POSITION_GROUPS.map((g) => g.key).includes(p.position))
                    .map((p: SquadPlayer) => <PlayerCard key={p.id} player={p} />)}
                </div>
              </section>
            )}
          </main>
        </>
      )}
    </div>
  )
}
