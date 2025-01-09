// src/app/page.tsx
import ItemRecommender from '@/components/ItemRecommender';

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-400">
          LoL Item Builder
        </h1>
        <ItemRecommender />
      </div>
    </main>
  );
}