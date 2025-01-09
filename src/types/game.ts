// src/types/game.ts

import { Summoner } from './riot';

export interface Account {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface Participant {
  teamId: number;
  summonerId: string;
  summonerName: string;
  championId: number;
  spell1Id: number;
  spell2Id: number;
  kills: number;
  deaths: number;
  assists: number;
  item0: number | null;
  item1: number | null;
  item2: number | null;
  item3: number | null;
  item4: number | null;
  item5: number | null;
}

export interface MatchInfo {
  participants: Participant[];
}

export interface MatchData {
  info: MatchInfo;
}

export interface LiveGame {
  gameId: number;
  gameType: string;
  gameMode: string;
  participants: Participant[];
}

export interface GameData {
  account: Account;
  summoner: Summoner;
  liveGame: LiveGame | null;
  message: string;
}
