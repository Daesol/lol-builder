import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/common/ui/card';
import { ddragonApi } from '@/lib/api/ddragon';
import type { ItemData } from '@/types/game';

interface ItemAnalysisProps {
  itemIds: number[];
  winRates?: Record<string, {
    count: number;
    winCount: number;
  }>;
}

export const ItemAnalysis = ({ itemIds, winRates }: ItemAnalysisProps) => {
  const [itemsData, setItemsData] = useState<Record<number, ItemData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItemsData = async () => {
      const data: Record<number, ItemData> = {};
      await Promise.all(
        itemIds.map(async (itemId) => {
          try {
            const itemData = await ddragonApi.getItemData(itemId);
            if (itemData) {
              data[itemId] = itemData;
            }
          } catch (error) {
            console.error(`Error loading item ${itemId}:`, error);
          }
        })
      );
      setItemsData(data);
      setLoading(false);
    };

    loadItemsData();
  }, [itemIds]);

  const getWinRate = (itemId: number) => {
    if (!winRates?.[itemId]) return null;
    const { count, winCount } = winRates[itemId];
    return ((winCount / count) * 100).toFixed(1);
  };

  if (loading) {
    return <div className="animate-pulse h-8 bg-gray-700 rounded" />;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {itemIds.map((itemId) => {
        const item = itemsData[itemId];
        if (!item) return null;

        const winRate = getWinRate(itemId);

        return (
          <Card key={itemId} className="w-16">
            <CardContent className="p-2">
              <div className="relative w-12 h-12">
                <Image
                  src={ddragonApi.getItemImageUrl(itemId)}
                  alt={item.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
              {winRate && (
                <p className="text-xs text-center mt-1 text-gray-400">
                  {winRate}% WR
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
