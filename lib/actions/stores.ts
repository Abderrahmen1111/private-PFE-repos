'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/supabase'

type Store = Database['public']['Tables']['stores']['Row']

export async function getStoreById(id: number) {
    const supabase = createClient() as any

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching store:', error)
        return { error: error.message }
    }

    return { data: data as Store }
}

export async function getStoreByBusinessId(businessId: number) {
    const supabase = createClient() as any

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id_business', businessId)
        .maybeSingle()

    if (error) {
        console.error('Error fetching store by business ID:', error)
        return { error: error.message }
    }

    // If not found, maybe the businessId IS the store id (fallback)
    if (!data) {
        return getStoreById(businessId)
    }

    return { data: data as Store }
}

export async function updateStoreProfile(id: number, data: any) {
    const supabase = createClient() as any

    const { error } = await supabase
        .from('stores')
        .update({
            name: data.name,
            description: data.description,
            category: data.category?.toUpperCase() as any, // Match enum case
            phone: data.phone,
            address: data.address,
            logo_url: data.image, // Mapping image to logo_url for now
            opening_hours: data.workingHours,
            gallery: data.gallery || [],
            updated_at: new Date().toISOString()
        } as any)
        .eq('id', id)

    if (error) {
        console.error('Error updating store:', error)
        return { error: error.message }
    }

    revalidatePath(`/dashboard/${id}/profile`)
    revalidatePath(`/business/${id}`)

    return { success: true }
}
