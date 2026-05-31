import type { Match, ApiMeta } from "@/domain/match"
import { COMPETITIONS } from "@/domain/competition"

export const revalidate = 300

const FUTURE = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString()

function getMockMatches(code: string): Match[] {
  const comp = COMPETITIONS.find((c) => c.code === code)
  if (!comp) return []
  return [
    {
      id: 90001,
      utcDate: FUTURE,
      status: "SCHEDULED",
      stage: "GROUP_STAGE",
      group: "Group A",
      homeTeam: { id: 1, name: "Équipe A", crest: "" },
      awayTeam: { id: 2, name: "Équipe B", crest: "" },
      score: {
        fullTime: { home: null, away: null },
        halfTime: { home: null, away: null },
      },
      competition: { name: comp.name, emblem: comp.emblem },
    },
  ]
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params
  const token = process.env.FOOTBALL_DATA_TOKEN

  if (!token) {
    return Response.json({
      matches: getMockMatches(code),
      meta: { requestsAvailable: null, requestCounterReset: null },
      fallback: true,
    })
  }

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${code}/matches`,
      { headers: { "X-Auth-Token": token } }
    )

    const meta: ApiMeta = {
      requestsAvailable: res.headers.get("X-RequestsAvailable"),
      requestCounterReset: res.headers.get("X-RequestCounter-Reset"),
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return Response.json({
        matches: getMockMatches(code),
        meta,
        error: (body as { message?: string }).message ?? `Erreur API ${res.status}`,
        fallback: true,
      })
    }

    const data = (await res.json()) as { matches?: Match[] }
    const matches = data.matches ?? []

    if (matches.length === 0) {
      return Response.json({ matches: getMockMatches(code), meta, fallback: true })
    }

    return Response.json({ matches, meta })
  } catch {
    return Response.json({
      matches: getMockMatches(code),
      meta: { requestsAvailable: null, requestCounterReset: null },
      fallback: true,
    })
  }
}
