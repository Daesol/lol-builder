// src/components/ItemRecommender/ItemSlots.tsx
import Image from 'next/image';

interface ItemSlotsProps {
  items?: number[];
}

export const ItemSlots: React.FC<ItemSlotsProps> = ({ items = [] }) => {
  const getItemImageUrl = (itemId: number): string =>
    `https://ddragon.leagueoflegends.com/cdn/14.1.1/img/item/${itemId}.png`;

  const slots = Array(6).fill(null);
  items.forEach((item, index) => {
    if (index < 6) slots[index] = item;
  });

  return (
    <div className="grid grid-cols-3 gap-1">
      {slots.map((itemId, idx) => (
        <div
          key={idx}
          className={`relative w-8 h-8 rounded ${!itemId ? 'bg-gray-800 border border-gray-700' : ''}`}
          title={itemId ? `Item ${itemId}` : `Empty Slot ${idx + 1}`}
        >
          {itemId ? (
            <div className="relative w-8 h-8">
              <Image
                src={getItemImageUrl(itemId)}
                alt={`Item ${itemId}`}
                fill
                className="rounded object-cover"
                onError={() => console.error(`Failed to load item image: ${itemId}`)}
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