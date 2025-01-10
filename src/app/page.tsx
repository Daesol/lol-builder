// src/app/page.tsx
import ItemRecommender from '@/components/ItemRecommender';
import MatchAnalyzer from '@/components/MatchAnalyzer';

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* <ItemRecommender /> */}
        <MatchAnalyzer/>
      </div>
    </main>
  );
}