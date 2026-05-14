'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { hasCompletedTransactionWithStore } from './transactions'

export type ReviewInput = {
    store_id: number | null | undefined; // Now explicitly allowing null/update from client
    businessId?: string; // We'll pass this explicitly now for directory reference
    item_id?: number; // Added for product/service reviews
    rating: number;
    comment: string;
}

export async function submitReview(input: ReviewInput) {
    const supabase = createClient()

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Vous devez être connecté pour laisser un avis.' }
    }

    // 2. Validate input
    if (input.rating < 1 || input.rating > 5) {
        return { error: 'La note doit être entre 1 et 5 étoiles.' }
    }
    if (!input.comment || input.comment.trim().length < 3) {
        return { error: 'Le commentaire doit faire au moins 3 caractères.' }
    }

    let resolvedStoreId = input.store_id;

    // 3. Shadow Store Creation Logic
    if (!resolvedStoreId && input.businessId) {
        // Try to find an existing store linked to this directory ID just in case
        const { data: existingStore } = await (supabase
            .from('stores') as any)
            .select('id')
            .eq('id_business', parseInt(input.businessId))
            .maybeSingle();

        if (existingStore) {
            resolvedStoreId = existingStore.id;
        } else {
            // Need to create a shadow store! Let's fetch basic details from directory first
            const { data: directoryData } = await (supabase
                .from('business_directory_tunisia') as any)
                .select('title, city, categoryName, phone, full_address, latitude, longitude')
                .eq('id', parseInt(input.businessId))
                .maybeSingle();

            if (!directoryData) {
                return { error: 'Établissement introuvable dans l\'annuaire.' };
            }

            // Insert shadow store
            const { data: newStore, error: createStoreError } = await (supabase
                .from('stores') as any)
                .insert({
                    name: directoryData.title || `Boutique ${input.businessId}`,
                    slug: `shadow-${input.businessId}-${Date.now()}`,
                    status: 'PENDING',
                    id_business: parseInt(input.businessId),
                    business_directory_id: parseInt(input.businessId),
                    city: directoryData.city || 'Tunisie',
                    address: directoryData.full_address || 'Adresse non spécifiée',
                    latitude: directoryData.latitude || 0,
                    longitude: directoryData.longitude || 0,
                    phone: directoryData.phone || 'Non renseigné',
                    owner_id: user.id // Assigning the first reviewer as temporary owner to satisfy constraints
                })
                .select('id')
                .single();

            if (createStoreError) {
                console.error("Failed to create shadow store:", createStoreError);
                return { error: "Erreur lors de la création de l'espace d'avis pour cet établissement." };
            }

            resolvedStoreId = newStore.id;
            console.log("Created shadow store ID:", resolvedStoreId);
        }
    }

    if (!resolvedStoreId) {
        return { error: "Impossible de lier l'avis à cet établissement. ID manquant." };
    }

    // 4. Check for existing review (Prevent duplicates)
    const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('author_id', user.id)
        .eq('store_id', resolvedStoreId)
        .maybeSingle();

    if (existingReview) {
        return { error: 'Vous avez déjà laissé un avis pour cet établissement.' };
    }

    // 5. Security & Verification
    const { data: storeInfo } = await supabase
        .from('stores')
        .select('owner_id, status')
        .eq('id', resolvedStoreId)
        .single();

    if (storeInfo) {
        // Prevent owners from reviewing their own store
        if (storeInfo.owner_id === user.id) {
            return { error: 'Vous ne pouvez pas laisser un avis sur votre propre établissement.' };
        }

        // For ACTIVE stores, require a completed transaction
        if (storeInfo.status === 'ACTIVE') {
            const hasPurchased = await hasCompletedTransactionWithStore(resolvedStoreId);
            if (!hasPurchased) {
                return { error: 'Vous devez avoir effectué un achat ou une réservation terminée pour laisser un avis sur cet établissement.' };
            }
        }
    }

    // 6. Insert review
    const { error: insertError } = await (supabase
        .from('reviews') as any)
        .insert({
            author_id: user.id,
            store_id: resolvedStoreId,
            item_id: input.item_id,
            rating: input.rating,
            comment: input.comment,
            is_approved: true
        })

    if (insertError) {
        console.error('Review submission error:', insertError)
        return { error: `Erreur lors de l'enregistrement: ${insertError.message}` }
    }

    // 7. Update Store Rating Statistics (Cache)
    try {
        const { data: allReviews } = await supabase
            .from('reviews')
            .select('rating')
            .eq('store_id', resolvedStoreId)
            .eq('is_approved', true);

        if (allReviews && allReviews.length > 0) {
            const totalReviews = allReviews.length;
            const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

            await supabase
                .from('stores')
                .update({
                    rating_average: parseFloat(avgRating.toFixed(1)),
                    total_reviews: totalReviews,
                    updated_at: new Date().toISOString()
                })
                .eq('id', resolvedStoreId);
        }
    } catch (err) {
        console.error("Failed to update store stats:", err);
        // Don't block the response even if stats update fails
    }

    if (input.businessId) {
        revalidatePath(`/business/${input.businessId}`)
    }
    revalidatePath(`/business/${resolvedStoreId}`)
    return { success: true }
}

export async function getReviewsByStoreId(storeId: number) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('reviews')
        .select(`
            id,
            rating,
            comment,
            created_at,
            vendor_response,
            responded_at,
            item_id,
            item:item_id (
                name
            ),
            author:author_id (
                full_name,
                avatar_url
            )
        `)
        .eq('store_id', storeId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }

    return data || [];
}

export async function respondToReview(reviewId: number, response: string) {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: 'Non authentifié.' }

    const { error } = await supabase
        .from('reviews')
        .update({
            vendor_response: response,
            responded_at: new Date().toISOString()
        })
        .eq('id', reviewId)

    if (error) {
        console.error('Error responding to review:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
