import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getItemImageUrl } from '@/lib/ddragonClient';

interface ItemSlotsProps {
  items?: number[];
}

export const ItemSlots: React.FC<ItemSlotsProps> = ({ items = [] }) => {
  const [itemUrls, setItemUrls] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItemData = async () => {
      try {
        const urlData: Record<number, string> = {};
        await Promise.all(
          items.map(async (itemId) => {
            if (itemId) {
              urlData[itemId] = await getItemImageUrl(itemId);
            }
          })
        );
        setItemUrls(urlData);
      } catch (error) {
        console.error('Error loading item images:', error);
      } finally {
        setLoading(false);
      }
    };

    loadItemData();
  }, [items]);

  // Always show 6 slots
  const slots = Array(6).fill(null);
  items.forEach((item, index) => {
    if (index < 6) slots[index] = item;
  });

  return (
    <div className="grid grid-cols-3 gap-1">
      {slots.map((itemId, idx) => (
        <div
          key={idx}
          className={`relative w-8 h-8 rounded ${
            !itemId || loading ? 'bg-gray-800 border border-gray-700' : ''
          }`}
          title={itemId ? `Item ${itemId}` : `Empty Slot ${idx + 1}`}
        >
          {itemId && itemUrls[itemId] ? (
            <Image
              src={itemUrls[itemId]}
              alt={`Item ${itemId}`}
              width={32}
              height={32}
              className="rounded object-cover"
            />
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
