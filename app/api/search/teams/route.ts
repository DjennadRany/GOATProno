import { COMPETITIONS } from "@/domain/competition"

interface TeamResult {
  id: number
  name: string
  shortName: string
  crest: string
  competitionCode: string
  competitionName: string
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.toLowerCase().trim() ?? ""

  if (q.length < 2) return Response.json({ teams: [] })

  const token = process.env.FOOTBALL_DATA_TOKEN
  if (!token) return Response.json({ teams: [] })

  // Appels en parallèle — tous cachés 24h après le premier appel
  const settled = await Promise.allSettled(
    COMPETITIONS.map(async (comp) => {
      const res = await fetch(
        `https://api.football-data.org/v4/competitions/${comp.code}/teams`,
        {
          headers: { "X-Auth-Token": token },
          next: { revalidate: 86400 },
        }
      )
      if (!res.ok) return [] as TeamResult[]

      const data = (await res.json()) as {
        teams?: Array<{ id: number; name: string; shortName: string; crest: string }>
      }

      return (data.teams ?? [])
        .filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            (t.shortName ?? "").toLowerCase().includes(q)
        )
        .map((t) => ({
          ...t,
          competitionCode: comp.code,
          competitionName: comp.name,
        }))
    })
  )

  const teams: TeamResult[] = settled
    .filter(
      (r): r is PromiseFulfilledResult<TeamResult[]> => r.status === "fulfilled"
    )
    .flatMap((r) => r.value)
    .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i)
    .slice(0, 20)

  return Response.json({ teams })
}
