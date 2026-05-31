export const revalidate = 3600

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
    return Response.json(await res.json())
  } catch {
    return Response.json({ error: "Failed" }, { status: 500 })
  }
}
