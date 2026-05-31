import { describe, it, expect } from "vitest"
import { calculatePredictionPoints } from "./scoring"
import type { Prediction } from "./prediction"
import type { Match } from "./match"

function pred(h: number, a: number): Prediction {
  return {
    matchId: 1,
    homeTeam: "A",
    awayTeam: "B",
    predictedHomeScore: h,
    predictedAwayScore: a,
    createdAt: "",
  }
}

function match(h: number | null, a: number | null): Match {
  return {
    id: 1,
    utcDate: "2026-06-10T15:00:00Z",
    status: h === null ? "SCHEDULED" : "FINISHED",
    stage: "GROUP_STAGE",
    group: null,
    homeTeam: { id: 1, name: "A", crest: "" },
    awayTeam: { id: 2, name: "B", crest: "" },
    score: {
      fullTime: { home: h, away: a },
      halfTime: { home: null, away: null },
    },
    competition: { name: "FIFA World Cup", emblem: "" },
  }
}

describe("calculatePredictionPoints", () => {
  it("returns 0 when match not finished", () => {
    expect(calculatePredictionPoints(pred(2, 1), match(null, null))).toBe(0)
  })

  it("exact win score gives 8+3+2+1+1=15 points", () => {
    expect(calculatePredictionPoints(pred(2, 1), match(2, 1))).toBe(15)
  })

  it("exact draw score gives 8+4+1+1=14 points", () => {
    expect(calculatePredictionPoints(pred(1, 1), match(1, 1))).toBe(14)
  })

  it("correct winner only: 3 points", () => {
    expect(calculatePredictionPoints(pred(3, 1), match(1, 0))).toBe(3)
  })

  it("correct winner + correct away score: 4 points", () => {
    expect(calculatePredictionPoints(pred(2, 0), match(1, 0))).toBe(4)
  })

  it("correct draw (different scores): 4 points", () => {
    expect(calculatePredictionPoints(pred(0, 0), match(2, 2))).toBe(4)
  })

  it("correct goal diff (non-draw): 3+2=5 points", () => {
    expect(calculatePredictionPoints(pred(3, 1), match(2, 0))).toBe(5)
  })

  it("wrong prediction: 0 points", () => {
    expect(calculatePredictionPoints(pred(2, 0), match(0, 2))).toBe(0)
  })
})
