import type { Match } from "@/domain/match"
import Image from "next/image"

interface BracketViewProps {
  matches: Match[]
}

const STAGE_ORDER = [
  "GROUP_STAGE", "LEAGUE_PHASE", "PLAYOFF_ROUND_ONE", "PLAYOFF_ROUND_TWO",
  "ROUND_OF_128", "ROUND_OF_64", "ROUND_OF_32", "ROUND_OF_16", "LAST_16",
  "QUARTER_FINALS", "SEMI_FINALS", "THIRD_PLACE", "FINAL",
]

const STAGE_LABEL: Record<string, string> = {
  GROUP_STAGE: "Phase de groupes",
  LEAGUE_PHASE: "Phase de ligue",
  PLAYOFF_ROUND_ONE: "Barrages (1er tour)",
  PLAYOFF_ROUND_TWO: "Barrages (2e tour)",
  ROUND_OF_128: "Tour préliminaire",
  ROUND_OF_64: "64e de finale",
  ROUND_OF_32: "32e de finale",
  ROUND_OF_16: "16e de finale",
  LAST_16: "Huitièmes de finale",
  QUARTER_FINALS: "Quarts de finale",
  SEMI_FINALS: "Demi-finales",
  THIRD_PLACE: "Match pour la 3e place",
  FINAL: "Finale",
}

function MatchNode({ match }: { match: Match }) {
  const finished = match.status === "FINISHED"
  const live = match.status === "IN_PLAY" || match.status === "PAUSED"
  const isPen = match.score.duration === "PENALTY_SHOOTOUT"
  const isET = match.score.duration === "EXTRA_TIME"
  const homeUnknown = !match.homeTeam.name || match.homeTeam.name === "TBD"
  const awayUnknown = !match.awayTeam.name || match.awayTeam.name === "TBD"

  if (homeUnknown && awayUnknown) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 w-full">
        <p className="text-xs text-slate-600 text-center">À déterminer</p>
      </div>
    )
  }

  return (
    <div className={`bg-slate-900 border rounded-xl p-3 w-full ${
      match.stage === "FINAL" ? "border-yellow-600/60" : finished ? "border-slate-600" : "border-slate-700"
    }`}>
      {[match.homeTeam, match.awayTeam].map((team, idx) => {
        const ft = idx === 0 ? match.score.fullTime.home : match.score.fullTime.away
        const reg = idx === 0 ? match.score.regularTime?.home : match.score.regularTime?.away
        const displayScore = isPen && reg !== undefined ? reg : ft
        const name = team.name || "À déterminer"

        return (
          <div key={`${match.id}-${idx}`} className={`flex items-center justify-between gap-2 ${idx === 0 ? "mb-1.5" : ""}`}>
            <div className="flex items-center gap-2 min-w-0">
              {team.crest && (
                <div className="relative w-5 h-5 shrink-0">
                  <Image src={team.crest} alt={name} fill className="object-contain" unoptimized />
                </div>
              )}
              <span className={`text-xs truncate ${!team.name ? "text-slate-500 italic" : "text-white"}`}>{name}</span>
            </div>
            {(finished || live) && displayScore !== null && (
              <span className={`text-sm font-bold shrink-0 ${live ? "text-green-400" : "text-white"}`}>
                {displayScore}
              </span>
            )}
          </div>
        )
      })}

      {finished && (isPen || isET) && (
        <div className="mt-1.5 text-center">
          {isPen && match.score.penalties && (
            <span className="text-xs text-yellow-400">
              t.a.b. {match.score.penalties.home} – {match.score.penalties.away}
            </span>
          )}
          {isET && !isPen && (
            <span className="text-xs text-slate-400">a.p.</span>
          )}
        </div>
      )}
    </div>
  )
}

export default function BracketView({ matches }: BracketViewProps) {
  const grouped = matches.reduce<Record<string, Match[]>>((acc, m) => {
    acc[m.stage] = [...(acc[m.stage] ?? []), m]
    return acc
  }, {})

  const stages = Object.keys(grouped).sort(
    (a, b) => STAGE_ORDER.indexOf(a) - STAGE_ORDER.indexOf(b)
  )

  if (stages.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-8">Le bracket n&apos;est pas encore disponible.</p>
  }

  return (
    <div className="space-y-6">
      {stages.map((stage) => (
        <section key={stage}>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {STAGE_LABEL[stage] ?? stage.replace(/_/g, " ")}
          </h3>
          {stage === "GROUP_STAGE" || stage === "LEAGUE_PHASE" ? (
            (() => {
              const byGroup = grouped[stage].reduce<Record<string, Match[]>>((acc, m) => {
                const g = m.group ?? "—"
                acc[g] = [...(acc[g] ?? []), m]
                return acc
              }, {})
              return (
                <div className="space-y-4">
                  {Object.entries(byGroup).map(([group, gMatches]) => (
                    <div key={group}>
                      {group !== "—" && <p className="text-xs text-slate-500 mb-2">{group}</p>}
                      <div className="space-y-2">
                        {gMatches.map((m) => <MatchNode key={m.id} match={m} />)}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {grouped[stage].map((m) => <MatchNode key={m.id} match={m} />)}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
