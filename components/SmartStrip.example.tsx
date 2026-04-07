'use client';

import { SmartStrip, type SmartStripItem } from '@/components/SmartStrip';

const STRIP_ITEMS: SmartStripItem[] = [
  { id: '1', icon: '🔥', label: 'Flash Sale',  price: '-40%',  isTrending: true,  badge: 'trending' },
  { id: '2', icon: '👟', label: 'Sneakers',    price: '29dt',  isTrending: true,  badge: 'hot'      },
  { id: '3', icon: '📱', label: 'Tech Deals',  price: '-30%',  isTrending: false, badge: 'new'      },
  { id: '4', icon: '🎮', label: 'Gaming',      price: '5dt',   isTrending: true,  badge: 'trending' },
  { id: '5', icon: '👗', label: 'Fashion',     price: '-25%',  isTrending: false, badge: 'hot'      },
  { id: '6', icon: '🏋️', label: 'Fitness',    price: '12dt',  isTrending: false                    },
  { id: '7', icon: '🍕', label: 'Food',        price: '-15%',  isTrending: true,  badge: 'new'      },
  { id: '8', icon: '✈️', label: 'Travel',     price: '99dt',  isTrending: false                    },
  { id: '9', icon: '💄', label: 'Beauty',      price: '-20%',  isTrending: true,  badge: 'trending' },
  { id: '10', icon: '🛋️', label: 'Home',      price: '8dt',   isTrending: false, badge: 'hot'      },
];

export default function FeedPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <SmartStrip
        items={STRIP_ITEMS}
        title="Trending & Offers"
        onSelect={(item) => {
          // item is null when filter is cleared
          console.log('Selected:', item);
        }}
      />
    </main>
  );
}