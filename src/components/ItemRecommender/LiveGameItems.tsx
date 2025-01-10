// src/components/ItemRecommender/LiveGameItems.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { LiveGameItem, getLivePlayerItems } from '@/lib/liveClientApi';

interface LiveGameItemsProps {
  riotId: string;
  autoUpdate?: boolean;
}

export const LiveGameItems: React.FC<LiveGameItemsProps> = ({ 
  riotId, 
  autoUpdate = true 
}) => {
  const [items, setItems] = useState<LiveGameItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const data = await getLivePlayerItems(riotId);
      if (data) {
        setItems(data);
        setError(null);
      }
    } catch (err) {
      setError('Could not fetch live items');
      console.error('Error fetching items:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    
    if (autoUpdate) {
      const interval = setInterval(fetchItems, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [riotId, autoUpdate]);

  // Sort items by slot
  const sortedItems = [...items].sort((a, b) => a.slot - b.slot);
  
  // Create array of 7 slots (6 regular items + 1 trinket)
  const itemSlots = Array(7).fill(null);
  sortedItems.forEach(item => {
    if (item.slot < 7) {
      itemSlots[item.slot] = item;
    }
  });

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-1">
        {itemSlots.map((item, idx) => (
          <div
            key={idx}
            className={`relative w-8 h-8 rounded ${!item ? 'bg-gray-800 border border-gray-700' : ''}`}
            title={item?.displayName || `Empty Slot ${idx + 1}`}
          >
            {item ? (
              <div className="relative w-8 h-8">
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${item.itemID}.png`}
                  alt={item.displayName}
                  fill
                  className="rounded object-cover"
                  onError={() => {
                    console.error(`Failed to load item image: ${item.itemID}`);
                  }}
                />
                {item.count > 1 && (
                  <div className="absolute bottom-0 right-0 bg-black/70 px-1 rounded text-xs">
                    {item.count}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                {idx + 1}
              </div>
            )}
          </div>
        ))}
      </div>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};