import type { Prediction } from "./prediction"
import type { Match } from "./match"

export function calculatePredictionPoints(
  prediction: Prediction,
  match: Match
): number {
  const { home: ah, away: aa } = match.score.fullTime
  if (ah === null || aa === null) return 0

  const { predictedHomeScore: ph, predictedAwayScore: pa } = prediction
  let points = 0

  // Score exact
  if (ph === ah && pa === aa) points += 8

  // Bon match nul ou bon vainqueur
  if (ph === pa && ah === aa) {
    points += 4
  } else if (ph !== pa && Math.sign(ph - pa) === Math.sign(ah - aa)) {
    points += 3
  }

  // Bon écart de buts (non nul seulement)
  if (ph !== pa && ph - pa === ah - aa) points += 2

  // Scores individuels
  if (ph === ah) points += 1
  if (pa === aa) points += 1

  return points
}
