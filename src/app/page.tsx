// src/app/page.tsx
'use client';

import { GameAnalysis } from '@/components/game-analysis';

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">LoL Match Analysis</h1>
      <GameAnalysis />
    </main>
  );
}