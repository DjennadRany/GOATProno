export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED"
  | "SUSPENDED"

export type MatchDuration =
  | "REGULAR"
  | "EXTRA_TIME"
  | "PENALTY_SHOOTOUT"
  | null

export interface Team {
  id: number
  name: string
  crest: string
}

export interface Score {
  home: number | null
  away: number | null
}

export interface Match {
  id: number
  utcDate: string
  status: MatchStatus
  stage: string
  group: string | null
  homeTeam: Team
  awayTeam: Team
  score: {
    winner?: string | null
    duration?: MatchDuration
    fullTime: Score
    halfTime: Score
    regularTime?: Score | null
    extraTime?: Score | null
    penalties?: Score | null
  }
  competition: {
    name: string
    emblem: string
  }
}

export interface ApiMeta {
  requestsAvailable: string | null
  requestCounterReset: string | null
}
