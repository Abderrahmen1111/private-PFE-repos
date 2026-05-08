'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { generateEmbedding } from '@/lib/openrouter-embeddings'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UnifiedSearchResult {
    source: 'business_directory' | 'service_directory'
    id: number
    name: string
    city: string
    phone: string | null
    address: string | null
    category: string | null
    is_claimed: boolean
    place_id: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Date.now()
}

// ─── Recherche unifiée (DB locale + Service Directory) ────────────────────────

export async function searchUnified(queryStr: string): Promise<UnifiedSearchResult[]> {
    if (!queryStr || queryStr.length < 2) return []
    
    const supabase = createClient()
    
    // Recherche parallèle dans les deux directories
    const [bizRes, svcRes] = await Promise.all([
        (supabase as any)
            .from('business_directory_tunisia')
            .select('id, title, city, phone, full_address, vitrine_category, is_claimed, place_id')
            .or(`title.ilike.%${queryStr}%,categoryName.ilike.%${queryStr}%,vitrine_category.ilike.%${queryStr}%`)
            .limit(5),
        (supabase as any)
            .from('service_directory')
            .select('service_id, name, city, phone, address, category')
            .or(`name.ilike.%${queryStr}%,category.ilike.%${queryStr}%`)
            .eq('status', 'ACTIVE')
            .limit(5)
    ])
    
    const results: UnifiedSearchResult[] = []
    
    if (bizRes.data) {
        bizRes.data.forEach((biz: any) => {
            results.push({
                source: 'business_directory',
                id: biz.id,
                name: biz.title,
                city: biz.city,
                phone: biz.phone,
                address: biz.full_address,
                category: biz.vitrine_category,
                is_claimed: biz.is_claimed || false,
                place_id: biz.place_id || null,
            })
        })
    }
    
    if (svcRes.data) {
        svcRes.data.forEach((svc: any) => {
            results.push({
                source: 'service_directory',
                id: svc.service_id,
                name: svc.name,
                city: svc.city,
                phone: svc.phone,
                address: svc.address,
                category: svc.category,
                is_claimed: false, // Services don't have is_claimed
                place_id: null,
            })
        })
    }
    
    return results
}

// ─── Ancienne recherche (conservée pour compatibilité) ────────────────────────

export async function searchBusinessDirectory(queryStr: string) {
    if (!queryStr || queryStr.length < 2) return [];

    const supabase = createClient();

    const { data, error } = await supabase
        .from('business_directory_tunisia' as any)
        .select('id, title, city, phone, full_address, vitrine_category, is_claimed, categoryName')
        .or(`title.ilike.%${queryStr}%,categoryName.ilike.%${queryStr}%,vitrine_category.ilike.%${queryStr}%`)
        .limit(5);

    if (error) {
        console.error('Search error:', error);
        return [];
    }

    return (data as any[]) || [];
}

// ─── Ajout Business/Service (version améliorée) ──────────────────────────────

