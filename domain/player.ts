export interface PlayerInfo {
  id: number
  name: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  nationality?: string
  position?: string
  shirtNumber?: number | null
  currentTeam?: {
    id: number
    name: string
    crest: string
    contractUntilDate?: string
  }
}
