export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            bookings: {
                Row: {
                    id: number
                    booking_number: string
                    item_id: number
                    customer_id: string
                    store_id: number
                    booking_date: string
                    start_time: string
                    end_time: string
                    duration_minutes: number
                    customer_name: string
                    customer_phone: string
                    customer_email: string | null
                    notes: string | null
                    price: number
                    status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
                    created_at: string | null
                    updated_at: string | null
                    confirmed_at: string | null
                    completed_at: string | null
                }
                Insert: {
                    id?: number
                    booking_number: string
                    item_id: number
                    customer_id: string
                    store_id: number
                    booking_date: string
                    start_time: string
                    end_time: string
                    duration_minutes: number
                    customer_name: string
                    customer_phone: string
                    customer_email?: string | null
                    notes?: string | null
                    price: number
                    status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
                    created_at?: string | null
                    updated_at?: string | null
                    confirmed_at?: string | null
                    completed_at?: string | null
                }
                Update: {
                    id?: number
                    booking_number?: string
                    item_id?: number
                    customer_id?: string
                    store_id?: number
                    booking_date?: string
                    start_time?: string
                    end_time?: string
                    duration_minutes?: number
                    customer_name?: string
                    customer_phone?: string
                    customer_email?: string | null
                    notes?: string | null
                    price?: number
                    status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
                    created_at?: string | null
                    updated_at?: string | null
                    confirmed_at?: string | null
                    completed_at?: string | null
                }
            }
            business_directory_tunisia: {
                Row: {
                    id: number
                    title: string
                    totalScore: number | null
                    reviewsCount: number | null
                    street: string | null
                    city: string
                    state: string | null
                    countryCode: string | null
                    website: string | null
                    phone: string | null
                    categories: string[] | null
                    url: string | null
                    categoryName: string | null
                    place_id: string | null
                    vitrine_category: string | null
                    full_address: string | null
                    latitude: number | null
                    longitude: number | null
                    is_claimed: boolean | null
                    claimed_at: string | null
                    claimed_by: string | null
                    store_id: number | null
                    scraped_at: string | null
                    last_updated: string | null
                    data_source: string | null
                    verified: boolean | null
                    business_status: string | null
                    description: string | null
                    opening_hours: Json | null
                    photos: string[] | null
                    tags: string[] | null
                }
                Insert: {
                    id?: number
                    title: string
                    totalScore?: number | null
                    reviewsCount?: number | null
                    street?: string | null
                    city: string
                    state?: string | null
                    countryCode?: string | null
                    website?: string | null
                    phone?: string | null
                    categories?: string[] | null
                    url?: string | null
                    categoryName?: string | null
                    place_id?: string | null
                    vitrine_category?: string | null
                    full_address?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    is_claimed?: boolean | null
                    claimed_at?: string | null
                    claimed_by?: string | null
                    store_id?: number | null
                    scraped_at?: string | null
                    last_updated?: string | null
                    data_source?: string | null
                    verified?: boolean | null
                    business_status?: string | null
                    description?: string | null
                    opening_hours?: Json | null
                    photos?: string[] | null
                    tags?: string[] | null
                }
                Update: {
                    id?: number
                    title?: string
                    totalScore?: number | null
                    reviewsCount?: number | null
                    street?: string | null
                    city?: string
                    state?: string | null
                    countryCode?: string | null
                    website?: string | null
                    phone?: string | null
                    categories?: string[] | null
                    url?: string | null
                    categoryName?: string | null
                    place_id?: string | null
                    vitrine_category?: string | null
                    full_address?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    is_claimed?: boolean | null
                    claimed_at?: string | null
                    claimed_by?: string | null
                    store_id?: number | null
                    scraped_at?: string | null
                    last_updated?: string | null
                    data_source?: string | null
                    verified?: boolean | null
                    business_status?: string | null
                    description?: string | null
                    opening_hours?: Json | null
                    photos?: string[] | null
                    tags?: string[] | null
                }
            }
            items: {
                Row: {
                    id: number
                    store_id: number
                    item_type: 'PRODUCT' | 'SERVICE'
                    name: string
                    slug: string
                    description: string | null
                    price: number
                    price_unit: string
                    stock_quantity: number | null
                    duration_minutes: number | null
                    is_bookable: boolean | null
                    available_days: Json | null
                    status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'ARCHIVED'
                    main_image: string
                    image_2: string | null
                    image_3: string | null
                    view_count: number | null
                    order_count: number | null
                    booking_count: number | null
                    rating_average: number | null
                    total_reviews: number | null
                    embedding: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: number
                    store_id: number
                    item_type?: 'PRODUCT' | 'SERVICE'
                    name: string
                    slug: string
                    description?: string | null
                    price: number
                    price_unit?: string
                    stock_quantity?: number | null
                    duration_minutes?: number | null
                    is_bookable?: boolean | null
                    available_days?: Json | null
                    status?: 'AVAILABLE' | 'OUT_OF_STOCK' | 'ARCHIVED'
                    main_image: string
                    image_2?: string | null
                    image_3?: string | null
                    view_count?: number | null
                    order_count?: number | null
                    booking_count?: number | null
                    rating_average?: number | null
                    total_reviews?: number | null
                    embedding?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: number
                    store_id?: number
                    item_type?: 'PRODUCT' | 'SERVICE'
                    name?: string
                    slug?: string
                    description?: string | null
                    price?: number
                    price_unit?: string
                    stock_quantity?: number | null
                    duration_minutes?: number | null
                    is_bookable?: boolean | null
                    available_days?: Json | null
                    status?: 'AVAILABLE' | 'OUT_OF_STOCK' | 'ARCHIVED'
                    main_image?: string
                    image_2?: string | null
                    image_3?: string | null
                    view_count?: number | null
                    order_count?: number | null
                    booking_count?: number | null
                    rating_average?: number | null
                    total_reviews?: number | null
                    embedding?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            orders: {
                Row: {
                    id: number
                    order_number: string
                    customer_id: string | null
                    store_id: number
                    item_id: number | null
                    quantity: number
                    unit_price: number
                    total_price: number
                    customer_name: string
                    customer_phone: string
                    customer_email: string | null
                    delivery_address: string
                    customer_notes: string | null
                    vendor_notes: string | null
                    status: 'PENDING' | 'VALIDATED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
                    tracking_code: string | null
                    created_at: string | null
                    updated_at: string | null
                    validated_at: string | null
                    completed_at: string | null
                }
                Insert: {
                    id?: number
                    order_number: string
                    customer_id?: string | null
                    store_id: number
                    item_id?: number | null
                    quantity?: number
                    unit_price: number
                    total_price: number
                    customer_name: string
                    customer_phone: string
                    customer_email?: string | null
                    delivery_address: string
                    customer_notes?: string | null
                    vendor_notes?: string | null
                    status?: 'PENDING' | 'VALIDATED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
                    tracking_code?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    validated_at?: string | null
                    completed_at?: string | null
                }
                Update: {
                    id?: number
                    order_number?: string
                    customer_id?: string | null
                    store_id?: number
                    item_id?: number | null
                    quantity?: number
                    unit_price?: number
                    total_price?: number
                    customer_name?: string
                    customer_phone?: string
                    customer_email?: string | null
                    delivery_address?: string
                    customer_notes?: string | null
                    vendor_notes?: string | null
                    status?: 'PENDING' | 'VALIDATED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
                    tracking_code?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    validated_at?: string | null
                    completed_at?: string | null
                }
            }
            reviews: {
                Row: {
                    id: number
                    author_id: string
                    item_id: number | null
                    store_id: number
                    order_id: number | null
                    booking_id: number | null
                    rating: number
                    title: string | null
                    comment: string
                    image_1: string | null
                    image_2: string | null
                    is_verified: boolean | null
                    qr_token: string | null
                    qr_scanned_at: string | null
                    sentiment_score: number | null
                    sentiment_label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | null
                    vendor_response: string | null
                    vendor_response_ai_suggestion: string | null
                    responded_at: string | null
                    is_approved: boolean | null
                    is_spam: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: number
                    author_id: string
                    item_id?: number | null
                    store_id: number
                    order_id?: number | null
                    booking_id?: number | null
                    rating: number
                    title?: string | null
                    comment: string
                    image_1?: string | null
                    image_2?: string | null
                    is_verified?: boolean | null
                    qr_token?: string | null
                    qr_scanned_at?: string | null
                    sentiment_score?: number | null
                    sentiment_label?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | null
                    vendor_response?: string | null
                    vendor_response_ai_suggestion?: string | null
                    responded_at?: string | null
                    is_approved?: boolean | null
                    is_spam?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: number
                    author_id?: string
                    item_id?: number | null
                    store_id?: number
                    order_id?: number | null
                    booking_id?: number | null
                    rating?: number
                    title?: string | null
                    comment?: string
                    image_1?: string | null
                    image_2?: string | null
                    is_verified?: boolean | null
                    qr_token?: string | null
                    qr_scanned_at?: string | null
                    sentiment_score?: number | null
                    sentiment_label?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | null
                    vendor_response?: string | null
                    vendor_response_ai_suggestion?: string | null
                    responded_at?: string | null
                    is_approved?: boolean | null
                    is_spam?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
            }
            service_schedules: {
                Row: {
                    id: number
                    item_id: number
                    day_of_week: number
                    start_time: string
                    end_time: string
                    max_bookings: number | null
                    is_active: boolean | null
                    created_at: string | null
                }
                Insert: {
                    id?: number
                    item_id: number
                    day_of_week: number
                    start_time: string
                    end_time: string
                    max_bookings?: number | null
                    is_active?: boolean | null
                    created_at?: string | null
                }
                Update: {
                    id?: number
                    item_id?: number
                    day_of_week?: number
                    start_time?: string
                    end_time?: string
                    max_bookings?: number | null
                    is_active?: boolean | null
                    created_at?: string | null
                }
            }
            stores: {
                Row: {
                    id: number
                    owner_id: string
                    name: string
                    slug: string
                    description: string | null
                    category: 'RESTAURANT' | 'PHARMACY' | 'BOUTIQUE' | 'SERVICE' | 'OTHER'
                    phone: string
                    email: string | null
                    website: string | null
                    address: string
                    latitude: number
                    longitude: number
                    city: string
                    logo_url: string | null
                    banner_url: string | null
                    status: 'PENDING' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'
                    business_license_url: string | null
                    id_card_url: string | null
                    verification_notes: string | null
                    rating_average: number | null
                    total_reviews: number | null
                    total_orders: number | null
                    view_count: number | null
                    sentiment_positive_percent: number | null
                    created_at: string | null
                    updated_at: string | null
                    verified_at: string | null
                    business_directory_id: number | null
                    business_registration: string | null
                    rne: string | null
                    id_business: number | null
                    opening_hours: Json | null
                    gallery: Json | null
                    service_id: number | null
                }
                Insert: {
                    id?: number
                    owner_id: string
                    name: string
                    slug: string
                    description?: string | null
                    category?: 'RESTAURANT' | 'PHARMACY' | 'BOUTIQUE' | 'SERVICE' | 'OTHER'
                    phone: string
                    email?: string | null
                    website?: string | null
                    address: string
                    latitude: number
                    longitude: number
                    city: string
                    logo_url?: string | null
                    banner_url?: string | null
                    status?: 'PENDING' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'
                    business_license_url?: string | null
                    id_card_url?: string | null
                    verification_notes?: string | null
                    rating_average?: number | null
                    total_reviews?: number | null
                    total_orders?: number | null
                    view_count?: number | null
                    sentiment_positive_percent?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                    verified_at?: string | null
                    business_directory_id?: number | null
                    business_registration?: string | null
                    rne?: string | null
                    id_business?: number | null
                    opening_hours?: Json | null
                }
                Update: {
                    id?: number
                    owner_id?: string
                    name?: string
                    slug?: string
                    description?: string | null
                    category?: 'RESTAURANT' | 'PHARMACY' | 'BOUTIQUE' | 'SERVICE' | 'OTHER'
                    phone?: string
                    email?: string | null
                    website?: string | null
                    address?: string
                    latitude?: number
                    longitude?: number
                    city?: string
                    logo_url?: string | null
                    banner_url?: string | null
                    status?: 'PENDING' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'
                    business_license_url?: string | null
                    id_card_url?: string | null
                    verification_notes?: string | null
                    rating_average?: number | null
                    total_reviews?: number | null
                    total_orders?: number | null
                    view_count?: number | null
                    sentiment_positive_percent?: number | null
                    created_at?: string | null
                    updated_at?: string | null
                    verified_at?: string | null
                    business_directory_id?: number | null
                    business_registration?: string | null
                    rne?: string | null
                    id_business?: number | null
                    opening_hours?: Json | null
                }
            }
            stories: {
                Row: {
                    id: number
                    store_id: number
                    author_id: string | null
                    media_url: string
                    media_type: 'image' | 'video'
                    caption: string | null
                    views_count: number
                    is_approved: boolean
                    expires_at: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    store_id: number
                    author_id?: string | null
                    media_url: string
                    media_type?: 'image' | 'video'
                    caption?: string | null
                    views_count?: number
                    is_approved?: boolean
                    expires_at?: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    store_id?: number
                    author_id?: string | null
                    media_url?: string
                    media_type?: 'image' | 'video'
                    caption?: string | null
                    views_count?: number
                    is_approved?: boolean
                    expires_at?: string
                    created_at?: string
                }
            }
            support_tickets: {
                Row: {
                    id: string
                    ticket_number: number
                    store_id: number
                    customer_id: string | null
                    customer_name: string | null
                    subject: string
                    priority: 'low' | 'medium' | 'high' | 'critical'
                    status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
                    channel: 'chat' | 'email' | 'phone'
                    assigned_to: string | null
                    created_at: string
                    updated_at: string
                    last_reply_at: string
                }
                Insert: {
                    id?: string
                    ticket_number?: number
                    store_id: number
                    customer_id?: string | null
                    customer_name?: string | null
                    subject: string
                    priority?: 'low' | 'medium' | 'high' | 'critical'
                    status?: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
                    channel?: 'chat' | 'email' | 'phone'
                    assigned_to?: string | null
                    created_at?: string
                    updated_at?: string
                    last_reply_at?: string
                }
                Update: {
                    id?: string
                    ticket_number?: number
                    store_id?: number
                    customer_id?: string | null
                    customer_name?: string | null
                    subject?: string
                    priority?: 'low' | 'medium' | 'high' | 'critical'
                    status?: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
                    channel?: 'chat' | 'email' | 'phone'
                    assigned_to?: string | null
                    created_at?: string
                    updated_at?: string
                    last_reply_at?: string
                }
            }
            support_messages: {
                Row: {
                    id: string
                    ticket_id: string
                    sender_id: string | null
                    sender_type: 'customer' | 'support'
                    content: string
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    ticket_id: string
                    sender_id?: string | null
                    sender_type: 'customer' | 'support'
                    content: string
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    ticket_id?: string
                    sender_id?: string | null
                    sender_type?: 'customer' | 'support'
                    content?: string
                    is_read?: boolean
                    created_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    transaction_code: string
                    order_number: string
                    booking_id: number | null
                    customer_id: string | null
                    customer_name: string | null
                    merchant_id: number | null
                    merchant_number: string | null
                    merchant_name: string | null
                    driver_name: string | null
                    drop_location: string | null
                    amount: number
                    fee: number | null
                    status: 'pending' | 'completed' | 'cancelled' | 'refunded'
                    type: 'payment' | 'payout' | 'refund'
                    date: string | null
                    time_created: string | null
                    time_accepted: string | null
                    collection_time: string | null
                    pickup_time: string | null
                    time_delivered: string | null
                    wait_duration_minutes: number | null
                    delivery_duration_minutes: number | null
                    km: number | null
                    qr_code_token: string | null
                }
                Insert: {
                    id?: string
                    transaction_code: string
                    order_number: string
                    booking_id?: number | null
                    customer_id?: string | null
                    customer_name?: string | null
                    merchant_id?: number | null
                    merchant_number?: string | null
                    merchant_name?: string | null
                    driver_name?: string | null
                    drop_location?: string | null
                    amount: number
                    fee?: number | null
                    status?: 'pending' | 'completed' | 'cancelled' | 'refunded'
                    type?: 'payment' | 'payout' | 'refund'
                    date?: string | null
                    time_created?: string | null
                    time_accepted?: string | null
                    collection_time?: string | null
                    pickup_time?: string | null
                    time_delivered?: string | null
                    wait_duration_minutes?: number | null
                    delivery_duration_minutes?: number | null
                    km?: number | null
                    qr_code_token?: string | null
                }
                Update: {
                    id?: string
                    transaction_code?: string
                    order_number?: string
                    booking_id?: number | null
                    customer_id?: string | null
                    customer_name?: string | null
                    merchant_id?: number | null
                    merchant_number?: string | null
                    merchant_name?: string | null
                    driver_name?: string | null
                    drop_location?: string | null
                    amount?: number
                    fee?: number | null
                    status?: 'pending' | 'completed' | 'cancelled' | 'refunded'
                    type?: 'payment' | 'payout' | 'refund'
                    date?: string | null
                    time_created?: string | null
                    time_accepted?: string | null
                    collection_time?: string | null
                    pickup_time?: string | null
                    time_delivered?: string | null
                    wait_duration_minutes?: number | null
                    delivery_duration_minutes?: number | null
                    km?: number | null
                    qr_code_token?: string | null
                }
            }
            users: {
                Row: {
                    id: string
                    role: 'CLIENT' | 'PRO' | 'ADMIN'
                    full_name: string | null
                    phone: string | null
                    avatar_url: string | null
                    latitude: number | null
                    longitude: number | null
                    city: string | null
                    address: string | null
                    created_at: string | null
                    updated_at: string | null
                    email: string | null
                    status: string | null
                }
                Insert: {
                    id: string
                    role?: 'CLIENT' | 'PRO' | 'ADMIN'
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    city?: string | null
                    address?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    email?: string | null
                    status?: string | null
                }
                Update: {
                    id?: string
                    role?: 'CLIENT' | 'PRO' | 'ADMIN'
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    city?: string | null
                    address?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    email?: string | null
                    status?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            booking_status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
            item_status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'ARCHIVED'
            item_type: 'PRODUCT' | 'SERVICE'
            order_status: 'PENDING' | 'VALIDATED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'
            sentiment_label: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
            store_category: 'RESTAURANT' | 'PHARMACY' | 'BOUTIQUE' | 'SERVICE' | 'OTHER'
            store_status: 'PENDING' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'
            user_role: 'CLIENT' | 'PRO' | 'ADMIN'
            support_ticket_priority: 'low' | 'medium' | 'high' | 'critical'
            support_ticket_status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
            support_ticket_channel: 'chat' | 'email' | 'phone'
            transaction_status: 'pending' | 'completed' | 'failed' | 'refunded'
            transaction_type: 'payment' | 'payout' | 'refund'
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
