export interface SquadPlayer {
  id: number
  name: string
  position: string
  dateOfBirth?: string
  nationality?: string
  shirtNumber?: number | null
}

export interface ClubInfo {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
  address?: string
  website?: string
  founded?: number
  clubColors?: string
  venue?: string
  area: { name: string; flag?: string }
  squad: SquadPlayer[]
}
