export interface LeaderboardPlayer {
  id: number;
  name: string;
  team: string;
  rank: number;
  gp: number;
  ppg: number;
  adjPpg: number;
  pointsPlus: number;
  mpg: number;
  position?: string;
  jersey?: string;
  usgPct?: number;
  tsPct?: number;
  pointsPlusStdDev?: number;
  volatilityPctile?: number;
}

export interface GameLogEntry {
  date: string;
  matchup: string;
  result: string;
  min: number;
  pts: number;
  adjPts: number;
  pointsPlus: number;
}

export interface PlayerDetail extends LeaderboardPlayer {
  gameLog: GameLogEntry[];
}

export interface DistributionBin {
  min: number;
  max: number;
  label: string;
  count: number;
}

export interface Metadata {
  generatedAt: string;
  season: string;
  asOfDate: string;
  qualifyingCriteria: {
    minGames: number;
    minMpg: number;
  };
  totalQualifyingPlayers: number;
  leagueAvgPointsPlus: number;
}

export type SortField = "rank" | "name" | "team" | "gp" | "ppg" | "adjPpg" | "pointsPlus" | "pointsPlusStdDev" | "mpg";
export type SortDirection = "asc" | "desc";
