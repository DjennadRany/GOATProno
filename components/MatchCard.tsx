"use client"

import Image from "next/image"
import Link from "next/link"
import type { Match } from "@/domain/match"
import { formatMatchDate } from "@/lib/formatDate"
import PredictionForm from "./PredictionForm"
import FavoriteButton from "./FavoriteButton"

function ScoreDisplay({ score }: { score: Match["score"] }) {
  const { duration, fullTime, regularTime, penalties } = score

  if (duration === "PENALTY_SHOOTOUT" && penalties) {
    // Score réel = regularTime (ou fullTime si regularTime absent)
    const regHome = regularTime?.home ?? fullTime.home
    const regAway = regularTime?.away ?? fullTime.away
    return (
      <div className="text-center">
        <span className="text-2xl font-bold text-white tabular-nums">
          {regHome} – {regAway}
        </span>
        <div className="text-xs text-yellow-400 font-semibold mt-0.5">
          t.a.b. {penalties.home} – {penalties.away}
        </div>
      </div>
    )
  }

  if (duration === "EXTRA_TIME") {
    return (
      <div className="text-center">
        <span className="text-2xl font-bold text-white tabular-nums">
          {fullTime.home} – {fullTime.away}
        </span>
        <div className="text-xs text-slate-400 mt-0.5">a.p.</div>
      </div>
    )
  }

  return (
    <span className="text-2xl font-bold text-white tabular-nums">
      {fullTime.home} – {fullTime.away}
    </span>
  )
}

interface MatchCardProps {
  match: Match
  onPredictionSaved: () => void
  isFavoriteMatch?: boolean
  competitionCode?: string
  competitionName?: string
}

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: "Programmé",
  TIMED: "Programmé",
  IN_PLAY: "🔴 En direct",
  PAUSED: "⏸ Pause",
  FINISHED: "Terminé",
  POSTPONED: "Reporté",
  CANCELLED: "Annulé",
  SUSPENDED: "Suspendu",
}

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: "text-slate-400",
  TIMED: "text-slate-400",
  IN_PLAY: "text-green-400 animate-pulse",
  PAUSED: "text-yellow-400",
  FINISHED: "text-blue-400",
  POSTPONED: "text-orange-400",
  CANCELLED: "text-red-400",
  SUSPENDED: "text-red-400",
}

function TeamCrest({ src, name, teamId }: { src: string; name: string; teamId: number }) {
  const img = src ? (
    <div className="relative w-10 h-10">
      <Image src={src} alt={name} fill className="object-contain" unoptimized />
    </div>
  ) : (
    <div className="w-10 h-10 rounded-full bg-slate-700" />
  )
  return (
    <Link href={`/club/${teamId}`} onClick={(e) => e.stopPropagation()}>
      {img}
    </Link>
  )
}

export default function MatchCard({
  match,
  onPredictionSaved,
  isFavoriteMatch = false,
  competitionCode = "",
  competitionName = "",
}: MatchCardProps) {
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED"
  const isFinished = match.status === "FINISHED"
  const showScore =
    (isLive || isFinished) &&
    match.score.fullTime.home !== null &&
    match.score.fullTime.away !== null

  return (
    <article
      className={`rounded-xl p-4 border transition-colors ${
        isFavoriteMatch
          ? "bg-slate-800 border-teal-700"
          : "bg-slate-800 border-slate-700"
      }`}
    >
      {/* Meta */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400 truncate flex items-center gap-1">
          {isFavoriteMatch && <span className="text-yellow-400">⭐</span>}
          {match.stage.replace(/_/g, " ")}
          {match.group ? ` · ${match.group}` : ""}
        </span>
        <span
          className={`text-xs font-medium ml-2 shrink-0 ${
            STATUS_COLOR[match.status] ?? "text-slate-400"
          }`}
        >
          {STATUS_LABEL[match.status] ?? match.status}
        </span>
      </div>

      {/* Équipes */}
      <div className="flex items-center justify-between gap-2">
        {/* Domicile */}
        <div className="flex flex-col items-center gap-1 flex-1">
          <div className="relative">
            <TeamCrest src={match.homeTeam.crest} name={match.homeTeam.name} teamId={match.homeTeam.id} />
            <div className="absolute -top-1 -right-1">
              <FavoriteButton
                team={{
                  teamId: match.homeTeam.id,
                  teamName: match.homeTeam.name,
                  crest: match.homeTeam.crest,
                  competitionCode,
                  competitionName,
                }}
              />
            </div>
          </div>
          <span className="text-sm font-semibold text-center leading-tight line-clamp-2">
            {match.homeTeam.name}
          </span>
        </div>

        {/* Centre */}
        <div className="flex flex-col items-center min-w-[80px]">
          {showScore ? (
            <ScoreDisplay score={match.score} />
          ) : (
            <>
              <span className="text-xs text-slate-400 text-center leading-tight">
                {formatMatchDate(match.utcDate)}
              </span>
              <span className="text-lg font-bold text-slate-500 mt-1">VS</span>
            </>
          )}
        </div>

        {/* Extérieur */}
        <div className="flex flex-col items-center gap-1 flex-1">
          <div className="relative">
            <TeamCrest src={match.awayTeam.crest} name={match.awayTeam.name} teamId={match.awayTeam.id} />
            <div className="absolute -top-1 -right-1">
              <FavoriteButton
                team={{
                  teamId: match.awayTeam.id,
                  teamName: match.awayTeam.name,
                  crest: match.awayTeam.crest,
                  competitionCode,
                  competitionName,
                }}
              />
            </div>
          </div>
          <span className="text-sm font-semibold text-center leading-tight line-clamp-2">
            {match.awayTeam.name}
          </span>
        </div>
      </div>

      {/* Pronostic */}
      <PredictionForm match={match} onSaved={onPredictionSaved} />
    </article>
  )
}
