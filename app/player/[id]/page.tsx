"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ExternalLink } from "lucide-react"
import type { PlayerInfo } from "@/domain/player"
import PlayerPhoto from "@/components/PlayerPhoto"
import LoadingState from "@/components/LoadingState"
import ErrorState from "@/components/ErrorState"

function age(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
}

const POSITION_LABEL: Record<string, string> = {
  Goalkeeper: "Gardien",
  Defence: "Défenseur",
  Midfield: "Milieu",
  Offence: "Attaquant",
}

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [player, setPlayer] = useState<PlayerInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/players/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() as Promise<PlayerInfo> })
      .then((data) => { setPlayer(data); setLoading(false) })
      .catch(() => { setError("Impossible de charger ce joueur."); setLoading(false) })
  }, [id])

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => window.history.back()} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm text-slate-300 font-medium truncate">{player?.name ?? "Joueur"}</span>
        </div>
      </div>

      {loading && <div className="max-w-2xl mx-auto px-4 py-6"><LoadingState /></div>}
      {!loading && (error || !player) && (
        <div className="max-w-2xl mx-auto px-4 py-6">
          <ErrorState message={error ?? "Joueur introuvable"} onRetry={() => window.location.reload()} />
        </div>
      )}

      {!loading && player && (
        <>
          <div className="bg-gradient-to-b from-slate-700 to-slate-800 py-10 border-b border-slate-700">
            <div className="max-w-2xl mx-auto px-4 flex items-center gap-6">
              <PlayerPhoto playerName={player.name} size={96} />
              <div>
                <h1 className="text-2xl font-bold text-white">{player.name}</h1>
                {player.currentTeam && (
                  <Link href={`/club/${player.currentTeam.id}`} className="flex items-center gap-2 mt-2 hover:opacity-80 transition-opacity">
                    {player.currentTeam.crest && (
                      <div className="relative w-5 h-5">
                        <Image src={player.currentTeam.crest} alt={player.currentTeam.name} fill className="object-contain" unoptimized />
                      </div>
                    )}
                    <span className="text-sm text-teal-400 font-medium">{player.currentTeam.name}</span>
                    <ExternalLink size={12} className="text-slate-500" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 divide-y divide-slate-700">
              {player.position && (
                <div className="flex justify-between px-4 py-3">
                  <span className="text-sm text-slate-400">Poste</span>
                  <span className="text-sm text-white font-medium">{POSITION_LABEL[player.position] ?? player.position}</span>
                </div>
              )}
              {player.nationality && (
                <div className="flex justify-between px-4 py-3">
                  <span className="text-sm text-slate-400">Nationalité</span>
                  <span className="text-sm text-white font-medium">{player.nationality}</span>
                </div>
              )}
              {player.dateOfBirth && (
                <div className="flex justify-between px-4 py-3">
                  <span className="text-sm text-slate-400">Âge</span>
                  <span className="text-sm text-white font-medium">
                    {age(player.dateOfBirth)} ans · {new Date(player.dateOfBirth).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              )}
              {player.shirtNumber != null && (
                <div className="flex justify-between px-4 py-3">
                  <span className="text-sm text-slate-400">Numéro</span>
                  <span className="text-sm text-white font-medium">#{player.shirtNumber}</span>
                </div>
              )}
              {player.currentTeam?.contractUntilDate && (
                <div className="flex justify-between px-4 py-3">
                  <span className="text-sm text-slate-400">Contrat jusqu&apos;au</span>
                  <span className="text-sm text-white font-medium">
                    {new Date(player.currentTeam.contractUntilDate).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 text-center">
              Stats détaillées disponibles avec un abonnement API premium.
            </p>
          </main>
        </>
      )}
    </div>
  )
}
