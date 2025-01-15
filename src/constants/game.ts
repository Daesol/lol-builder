export const REGIONS = {
  NA1: 'North America',
  EUW1: 'Europe West',
  EUN1: 'Europe Nordic & East',
  KR: 'Korea',
  BR1: 'Brazil',
  JP1: 'Japan',
  LA1: 'Latin America North',
  LA2: 'Latin America South',
  OC1: 'Oceania',
  TR1: 'Turkey',
  RU: 'Russia'
} as const;

export const QUEUE_TYPES = {
  400: 'Normal Draft',
  420: 'Ranked Solo/Duo',
  430: 'Normal Blind',
  440: 'Ranked Flex',
  450: 'ARAM',
  700: 'Clash',
  830: 'Co-op vs AI Intro',
  840: 'Co-op vs AI Beginner',
  850: 'Co-op vs AI Intermediate'
} as const;

export const ROLES = {
  TOP: 'Top',
  JUNGLE: 'Jungle',
  MIDDLE: 'Mid',
  BOTTOM: 'Bot',
  SUPPORT: 'Support'
} as const;

export const DAMAGE_TYPES = {
  PHYSICAL: 'Physical',
  MAGIC: 'Magic',
  TRUE: 'True',
  MIXED: 'Mixed'
} as const;

export const ITEM_CATEGORIES = {
  STARTER: 'Starter',
  BOOTS: 'Boots',
  BASIC: 'Basic',
  EPIC: 'Epic',
  LEGENDARY: 'Legendary',
  MYTHIC: 'Mythic',
  CONSUMABLE: 'Consumable'
} as const;

export const API_ENDPOINTS = {
  RIOT_ACCOUNT: 'https://americas.api.riotgames.com/riot/account/v1',
  LOL_SUMMONER: 'https://{region}.api.riotgames.com/lol/summoner/v4',
  LOL_SPECTATOR: 'https://{region}.api.riotgames.com/lol/spectator/v4',
  LOL_MATCH: 'https://{platform}.api.riotgames.com/lol/match/v5',
  DDRAGON_VERSION: 'https://ddragon.leagueoflegends.com/api/versions.json',
  DDRAGON_CHAMPION: 'https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/champion.json',
  DDRAGON_ITEM: 'https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/item.json'
} as const;

export const RATE_LIMITS = {
  REQUESTS_PER_SECOND: 20,
  REQUESTS_PER_MINUTE: 100
} as const;
