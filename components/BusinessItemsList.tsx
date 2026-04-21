'use client';

import { useRouter } from 'next/navigation';
import { Item } from '@/lib/actions/items';
import { ServiceCard } from './ServiceCard';
import { ProductCard } from './ProductCard';
import { Package } from 'lucide-react';

interface Promotion {
    id: number;
    store_id: number;
    title: string;
    description: string | null;
    discount_percent: number | null;
    discount_text: string | null;
    valid_from: string;
    valid_until: string;
    apply_to_all: boolean;
    active: boolean;
    created_at: string;
    promotion_items?: { item_id: number }[];
    item_ids?: number[];
}

export interface Props {
    items: Item[];
    businessName: string;
    businessId: string;
    activePromos: Promotion[];
    isLinkedToStore: boolean;
    isOwner?: boolean;
}

export function BusinessItemsList({ items, businessName, businessId, activePromos, isLinkedToStore, isOwner = false }: Props) {
    const router = useRouter();

    if (items.length === 0) {
        return (
            <div className="py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Aucun produit publié</h3>
                <p className="text-gray-500 mt-1">Cet établissement n'a pas encore ajouté de produits.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {items.map((item: Item) => {
                const itemPromo = activePromos.find((p: Promotion) =>
                    p.apply_to_all || (p.promotion_items && p.promotion_items.some((pi: { item_id: number }) => pi.item_id === item.id))
                );

                const promoProps = itemPromo ? {
                    discount_percent: itemPromo.discount_percent ?? undefined,
                    discount_text: itemPromo.discount_text ?? undefined
                } : undefined;

                return item.item_type === 'SERVICE' ? (
                    <ServiceCard
                        key={item.id}
                        item={item}
                        businessName={businessName}
                        promotion={promoProps}
                        hideBooking={!isLinkedToStore || isOwner}
                        onViewDetails={() => router.push(`/merchants/service/${item.id}`)}
                    />
                ) : (
                    <ProductCard
                        key={item.id}
                        item={item}
                        businessName={businessName}
                        promotion={promoProps}
                        hideBuyButton={!isLinkedToStore || isOwner}
                        isOwner={isOwner}
                        onViewDetails={() => router.push(`/merchants/product/${item.id}`)}
                    />
                );
            })}
        </div>
    );
}
