import { createClient } from "./client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function subscribeToChannel(
    table: string,
    callback:(payload : any) => void 
) : RealtimeChannel{
    const supabase = createClient()
    return supabase
    .channel(`public:${table}`)
    .on('postgres_changes',
        {event:'*' , schema:'public', table},
        callback
    )
    .subscribe()
}
export function unsubscribeFromChannel(channel : RealtimeChannel){
    const supabase = createClient()
    supabase.removeChannel(channel)
}