export const revalidate = 3600

async function enrichShirtNumbers<T extends { id: number; shirtNumber?: number | null }>(
  squad: T[],
  token: string
): Promise<T[]> {
  const missing = squad.filter((p) => p.shirtNumber == null)
  if (missing.length === 0) return squad

  const details = await Promise.all(
    missing.map(async (player) => {
      try {
        const res = await fetch(
          `https://api.football-data.org/v4/persons/${player.id}`,
          { headers: { "X-Auth-Token": token }, next: { revalidate: 86400 } }
        )
        if (!res.ok) return null
        const data = (await res.json()) as { shirtNumber?: number | null }
        return { id: player.id, shirtNumber: data.shirtNumber ?? null }
      } catch {
        return null
      }
    })
  )

  const shirtMap = new Map(
    details.filter((d): d is { id: number; shirtNumber: number | null } => d != null)
      .map((d) => [d.id, d.shirtNumber])
  )

  return squad.map((p) =>
    p.shirtNumber != null ? p : { ...p, shirtNumber: shirtMap.get(p.id) ?? p.shirtNumber }
  )
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const token = process.env.FOOTBALL_DATA_TOKEN
  if (!token) return Response.json({ error: "No token" }, { status: 500 })

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/teams/${id}`,
      { headers: { "X-Auth-Token": token } }
    )
    if (!res.ok) return Response.json({ error: `API ${res.status}` }, { status: res.status })
    const data = (await res.json()) as { squad?: { id: number; shirtNumber?: number | null }[] }
    if (data.squad?.length) {
      data.squad = await enrichShirtNumbers(data.squad, token)
    }
    return Response.json(data)
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 })
  }
}
