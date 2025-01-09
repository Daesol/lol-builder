// src/app/page.tsx
import ItemRecommender from '@/components/ItemRecommender';

export default function Home() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <ItemRecommender />
      </div>
    </main>
  );
}