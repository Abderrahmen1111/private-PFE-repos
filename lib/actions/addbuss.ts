'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { mockBusinessDirectory } from '@/lib/mock-data'

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Date.now()
}

export async function searchBusinessDirectory(queryStr: string) {
    if (!queryStr || queryStr.length < 2) return [];

    const supabase = createClient();

    // Broaden search to include title, categoryName and vitrine_category
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

export async function addBusiness(formData: FormData) {
    const supabase = createClient()

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Vous devez être connecté pour ajouter un business.' }
    }

    // Extract form fields
    const name = formData.get('companyName') as string
    const email = formData.get('companyEmail') as string
    const rne = formData.get('rne') as string
    const website = formData.get('companyWebsite') as string
    const address = formData.get('companyAddress') as string
    const city = formData.get('location') as string
    const description = formData.get('description') as string
    const phone = formData.get('phone') as string
    const category = formData.get('category') as string
    const directoryId = formData.get('directoryId') as string // For linking to business_directory_tunisia

    // Validation
    if (!name || !email || !rne || !city || !phone || !category) {
        return { error: 'Veuillez remplir tous les champs obligatoires.' }
    }

    const slug = generateSlug(name)

    // Handle logo upload
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

    // 1. Ensure user exists in public.users and upgrade role to 'PRO'
    // This MUST happen before store insertion due to foreign key constraints
    const { error: userUpdateError } = await supabase
        .from('users')
        .upsert({
            id: user.id,
            role: 'PRO',
            updated_at: new Date().toISOString()
        })

    if (userUpdateError) {
        console.error('Error updating public user role:', userUpdateError)
        return { error: `Erreur lors de la mise à jour de l'utilisateur: ${userUpdateError.message}` }
    }

    // Insert into stores table
    const { data: storeData, error: insertError } = await supabase
        .from('stores')
        .insert({
            owner_id: user.id,
            name,
            slug,
            description: description || null,
            category: category as any,
            phone,
            email,
            website: website || null,
            address: address || '',
            latitude: 0,
            longitude: 0,
            city,
            logo_url: logoUrl,
            rne: rne,
            business_registration: rne,
            business_directory_id: directoryId ? parseInt(directoryId) : null,
            id_business: directoryId ? parseInt(directoryId) : null,
            status: 'PENDING',
        })
        .select('id')
        .single()

    if (insertError) {
        return { error: `Erreur lors de l'ajout: ${insertError.message}` }
    }

    // 2. Update auth metadata role to 'business_owner'
    const { error: metadataError } = await supabase.auth.updateUser({
        data: { role: 'business_owner' }
    })

    if (metadataError) {
        console.error('Error updating auth metadata:', metadataError)
    }

    revalidatePath('/', 'layout')
    revalidatePath('/')

    // Redirect to the new dynamic dashboard!
    if (storeData?.id) {
        redirect(`/dashboard/${storeData.id}`)
    } else {
        redirect('/')
    }
}
