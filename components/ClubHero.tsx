import Image from "next/image"
import type { ClubInfo } from "@/domain/club"

interface ClubHeroProps {
  club: ClubInfo
}

export default function ClubHero({ club }: ClubHeroProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4 bg-gradient-to-b from-slate-700 to-slate-800 border-b border-slate-700">
      {club.crest ? (
        <div className="relative w-28 h-28 drop-shadow-xl">
          <Image src={club.crest} alt={club.name} fill className="object-contain" unoptimized />
        </div>
      ) : (
        <div className="w-28 h-28 rounded-full bg-slate-600 flex items-center justify-center text-3xl font-bold text-white">
          {club.tla}
        </div>
      )}
      <div className="text-center px-4">
        <h1 className="text-2xl font-bold text-white">{club.name}</h1>
        <p className="text-slate-400 text-sm mt-1">
          {club.area.name}
          {club.venue ? ` · ${club.venue}` : ""}
          {club.founded ? ` · Fondé en ${club.founded}` : ""}
        </p>
        {club.clubColors && (
          <p className="text-xs text-slate-500 mt-0.5">{club.clubColors}</p>
        )}
      </div>
    </div>
  )
}
