'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ReviewInput = {
    store_id: number | null | undefined; // Now explicitly allowing null/update from client
    businessId?: string; // We'll pass this explicitly now for directory reference
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

    // 4. Insert review
    const { error: insertError } = await (supabase
        .from('reviews') as any)
        .insert({
            author_id: user.id,
            store_id: resolvedStoreId,
            rating: input.rating,
            comment: input.comment,
            is_approved: true
        })

    if (insertError) {
        console.error('Review submission error:', insertError)
        return { error: `Erreur lors de l'enregistrement: ${insertError.message}` }
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
