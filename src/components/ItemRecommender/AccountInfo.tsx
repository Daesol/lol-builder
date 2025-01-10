import { Account, Summoner } from '@/types/game';

interface AccountInfoProps {
  account: Account;
  summoner: Summoner;
}

export const AccountInfo: React.FC<AccountInfoProps> = ({ account, summoner }) => (
  <div className="bg-gray-800 p-4 rounded border border-gray-700">
    <h3 className="font-semibold mb-2 text-blue-400">Account Info</h3>
    <p className="text-gray-300">Game Name: {account.gameName}</p>
    <p className="text-gray-300">Tag Line: {account.tagLine}</p>
    <p className="text-gray-300">Level: {summoner.summonerLevel}</p>
  </div>
);

export default AccountInfo;
