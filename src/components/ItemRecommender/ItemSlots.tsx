// src/components/ItemRecommender/ItemSlots.tsx
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getItemImageUrl, getItemInfo } from '@/lib/ddragonClient';
import type { ItemData } from '@/types/ddragon';
import type { ItemSlotsProps } from './types';

export const ItemSlots: React.FC<ItemSlotsProps> = ({ 
  items = [], 
  tooltipSuffix = () => '' 
}) => {
  const [tooltips, setTooltips] = useState<Record<number, ItemData>>({});
  const [itemUrls, setItemUrls] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const loadItemData = async () => {
      setLoading(true);
      try {
        const tooltipData: Record<number, ItemData> = {};
        const urlData: Record<number, string> = {};
        
        await Promise.all(
          items.map(async (itemId) => {
            if (itemId) {
              try {
                const [itemInfo, imageUrl] = await Promise.all([
                  getItemInfo(itemId),
                  getItemImageUrl(itemId)
                ]);
                
                if (itemInfo) {
                  tooltipData[itemId] = itemInfo;
                  urlData[itemId] = imageUrl;
                }
              } catch (error) {
                console.error(`Error loading data for item ${itemId}:`, error);
              }
            }
          })
        );
        
        setTooltips(tooltipData);
        setItemUrls(urlData);
      } catch (error) {
        console.error('Error loading item data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadItemData();
  }, [items]);

  const slots = Array(6).fill(null);
  items.forEach((item, index) => {
    if (index < 6) slots[index] = item;
  });

  const handleImageError = (itemId: number) => {
    console.error(`Failed to load item image: ${itemId}`);
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  return (
    <div className="grid grid-cols-3 gap-1">
      {slots.map((itemId, idx) => (
        <div
          key={idx}
          className={`relative w-8 h-8 rounded ${
            !itemId || loading ? 'bg-gray-800 border border-gray-700' : ''
          }`}
          title={itemId && tooltips[itemId] 
            ? `${tooltips[itemId].name}${tooltipSuffix(itemId)}`
            : `Empty Slot ${idx + 1}`
          }
        >
          {itemId && itemUrls[itemId] && !imageErrors[itemId] ? (
            <div className="relative w-8 h-8">
              <Image
                src={itemUrls[itemId]}
                alt={tooltips[itemId]?.name || `Item ${itemId}`}
                width={32}
                height={32}
                className="rounded object-cover"
                onError={() => handleImageError(itemId)}
                unoptimized
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
              {idx + 1}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};