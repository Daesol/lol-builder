// src/app/page.tsx
import { GameAnalysis } from '@/components/game-analysis';

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">LoL Item Recommender</h1>
        <p className="text-gray-400">
          Analyze live games and get item recommendations based on team composition and player history.
        </p>
        <GameAnalysis />
      </div>
    </main>
  );
}