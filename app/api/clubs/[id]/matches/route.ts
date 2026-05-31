export const revalidate = 300

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const token = process.env.FOOTBALL_DATA_TOKEN
  if (!token) return Response.json({ matches: [] })

  try {
    const res = await fetch(
      `https://api.football-data.org/v4/teams/${id}/matches?status=SCHEDULED,IN_PLAY,FINISHED&limit=10`,
      { headers: { "X-Auth-Token": token } }
    )
    if (!res.ok) return Response.json({ matches: [] })
    return Response.json(await res.json())
  } catch {
    return Response.json({ matches: [] })
  }
}
