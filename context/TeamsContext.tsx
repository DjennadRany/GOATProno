"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"

export interface TeamWithComp {
  id: number
  name: string
  shortName: string
  crest: string
  competitionCode: string
  competitionName: string
}

interface TeamsContextValue {
  teams: TeamWithComp[]
  addTeams: (
    competitionCode: string,
    competitionName: string,
    teams: Array<{ id: number; name: string; shortName: string; crest: string }>
  ) => void
}

const TeamsContext = createContext<TeamsContextValue>({
  teams: [],
  addTeams: () => {},
})

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<TeamWithComp[]>([])

  const addTeams = useCallback(
    (
      competitionCode: string,
      competitionName: string,
      newTeams: Array<{ id: number; name: string; shortName: string; crest: string }>
    ) => {
      setTeams((prev) => {
        const existingIds = new Set(prev.map((t) => t.id))
        const toAdd = newTeams
          .filter((t) => !existingIds.has(t.id))
          .map((t) => ({ ...t, competitionCode, competitionName }))
        return toAdd.length > 0 ? [...prev, ...toAdd] : prev
      })
    },
    []
  )

  return (
    <TeamsContext.Provider value={{ teams, addTeams }}>
      {children}
    </TeamsContext.Provider>
  )
}

export function useTeams() {
  return useContext(TeamsContext)
}
