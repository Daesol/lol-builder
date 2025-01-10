import { LiveGame, MatchInfo } from '@/types/game';
import { ParticipantCard } from './ParticipantCard';

interface LiveGameDisplayProps {
  liveGame?: LiveGame;
  lastMatch?: MatchInfo;
}

export const LiveGameDisplay: React.FC<LiveGameDisplayProps> = ({ liveGame, lastMatch }) => {
  const participants = liveGame?.participants || lastMatch?.participants;

  return (
    <div className="mt-6">
      <h3 className="text-blue-400 font-semibold mb-4 text-lg">
        {liveGame
          ? `Live Game - ${liveGame.gameMode} (${liveGame.gameType})`
          : `Last Match - ${lastMatch?.gameMode} (${lastMatch?.gameType})`}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {participants?.map((participant) => (
          <ParticipantCard key={participant.summonerName} participant={participant} />
        ))}
      </div>
    </div>
  );
};
