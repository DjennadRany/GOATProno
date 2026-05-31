export function formatMatchDate(utcDate: string): string {
  return new Date(utcDate).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  })
}

export function isMatchLocked(match: { utcDate: string; status: string }): boolean {
  if (!["SCHEDULED", "TIMED"].includes(match.status)) return true
  return new Date(match.utcDate) <= new Date()
}
