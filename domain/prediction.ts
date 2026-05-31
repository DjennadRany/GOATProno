export interface Prediction {
  matchId: number
  homeTeam: string
  awayTeam: string
  predictedHomeScore: number
  predictedAwayScore: number
  createdAt: string
  competitionCode?: string
}
