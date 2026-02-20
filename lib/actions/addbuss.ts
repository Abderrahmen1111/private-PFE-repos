'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
    const { data, error } = await supabase
        .from('business_directory_tunisia' as any)
        .select('id, business_name, city, is_claimed')
        .ilike('business_name', `%${queryStr}%`)
        .limit(5);

    if (error) {
        console.error('Search error:', error);
        return [];
    }

    return data;
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

    // Insert into stores table
    const { error: insertError } = await supabase
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
            business_registration: rne,
            status: 'PENDING',
        })

    if (insertError) {
        return { error: `Erreur lors de l'ajout: ${insertError.message}` }
    }

    // Upgrade user role to business owner
    // 1. Update public.users role to 'PRO'
    const { error: userUpdateError } = await supabase
        .from('users')
        .update({ role: 'PRO' })
        .eq('id', user.id)

    if (userUpdateError) {
        console.error('Error updating public user role:', userUpdateError)
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
    redirect('/')
}
