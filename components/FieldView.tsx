"use client"

import PlayerPhoto from "@/components/PlayerPhoto"

interface Player {
  id: number
  name: string
  position: string
  shirt: number | null
}

interface FieldViewProps {
  teamName: string
  players: Player[]
}

// Positions pré-définies sur le terrain (en pourcentage)
const FORMATIONS = {
  "4-4-2": [
    { row: 85, cols: [50] }, // GK
    { row: 65, cols: [15, 35, 65, 85] }, // Défense
    { row: 45, cols: [20, 40, 60, 80] }, // Milieu
    { row: 20, cols: [35, 65] }, // Attaque
  ],
  "4-3-3": [
    { row: 85, cols: [50] }, // GK
    { row: 65, cols: [15, 35, 65, 85] }, // Défense
    { row: 45, cols: [30, 50, 70] }, // Milieu
    { row: 20, cols: [25, 50, 75] }, // Attaque
  ],
  "3-5-2": [
    { row: 85, cols: [50] }, // GK
    { row: 65, cols: [25, 50, 75] }, // Défense
    { row: 45, cols: [15, 35, 50, 65, 85] }, // Milieu
    { row: 20, cols: [35, 65] }, // Attaque
  ],
}

export default function FieldView({ teamName, players }: FieldViewProps) {
  if (!players || players.length === 0) {
    return <div className="text-center text-slate-400 py-8">Pas de joueurs disponibles</div>
  }

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

  // Placer les joueurs sur le terrain
  const allPlayers = [
    ...playersByPosition.GK,
    ...playersByPosition.DEF,
    ...playersByPosition.MID,
    ...playersByPosition.FWD,
  ]

  positions.forEach((formationRow) => {
    formationRow.cols.forEach((col) => {
      if (playerIndex < allPlayers.length) {
        playerPositions.push({
          player: allPlayers[playerIndex],
          x: col,
          y: formationRow.row,
        })
        playerIndex++
      }
    })
  })

  return (
    <div className="w-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-4 space-y-4">
      <h3 className="text-base font-bold text-white text-center">{teamName}</h3>
      <p className="text-xs text-slate-400 text-center">Formation {formation}</p>

      {/* Terrain */}
      <div className="relative bg-gradient-to-b from-emerald-700 to-emerald-800 aspect-[2/3] rounded-lg border-4 border-white shadow-2xl overflow-hidden">
        {/* Lignes du terrain */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Ligne médiane */}
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="2" opacity="0.4" />
          {/* Cercle du centre */}
          <circle cx="50%" cy="50%" r="12%" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />
          {/* Zones de but */}
          <rect x="30%" y="3%" width="40%" height="12%" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />
          <rect x="30%" y="85%" width="40%" height="12%" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />
          {/* Petites zones */}
          <rect x="35%" y="5%" width="30%" height="7%" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />
          <rect x="35%" y="88%" width="30%" height="7%" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />
        </svg>

        {/* Joueurs */}
        {playerPositions.map((item, idx) => {
          // clamp positions to keep players inside the visible pitch
          const clampedX = Math.min(95, Math.max(5, item.x))
          const clampedY = Math.min(92, Math.max(6, item.y))
          return (
          <div
            key={`${item.player.id}-${idx}`}
            className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${clampedX}%`, top: `${clampedY}%`, zIndex: 10 + idx }}
          >
            {/* Photo + numéro */}
            <div className="relative w-12 h-12">
              <PlayerPhoto
                playerName={item.player.name}
                size={48}
                className="border-2 border-white shadow-lg"
              />
              {item.player.shirt != null && (
                <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white">
                  {item.player.shirt}
                </span>
              )}
            </div>
            {/* Nom court */}
            <div className="mt-1 text-center">
              <p className="text-xs font-bold text-white bg-black/60 px-2 py-0.5 rounded whitespace-nowrap">
                {item.player.name.split(" ").pop()}
              </p>
            </div>
          </div>
          )
        })}
      </div>

      {/* Légende */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-700/50 rounded-lg p-3">
        <div>
          <p className="text-slate-300 font-bold mb-1">Défense ({defCount})</p>
          <div className="space-y-0.5 text-slate-300 text-xs">
            {playersByPosition.DEF.slice(0, 4).map((p) => (
              <p key={p.id} className="truncate">
                {p.shirt != null ? `#${p.shirt} ` : ""}{p.name}
              </p>
            ))}
          </div>
        </div>
        <div>
          <p className="text-slate-300 font-bold mb-1">Milieu ({midCount})</p>
          <div className="space-y-0.5 text-slate-300 text-xs">
            {playersByPosition.MID.slice(0, 5).map((p) => (
              <p key={p.id} className="truncate">
                {p.shirt != null ? `#${p.shirt} ` : ""}{p.name}
              </p>
            ))}
          </div>
        </div>
        <div>
          <p className="text-slate-300 font-bold mb-1">Attaque ({fwdCount})</p>
          <div className="space-y-0.5 text-slate-300 text-xs">
            {playersByPosition.FWD.slice(0, 3).map((p) => (
              <p key={p.id} className="truncate">
                {p.shirt != null ? `#${p.shirt} ` : ""}{p.name}
              </p>
            ))}
          </div>
        </div>
        <div>
          <p className="text-slate-300 font-bold mb-1">Gardien</p>
          <div className="space-y-0.5 text-slate-300 text-xs">
            {playersByPosition.GK.map((p) => (
              <p key={p.id} className="truncate">
                {p.shirt != null ? `#${p.shirt} ` : ""}{p.name}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
