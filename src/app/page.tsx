// src/app/page.tsx
'use client';

import { GameAnalysis } from '@/components/game-analysis';

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-4">
        {/* Left Ad Space */}
        <div className="col-span-2 hidden lg:block" />

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-8">
          <GameAnalysis />
        </div>

        {/* Right Ad Space */}
        <div className="col-span-2 hidden lg:block" />
      </div>
    </main>
  );
}