export interface Competition {
  id: number
  code: string
  name: string
  emblem: string
  area: string
  areaFlag: string
  type: "LEAGUE" | "CUP"
}

export const COMPETITIONS: Competition[] = [
  { id: 2000, code: "WC",  name: "FIFA World Cup",      emblem: "https://crests.football-data.org/wm26.png",   area: "Monde",           areaFlag: "",                                             type: "CUP"    },
  { id: 2001, code: "CL",  name: "Champions League",    emblem: "https://crests.football-data.org/CL.png",     area: "Europe",          areaFlag: "https://crests.football-data.org/EUR.svg",     type: "CUP"    },
  { id: 2018, code: "EC",  name: "Euro",                emblem: "https://crests.football-data.org/ec.png",     area: "Europe",          areaFlag: "https://crests.football-data.org/EUR.svg",     type: "CUP"    },
  { id: 2021, code: "PL",  name: "Premier League",      emblem: "https://crests.football-data.org/PL.png",     area: "Angleterre",      areaFlag: "https://crests.football-data.org/770.svg",     type: "LEAGUE" },
  { id: 2016, code: "ELC", name: "Championship",        emblem: "https://crests.football-data.org/ELC.png",    area: "Angleterre",      areaFlag: "https://crests.football-data.org/770.svg",     type: "LEAGUE" },
  { id: 2002, code: "BL1", name: "Bundesliga",          emblem: "https://crests.football-data.org/BL1.png",    area: "Allemagne",       areaFlag: "https://crests.football-data.org/759.svg",     type: "LEAGUE" },
  { id: 2019, code: "SA",  name: "Serie A",             emblem: "https://crests.football-data.org/c111.png",   area: "Italie",          areaFlag: "https://crests.football-data.org/784.svg",     type: "LEAGUE" },
  { id: 2015, code: "FL1", name: "Ligue 1",             emblem: "https://crests.football-data.org/FL1.png",    area: "France",          areaFlag: "https://crests.football-data.org/773.svg",     type: "LEAGUE" },
  { id: 2014, code: "PD",  name: "La Liga",             emblem: "https://crests.football-data.org/laliga.png", area: "Espagne",         areaFlag: "https://crests.football-data.org/760.svg",     type: "LEAGUE" },
  { id: 2003, code: "DED", name: "Eredivisie",          emblem: "https://crests.football-data.org/ED.png",     area: "Pays-Bas",        areaFlag: "https://crests.football-data.org/8601.svg",    type: "LEAGUE" },
  { id: 2017, code: "PPL", name: "Primeira Liga",       emblem: "https://crests.football-data.org/PPL.png",    area: "Portugal",        areaFlag: "https://crests.football-data.org/765.svg",     type: "LEAGUE" },
  { id: 2013, code: "BSA", name: "Brasileiro Série A",  emblem: "https://crests.football-data.org/bsa.png",    area: "Brésil",          areaFlag: "https://crests.football-data.org/764.svg",     type: "LEAGUE" },
  { id: 2152, code: "CLI", name: "Copa Libertadores",   emblem: "https://crests.football-data.org/CLI.svg",    area: "Amérique du Sud", areaFlag: "",                                             type: "CUP"    },
]

export function getCompetition(code: string): Competition | undefined {
  return COMPETITIONS.find((c) => c.code === code)
}
