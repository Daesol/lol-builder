// src/app/page.tsx
import ItemRecommender from '@/components/ItemRecommender';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          LoL Item Builder
        </h1>
        <ItemRecommender />
      </div>
    </main>
  );
}