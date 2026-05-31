export interface StandingRow {
  position: number
  team: { id: number; name: string; crest: string }
  playedGames: number
  won: number
  draw: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string | null
}

export interface Standing {
  stage: string
  type: string
  group: string | null
  table: StandingRow[]
}
