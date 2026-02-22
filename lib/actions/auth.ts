'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }
    const supabase = createClient()
    const { error, data: authData } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return {
            error: error.message
        }

    }
    const role = authData.user?.user_metadata?.role || 'client'
    revalidatePath('/', 'layout')

    if (role === 'admin') {
        redirect('/admin/dashboard')
    } else if (role === 'business_owner' || role === 'PRO') {
        // Try to find the store associated with this user
        const { data: stores, error: storeError } = await supabase
            .from('stores')
            .select('id')
            .eq('owner_id', authData.user?.id)
            .maybeSingle()

        if (stores?.id) {
            console.log(`[Auth] Redirecting business owner ${authData.user?.id} to dashboard ${stores.id}`)
            redirect(`/dashboard/${stores.id}`)
        } else {
            console.warn(`[Auth] Business owner ${authData.user?.id} has no store yet. Redirecting to business addition.`)
            redirect('/business/add')
        }
    } else {
        redirect('/')
    }

}
export async function signup(formData: FormData) {
    const supabase = createClient()
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        confirmpassword: formData.get('confirmPassword') as string,
    }
    if (data.password !== data.confirmpassword) {
        return {
            error: "Passwords do not match"
        }
    }
    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: { role: 'client' }
        }
    })
    if (error) {
        return {
            error: error.message
        }
    }
    revalidatePath('/', 'layout')
    return {
        success: true,
        message: "Account created successfully! Please check your email to confirm your account."
    }
}
export async function signout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')

}