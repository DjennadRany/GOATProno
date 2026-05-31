import Link from "next/link"
import type { SquadPlayer } from "@/domain/club"
import PlayerPhoto from "./PlayerPhoto"

interface PlayerCardProps {
  player: SquadPlayer
}

const POSITION_LABEL: Record<string, string> = {
  Goalkeeper: "Gardien",
  Defence: "Défenseur",
  Midfield: "Milieu",
  Offence: "Attaquant",
  Coach: "Entraîneur",
}

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link
      href={`/player/${player.id}`}
      className="flex items-center gap-3 bg-slate-900 rounded-xl p-3 hover:bg-slate-700 transition-colors"
    >
      <PlayerPhoto playerName={player.name} size={40} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{player.name}</p>
        <p className="text-xs text-slate-400">
          {POSITION_LABEL[player.position] ?? player.position}
          {player.nationality ? ` · ${player.nationality}` : ""}
        </p>
      </div>
      {player.shirtNumber != null && (
        <span className="text-xs font-bold text-teal-400 bg-teal-900/30 rounded-lg w-7 h-7 flex items-center justify-center shrink-0">
          {player.shirtNumber}
        </span>
      )}
    </Link>
  )
}
