'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Ensure a user record exists in public.users table (called after auth signup)
 * This is a safety net in case the trigger doesn't fire
 */
export async function ensureUserExists(userId: string, email: string, fullName?: string) {
    const supabase = createClient()
    
    // Try to get the user first
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()
    
    // If user doesn't exist, create them
    if (!existingUser) {
        const { error } = await supabase
            .from('users')
            .insert({
                id: userId,
                email,
                full_name: fullName || email.split('@')[0],
                role: 'CLIENT',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        
        if (error) {
            console.error('[users] Failed to ensure user exists:', error)
            return { error: error.message }
        }
    }
    
    return { success: true }
}

export async function getUserProfile(userId : string){
    const supabase = createClient()
    const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
    return {data , error }
}
export async function updateProfile(userId:string , updates:{
    full_name?:string,
    phone?:string,
    city?:string,
    avatar_url?:string,
    date_of_birth?:string,
    gender?:string,
    bio?:string,
    two_factor_enabled?: boolean,
    email_notifications_enabled?: boolean,
    login_alerts_enabled?: boolean
}){
        console.log('[users] updateProfile called with:', { userId, updates });
        
        const supabase = createClient()
        const { data , error} = await (supabase as any)
        .from('users')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id',userId)
        .select('*')
        .single()
        
        if (error) {
            console.error('[users] updateProfile error:', error);
        } else {
            console.log('[users] updateProfile success, returned data:', data);
        }
        
        if(!error){
            revalidatePath('/')
            revalidatePath('/profile/user')
            revalidatePath('/profile/businessOwner')
        }
        return {data , error}
}
/**
 * Upload profile photo to `avatars` bucket and save `users.avatar_url`.
 * Uses FormData so the file serializes reliably from Client Components (Next.js server actions).
 * The authenticated user is always the target — do not pass user id from the client.
 */
export async function updateAvatar(formData: FormData) {
    const supabase = createClient()
    const {
        data: { user: authUser },
        error: authError,
    } = await supabase.auth.getUser()
    if (authError || !authUser) {
        return { error: 'Non authentifié.' }
    }

    const file = formData.get('file') as File | null
    if (!file || typeof (file as any).arrayBuffer !== 'function' || file.size === 0) {
        return { error: 'Aucune image valide fournie.' }
    }

    const ext =
        (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'jpg'
    const objectPath = `${authUser.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(objectPath, file, {
            contentType: file.type || 'image/jpeg',
            upsert: false,
        })

    if (uploadError) {
        return { error: uploadError.message }
    }

    const {
        data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(objectPath)

    const { data, error } = await (supabase as any)
        .from('users')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', authUser.id)
        .select('id, avatar_url')
        .single()

    if (!error) {
        // Also sync avatar_url back to auth user metadata
        await supabase.auth.updateUser({
            data: { avatar_url: publicUrl }
        }).catch(err => {
            console.warn('[users] Failed to sync avatar to auth metadata:', err)
            // Don't return error here - the database update succeeded
        })
        
        revalidatePath('/')
        revalidatePath('/profile/user')
        revalidatePath('/profile/businessOwner')
    }
    return { data, error }
}
export async function deleteAccount(userId: string) {
    const supabase = createClient()
    // Temporarily cast the RPC name to the expected union until DB types include this function
    const { error } = await supabase.rpc(("delete_user_account" as unknown) as any, { user_id: userId } as any)
    if (error) {
        return { error: error.message }
    }
    return { success: true }
}