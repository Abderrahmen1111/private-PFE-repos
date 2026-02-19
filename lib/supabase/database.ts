import { createClient }  from './server'
export async function query<T>(
    table: "bookings" | "users" | "items" | "stores" | "orders" | "reviews" | "service_schedules" | "spatial_ref_sys" | "subscriptions" | "products_only" | "services_only" | "services_with_schedules" | "active_stores_with_stats" | "geography_columns" | "geometry_columns",
    options?:{
        select?:string
        filters?: Record<string , any>
        order?:{column : string , ascending?: boolean}
        limit?:number
    }
){
    const supabase = createClient()
    let query = supabase.from(table as any).select(options?.select|| '*')
    if (options?.filters)
        {
            Object.entries(options.filters).forEach(([key, value]) =>
            {
                query = query.eq(key , value)
            }) 
        }
    if (options?.order){
        query = query.order(options.order.column , {
            ascending : options.order.ascending ?? false,
        })
    }
    if (options?.limit){
        query = query.limit(options.limit)
    }
    return await query
}