// src/components/ItemRecommender/LastMatchAnalysis.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Match, MatchParticipant, LiveGameParticipant } from '@/types/game';
import { ParticipantCard } from './ParticipantCard';

interface LastMatchAnalysisProps {
  lastMatch: Match;
  region: string;
}

export const LastMatchAnalysis: React.FC<LastMatchAnalysisProps> = ({ lastMatch, region }) => {
  const blueTeam = lastMatch.info.participants.filter(p => p.teamId === 100);
  const redTeam = lastMatch.info.participants.filter(p => p.teamId === 200);
  const blueTeamWon = lastMatch.info.teams.find(t => t.teamId === 100)?.win;
  const gameLength = Math.floor(lastMatch.info.gameDuration / 60);
  const gameMode = lastMatch.info.gameMode;

  const convertToLiveGameParticipant = (participant: MatchParticipant): LiveGameParticipant => ({
    puuid: participant.puuid,
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    teamId: participant.teamId,
    spell1Id: 0,
    spell2Id: 0,
    championId: participant.championId,
    championName: participant.championName,
    profileIconId: 0,
    summonerName: participant.summonerName,
    riotIdGameName: participant.summonerName,
    riotIdTagline: region,
    riotId: `${participant.summonerName}#${region}`,
    bot: false,
    summonerId: participant.puuid, // Using puuid for analysis
    gameCustomizationObjects: [],
    perks: {
      perkIds: [],
      perkStyle: 0,
      perkSubStyle: 0
    },
    item0: 0,
    item1: 0,
    item2: 0,
    item3: 0,
    item4: 0,
    item5: 0,
    item6: 0,
    teamPosition: '', // Position might not be available in match history
  });

  return (
    <div className="space-y-6">
      {/* Match Summary */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-400">Match Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-700 rounded">
              <div className="text-gray-400 text-sm">Game Mode</div>
              <div className="text-white">{gameMode}</div>
            </div>
            <div className="p-3 bg-gray-700 rounded">
              <div className="text-gray-400 text-sm">Duration</div>
              <div className="text-white">{gameLength} minutes</div>
            </div>
            <div className="p-3 bg-gray-700 rounded">
              <div className="text-gray-400 text-sm">Winner</div>
              <div className={blueTeamWon ? 'text-blue-400' : 'text-red-400'}>
                {blueTeamWon ? 'Blue Team' : 'Red Team'}
              </div>
            </div>
            <div className="p-3 bg-gray-700 rounded">
              <div className="text-gray-400 text-sm">Players</div>
              <div className="text-white">{lastMatch.info.participants.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blue Team */}
        <div>
          <h3 className="text-blue-400 font-medium mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Blue Team
          </h3>
          <div className="space-y-4">
            {blueTeam.map((participant) => (
              <ParticipantCard
                key={participant.puuid}
                participant={convertToLiveGameParticipant(participant)}
                region={region}
                matchStats={{
                  kills: participant.kills,
                  deaths: participant.deaths,
                  assists: participant.assists,
                  totalDamageDealt: participant.totalDamageDealtToChampions,
                  goldEarned: participant.goldEarned,
                  win: participant.win
                }}
                enableAnalysis={true} // Add this flag
              />
            ))}
          </div>
        </div>

        {/* Red Team */}
        <div>
          <h3 className="text-red-400 font-medium mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Red Team
          </h3>
          <div className="space-y-4">
            {redTeam.map((participant) => (
              <ParticipantCard
                key={participant.puuid}
                participant={convertToLiveGameParticipant(participant)}
                region={region}
                matchStats={{
                  kills: participant.kills,
                  deaths: participant.deaths,
                  assists: participant.assists,
                  totalDamageDealt: participant.totalDamageDealtToChampions,
                  goldEarned: participant.goldEarned,
                  win: participant.win
                }}
                enableAnalysis={true} // Add this flag
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};