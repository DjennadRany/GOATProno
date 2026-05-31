const CACHE_PREFIX = "pronoArena_wiki_"

function cacheKey(name: string): string {
  return `${CACHE_PREFIX}${name.toLowerCase().replace(/\s+/g, "_")}`
}

export async function getPlayerPhoto(playerName: string): Promise<string | null> {
  const key = cacheKey(playerName)

  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(key)
    if (cached !== null) return cached || null
  }

  try {
    const url =
      `https://en.wikipedia.org/w/api.php` +
      `?action=query&prop=pageimages&titles=${encodeURIComponent(playerName)}` +
      `&format=json&pithumbsize=250&origin=*`

    const res = await fetch(url)
    if (!res.ok) return null

    const data = (await res.json()) as {
      query?: { pages?: Record<string, { thumbnail?: { source: string } }> }
    }

    const pages = Object.values(data.query?.pages ?? {})
    const imageUrl = pages[0]?.thumbnail?.source ?? ""

    if (typeof window !== "undefined") {
      localStorage.setItem(key, imageUrl)
    }

    return imageUrl || null
  } catch {
    return null
  }
}
