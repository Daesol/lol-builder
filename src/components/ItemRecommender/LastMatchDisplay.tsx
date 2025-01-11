// src/components/ItemRecommender/LastMatchDisplay.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Match, MatchParticipant } from '@/types/game';

interface LastMatchDisplayProps {
  lastMatch: Match;
  summoner: {
    name: string;
    profileIconId: number;
  };
}

export const LastMatchDisplay: React.FC<LastMatchDisplayProps> = ({ lastMatch, summoner }) => {
  console.log('LastMatch Data:', lastMatch);
  console.log('Summoner Data:', summoner);
  console.log('Participants:', lastMatch.info.participants);
  
  // Find the player's data in the match - use puuid or exact name match
  const playerData = lastMatch.info.participants.find(
    (p: MatchParticipant) => p.summonerName.toLowerCase() === summoner.name.toLowerCase()
  );
  
  console.log('Found Player Data:', playerData);

  const getGameDuration = () => {
    const minutes = Math.floor(lastMatch.info.gameDuration / 60);
    const seconds = lastMatch.info.gameDuration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getGameResult = () => {
    if (!playerData) {
      console.log('No player data found for game result');
      return 'Unknown';
    }
    return playerData.win ? 'Victory' : 'Defeat';
  };

  const getKDA = () => {
    if (!playerData) {
      console.log('No player data found for KDA');
      return 'Unknown';
    }
    return `${playerData.kills}/${playerData.deaths}/${playerData.assists}`;
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-blue-400">Last Match Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="text-gray-400 text-sm">Game Type</div>
              <div className="text-white font-medium">{lastMatch.info.gameMode}</div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="text-gray-400 text-sm">Duration</div>
              <div className="text-white font-medium">{getGameDuration()}</div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="text-gray-400 text-sm">Result</div>
              <div className={`font-medium ${getGameResult() === 'Victory' ? 'text-green-400' : 'text-red-400'}`}>
                {getGameResult()}
              </div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="text-gray-400 text-sm">KDA</div>
              <div className="text-white font-medium">{getKDA()}</div>
            </div>
          </div>

          {playerData && (
            <div className="p-4 bg-gray-700 rounded-lg">
              <h4 className="text-white font-medium mb-2">Champion: {playerData.championName}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Damage Dealt</div>
                  <div className="text-white">{playerData.totalDamageDealtToChampions.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Gold Earned</div>
                  <div className="text-white">{playerData.goldEarned.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Vision Score</div>
                  <div className="text-white">{playerData.visionScore}</div>
                </div>
              </div>
            </div>
          )}

          {/* Debug display */}
          <div className="mt-4 p-4 bg-gray-900 rounded text-xs text-gray-300">
            <pre>
              Debug Info:
              Summoner Name: {summoner.name}
              Found Player: {playerData ? 'Yes' : 'No'}
              Total Participants: {lastMatch.info.participants.length}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};