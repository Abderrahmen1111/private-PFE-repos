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
        redirect('/')
    } else {
        redirect('/')
    }

}
export async function signup(formData: FormData) {
    const supabase = createClient()
    const data = {
        full_name: formData.get('fullName') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        confirmpassword: formData.get('confirmPassword') as string,
    }
    if (data.password !== data.confirmpassword) {
        return {
            error: "Passwords do not match"
        }
    }
    const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: { role: 'client', full_name: data.full_name }
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
export async function sendLoginMagicLink(formData: FormData) {
    const email = formData.get('email') as string
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: false,
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function sendSignupMagicLink(formData: FormData) {
    const email = formData.get('email') as string
    const fullName = formData.get('fullName') as string
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true,
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            data: {
                full_name: fullName,
                role: 'client',
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function signout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')

}