// src/lib/analysis/matchAnalyzer.ts

import { PlayerMatchStats, PlayerAnalysis } from './types';

export const analyzePlayerMatches = (matches: PlayerMatchStats[]): PlayerAnalysis => {
  // Calculate KDA
  const totalKDA = matches.reduce(
    (acc, match) => ({
      kills: acc.kills + match.kills,
      deaths: acc.deaths + match.deaths,
      assists: acc.assists + match.assists,
    }),
    { kills: 0, deaths: 0, assists: 0 }
  );

  const averageKDA = {
    kills: totalKDA.kills / matches.length,
    deaths: totalKDA.deaths / matches.length,
    assists: totalKDA.assists / matches.length,
  };

  // Analyze items
  const itemFrequency: { [key: number]: number } = {};
  matches.forEach(match => {
    match.items.forEach(itemId => {
      itemFrequency[itemId] = (itemFrequency[itemId] || 0) + 1;
    });
  });

  const commonItems = Object.entries(itemFrequency)
    .map(([itemId, frequency]) => ({
      itemId: parseInt(itemId),
      frequency: frequency / matches.length, // Convert to percentage
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 6); // Get top 6 most common items

  // Calculate win rate
  const winRate = matches.filter(m => m.win).length / matches.length;

  // Analyze playstyle
  const playstyle = {
    aggressive: calculateAggressionScore(matches),
    teamfight: calculateTeamfightScore(matches),
    objective: calculateObjectiveScore(matches),
  };

  return {
    averageKDA,
    commonItems,
    winRate,
    playstyle,
  };
};

const calculateAggressionScore = (matches: PlayerMatchStats[]): number => {
  return matches.reduce((score, match) => {
    const kda = (match.kills + match.assists) / (match.deaths || 1);
    const killParticipation = (match.kills + match.assists) / 10; // Assuming average 10 kills per team
    return score + (kda * 0.6 + killParticipation * 0.4);
  }, 0) / matches.length;
};

const calculateTeamfightScore = (matches: PlayerMatchStats[]): number => {
  return matches.reduce((score, match) => {
    const assistRatio = match.assists / (match.kills + 0.1);
    return score + assistRatio;
  }, 0) / matches.length;
};

const calculateObjectiveScore = (matches: PlayerMatchStats[]): number => {
  // This would ideally use objective damage/participation data
  // For now, using a placeholder calculation
  return 0.5;
};