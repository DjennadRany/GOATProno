"use client"

import Image from "next/image"

interface Player {
  id: number
  name: string
  position: string
  shirt: number
  crest?: string
}

interface FieldViewProps {
  teamName: string
  players: Player[]
}

// Positions pré-définies sur le terrain (en pourcentage)
const FORMATIONS = {
  "4-4-2": [
    { row: 90, cols: [50] }, // GK
    { row: 70, cols: [15, 35, 65, 85] }, // Défense
    { row: 45, cols: [20, 40, 60, 80] }, // Milieu
    { row: 15, cols: [35, 65] }, // Attaque
  ],
  "4-3-3": [
    { row: 90, cols: [50] }, // GK
    { row: 70, cols: [15, 35, 65, 85] }, // Défense
    { row: 45, cols: [30, 50, 70] }, // Milieu
    { row: 15, cols: [25, 50, 75] }, // Attaque
  ],
  "3-5-2": [
    { row: 90, cols: [50] }, // GK
    { row: 70, cols: [25, 50, 75] }, // Défense
    { row: 45, cols: [15, 35, 50, 65, 85] }, // Milieu
    { row: 15, cols: [35, 65] }, // Attaque
  ],
}

export default function FieldView({ teamName, players }: FieldViewProps) {
  const playersByPosition = {
    GK: players.filter((p) => p.position === "GK"),
    DEF: players.filter((p) => p.position === "DEF"),
    MID: players.filter((p) => p.position === "MID"),
    FWD: players.filter((p) => p.position === "FWD"),
  }

  const defCount = playersByPosition.DEF.length || 4
  const midCount = playersByPosition.MID.length || 4
  const fwdCount = playersByPosition.FWD.length || 2

  // Sélectionner la formation
  let formation = "4-4-2"
  if (defCount === 3) formation = "3-5-2"
  else if (fwdCount === 3) formation = "4-3-3"

  const positions = FORMATIONS[formation as keyof typeof FORMATIONS]
  let playerIndex = 0
  const playerPositions: Array<{ player: Player; x: number; y: number }> = []

  positions.forEach((row) => {
    row.cols.forEach((col) => {
      const allPlayers = [
        ...playersByPosition.GK,
        ...playersByPosition.DEF,
        ...playersByPosition.MID,
        ...playersByPosition.FWD,
      ]
      if (playerIndex < allPlayers.length) {
        playerPositions.push({
          player: allPlayers[playerIndex],
          x: col,
          y: row,
        })
        playerIndex++
      }
    })
  })

  return (
    <div className="w-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-6 space-y-6">
      <h3 className="text-lg font-bold text-white text-center">{teamName} - Formation {formation}</h3>

      {/* Terrain */}
      <div className="relative bg-gradient-to-b from-emerald-700 to-emerald-800 aspect-[2/3] rounded-lg border-4 border-white shadow-2xl overflow-hidden">
        {/* Lignes du terrain */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Ligne médiane */}
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="white" strokeWidth="2" opacity="0.3" />
          {/* Cercle du centre */}
          <circle cx="50%" cy="50%" r="15%" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
          {/* Zones de but */}
          <rect x="30%" y="2%" width="40%" height="15%" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
          <rect x="30%" y="83%" width="40%" height="15%" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
        </svg>

        {/* Joueurs */}
        {playerPositions.map((item, idx) => (
          <div
            key={idx}
            className="absolute flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
          >
            {/* Jersey */}
            <div className="relative w-10 h-10 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
              {item.player.crest ? (
                <Image
                  src={item.player.crest}
                  alt={item.player.name}
                  fill
                  className="rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-white font-bold text-xs">{item.player.shirt}</span>
              )}
            </div>
            {/* Infos */}
            <div className="text-center">
              <p className="text-xs font-bold text-white bg-black/50 px-2 py-0.5 rounded whitespace-nowrap">
                {item.player.shirt}
              </p>
              <p className="text-xs text-slate-300 truncate max-w-[60px]">{item.player.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legende */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-slate-400 font-semibold mb-2">Défense ({defCount})</p>
          <div className="space-y-1">
            {playersByPosition.DEF.slice(0, 4).map((p) => (
              <p key={p.id} className="text-slate-300">
                #{p.shirt} {p.name}
              </p>
            ))}
          </div>
        </div>
        <div>
          <p className="text-slate-400 font-semibold mb-2">Milieu ({midCount})</p>
          <div className="space-y-1">
            {playersByPosition.MID.slice(0, 4).map((p) => (
              <p key={p.id} className="text-slate-300">
                #{p.shirt} {p.name}
              </p>
            ))}
          </div>
        </div>
        <div>
          <p className="text-slate-400 font-semibold mb-2">Attaque ({fwdCount})</p>
          <div className="space-y-1">
            {playersByPosition.FWD.slice(0, 2).map((p) => (
              <p key={p.id} className="text-slate-300">
                #{p.shirt} {p.name}
              </p>
            ))}
          </div>
        </div>
        <div>
          <p className="text-slate-400 font-semibold mb-2">Gardien</p>
          <div className="space-y-1">
            {playersByPosition.GK.map((p) => (
              <p key={p.id} className="text-slate-300">
                #{p.shirt} {p.name}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
