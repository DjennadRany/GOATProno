import type { Prediction } from "@/domain/prediction"

const LS_KEY = "pronoArena_v1_predictions"

export function getAllPredictions(): Prediction[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Prediction[]) : []
  } catch {
    return []
  }
}

export function getPrediction(matchId: number): Prediction | null {
  return getAllPredictions().find((p) => p.matchId === matchId) ?? null
}

export function savePrediction(prediction: Prediction): void {
  const all = getAllPredictions()
  const idx = all.findIndex((p) => p.matchId === prediction.matchId)
  if (idx >= 0) {
    all[idx] = prediction
  } else {
    all.push(prediction)
  }
  localStorage.setItem(LS_KEY, JSON.stringify(all))
}