export async function addBusiness(formData: FormData) {
    const supabase = createClient()

    // 1. Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Vous devez être connecté pour ajouter un business.' }
    }

    // 2. Extraire les champs du formulaire
    const name = formData.get('companyName') as string
    const email = formData.get('companyEmail') as string
    const rne = formData.get('rne') as string
    const website = formData.get('companyWebsite') as string
    const address = formData.get('companyAddress') as string
    const city = formData.get('location') as string
    const description = formData.get('description') as string
    const phone = formData.get('phone') as string
    const category = formData.get('category') as string
    const directoryId = formData.get('directoryId') as string
    const serviceDirectoryId = formData.get('serviceDirectoryId') as string

    // Nouveaux champs
    const businessType = (formData.get('businessType') as string) || 'BUSINESS'
    const isCreateMode = formData.get('isCreateMode') === 'true'
    const googlePlaceId = formData.get('googlePlaceId') as string
    const lat = parseFloat(formData.get('lat') as string) || 0
    const lng = parseFloat(formData.get('lng') as string) || 0

    // 3. Validation
    if (!name || !email || !city || !phone || !category) {
        return { error: 'Veuillez remplir tous les champs obligatoires.' }
    }

    // RNE obligatoire seulement pour les Business, pas les Services
    if (businessType === 'BUSINESS' && !rne) {
        return { error: 'Le RNE est obligatoire pour un business.' }
    }

    const slug = generateSlug(name)

    // 4. Upload du logo
    let logoUrl: string | null = null
    const logoFile = formData.get('logo') as File | null

    if (logoFile && logoFile.size > 0) {
        const fileExt = logoFile.name.split('.').pop()
        const filePath = `${user.id}/${slug}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('store-images')
            .upload(filePath, logoFile, { cacheControl: '3600', upsert: true })

        if (uploadError) {
            return { error: `Erreur lors de l'upload du logo: ${uploadError.message}` }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('store-images')
            .getPublicUrl(uploadData.path)

        logoUrl = publicUrl
    }

    // Upload pièce justificative (pour les Services)
    let justificatifUrl: string | null = null
    const justificatifFile = formData.get('justificatif') as File | null

    if (justificatifFile && justificatifFile.size > 0) {
        const fileExt = justificatifFile.name.split('.').pop()
        const filePath = `${user.id}/justificatif-${slug}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('store-images')
            .upload(filePath, justificatifFile, { cacheControl: '3600', upsert: true })

        if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabase.storage
                .from('store-images')
                .getPublicUrl(uploadData.path)
            justificatifUrl = publicUrl
        }
    }

    // 5. Mettre à jour le rôle utilisateur → PRO
    const { error: userUpdateError } = await supabase
        .from('users')
        .upsert({
            id: user.id,
            email: user.email,
            role: 'PRO',
            full_name: user.user_metadata?.full_name || user.email,
            updated_at: new Date().toISOString()
        } as any)

    if (userUpdateError) {
        console.error('Error updating public user role:', userUpdateError)
        return { error: `Erreur lors de la mise à jour de l'utilisateur: ${userUpdateError.message}` }
    }

    // ─── Logique selon le mode ───────────────────────────────────────────

    let finalDirectoryId: number | null = directoryId ? parseInt(directoryId) : null
    let finalServiceId: number | null = serviceDirectoryId ? parseInt(serviceDirectoryId) : null

    if (isCreateMode) {
        // ─── Mode CRÉATION : insérer dans la directory puis dans stores ───

        if (businessType === 'BUSINESS') {
            // Insérer dans business_directory_tunisia
            const { data: dirEntry, error: dirError } = await (supabase as any)
                .from('business_directory_tunisia')
                .insert({
                    title: name,
                    city,
                    phone,
                    full_address: address || '',
                    place_id: googlePlaceId || null,
                    latitude: lat,
                    longitude: lng,
                    vitrine_category: category,
                    is_claimed: true,
                    claimed_by: user.id,
                    data_source: 'user_created',
                    website: website || null,
                    description: description || null,
                    embedding: await generateEmbedding(`${name} ${description || ''} ${category}`).catch(() => null),
                })
                .select('id')
                .single()

            if (dirError) {
                console.error('Error creating directory entry:', dirError)
                return { error: `Erreur lors de la création: ${dirError.message}` }
            }

            finalDirectoryId = dirEntry.id

        } else {
            // Insérer dans service_directory
            const { data: serviceEntry, error: svcError } = await (supabase as any)
                .from('service_directory')
                .insert({
                    name,
                    slug,
                    category,
                    phone,
                    address: address || '',
                    city,
                    owner_id: user.id,
                    latitude: lat,
                    longitude: lng,
                    status: 'ACTIVE',
                    description: description || null,
                    embedding: await generateEmbedding(`${name} ${description || ''} ${category}`).catch(() => null),
                })
                .select('service_id')
                .single()

            if (svcError) {
                console.error('Error creating service entry:', svcError)
                return { error: `Erreur lors de la création du service: ${svcError.message}` }
            }

            finalServiceId = serviceEntry.service_id
        }

    } else if (googlePlaceId && !finalDirectoryId) {
        // ─── Mode RÉCLAMATION Google Maps (pas encore dans la DB) ─────────

        const { data: dirEntry, error: dirError } = await (supabase as any)
            .from('business_directory_tunisia')
            .insert({
                title: name,
                city,
                phone,
                full_address: address || '',
                place_id: googlePlaceId,
                latitude: lat,
                longitude: lng,
                vitrine_category: category,
                is_claimed: true,
                claimed_by: user.id,
                data_source: 'google_maps',
                website: website || null,
            })
            .select('id')
            .single()

        if (dirError) {
            console.error('Error creating GM directory entry:', dirError)
            return { error: `Erreur lors de la réclamation: ${dirError.message}` }
        }

        finalDirectoryId = dirEntry.id
    }

    // ─── 6. Insérer dans stores ──────────────────────────────────────────

    const storeInsert: any = {
        owner_id: user.id,
        name,
        slug,
        description: description || null,
        category: category as any,
        phone,
        email,
        website: website || null,
        address: address || '',
        latitude: lat,
        longitude: lng,
        city,
        logo_url: logoUrl,
        rne: rne || null,
        business_registration: rne || null,
        status: 'PENDING',
        embedding: await generateEmbedding(`${name} ${description || ''} ${category}`).catch(() => null),
    }

    // Lier selon le type
    if (finalDirectoryId) {
        storeInsert.business_directory_id = finalDirectoryId
        storeInsert.id_business = finalDirectoryId
    }
    if (finalServiceId) {
        storeInsert.service_id = finalServiceId
    }

    // Stocker la pièce justificative
    if (justificatifUrl) {
        storeInsert.business_license_url = justificatifUrl
    }

    const { data: storeData, error: insertError } = await (supabase as any)
        .from('stores')
        .insert(storeInsert)
        .select('id')
        .single()

    if (insertError) {
        return { error: `Erreur lors de l'ajout: ${insertError.message}` }
    }

    // 7. Mettre à jour les métadonnées d'auth
    const { error: metadataError } = await supabase.auth.updateUser({
        data: { role: 'business_owner' }
    })

    if (metadataError) {
        console.error('Error updating auth metadata:', metadataError)
    }

    // 8. Lier le store_id dans le directory si création
    if (finalDirectoryId && storeData?.id) {
        await (supabase as any)
            .from('business_directory_tunisia')
            .update({ store_id: storeData.id })
            .eq('id', finalDirectoryId)
    }

    revalidatePath('/', 'layout')
    revalidatePath('/')

    // 9. Redirection
    if (storeData?.id) {
        redirect(`/dashboard/${storeData.id}`)
    } else {
        redirect('/')
    }
}
