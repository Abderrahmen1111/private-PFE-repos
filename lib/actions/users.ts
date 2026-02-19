import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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
    gender?:string}){
        const supabase = createClient()
        const { data , error} = await supabase 
        .from('users')
        .update(updates)
        .eq('id',userId)
        .single()
        if(!error){
            revalidatePath('/')
        }
        return {data , error}
}
export async function updateAvatar(userId: string , file: File){
    const supabase = createClient()
    const filename = `${userId}/${Date.now()}_${file.name}`
    const { data : uploadData , error : uploadError} = await supabase.storage
    .from('avatars')
    .upload(filename,file)
    if(uploadError){
        return {error : uploadError.message}
    }
    const {data:{publicUrl} } = supabase.storage
    .from('avatars')
    .getPublicUrl(filename)
    const { data , error} = await supabase
    .from('users')
    .update({avatar_url : publicUrl})
    .eq('id',userId)
    .single()
    if(!error){
        revalidatePath('/')
    }
    return {data , error}
}
export async function deleteAccount(userId: string) {
    const supabase = createClient()
    // Temporarily cast the RPC name to the expected union until DB types include this function
    const { error } = await supabase.rpc(("delete_user_account" as unknown) as any, { user_id: userId })
    if (error) {
        return { error: error.message }
    }
    return { success: true }
}