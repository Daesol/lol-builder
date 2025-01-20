export const REGIONS = {
  NA1: 'North America',
  BR1: 'Brazil',
  EUN1: 'Europe Nordic & East',
  EUW1: 'Europe West',
  JP1: 'Japan',
  KR: 'Korea',
  LA1: 'Latin America North',
  LA2: 'Latin America South',
  OC1: 'Oceania',
  PH2: 'Philippines',
  RU: 'Russia',
  SG2: 'Singapore',
  TH2: 'Thailand',
  TR1: 'Turkey',
  TW2: 'Taiwan',
  VN2: 'Vietnam'
} as const;

export const REGION_FLAGS: Record<string, string> = {
  NA1: '🇺🇸',
  BR1: '🇧🇷',
  EUN1: '🇪🇺',
  EUW1: '🇪🇺',
  JP1: '🇯🇵',
  KR: '🇰🇷',
  LA1: '🌎',
  LA2: '🌎',
  OC1: '🇦🇺',
  PH2: '🇵🇭',
  RU: '🇷🇺',
  SG2: '🇸🇬',
  TH2: '🇹🇭',
  TR1: '🇹🇷',
  TW2: '🇹🇼',
  VN2: '🇻🇳'
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

export const BATCH_SIZE = 3; // Number of matches to process in parallel
export const MATCHES_TO_ANALYZE = 20; // Total number of matches to analyze