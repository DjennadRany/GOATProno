export const revalidate = 86400

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params
  const token = process.env.FOOTBALL_DATA_TOKEN

  if (!token) return Response.json({ teams: [] })

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${code}/teams`,
      { headers: { "X-Auth-Token": token } }
    )
    if (!res.ok) return Response.json({ teams: [] })

    const data = (await res.json()) as {
      teams?: Array<{ id: number; name: string; shortName: string; crest: string }>
    }
    return Response.json({ teams: data.teams ?? [] })
  } catch {
    return Response.json({ teams: [] })
  }
}
