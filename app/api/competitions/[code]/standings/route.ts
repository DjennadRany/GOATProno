export const revalidate = 3600

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> }
) {
  const { code } = await ctx.params
  const token = process.env.FOOTBALL_DATA_TOKEN
  if (!token) return Response.json({ standings: [] })

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/competitions/${code}/standings`,
      { headers: { "X-Auth-Token": token } }
    )
    if (!res.ok) return Response.json({ standings: [] })
    return Response.json(await res.json())
  } catch {
    return Response.json({ standings: [] })
  }
}
