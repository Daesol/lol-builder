// src/components/ItemRecommender/utils.ts

export const getPlaceholderUrl = (width: number, height: number = width) => 
    `/api/placeholder/${width}/${height}`;
  
  export const formatKDA = (kills: number, deaths: number, assists: number) => 
    `${kills}/${deaths}/${assists}`;
  
  export const calculateWinRate = (wins: number, total: number) => 
    `${((wins / total) * 100).toFixed(1)}%`;
  
  export const formatNumber = (num: number) => 
    num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num.toString();