export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      auth_group: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      auth_group_permissions: {
        Row: {
          group_id: number
          id: number
          permission_id: number
        }
        Insert: {
          group_id: number
          id?: number
          permission_id: number
        }
        Update: {
          group_id?: number
          id?: number
          permission_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "auth_group_permissio_permission_id_84c5c92e_fk_auth_perm"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "auth_permission"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auth_group_permissions_group_id_b120cbf9_fk_auth_group_id"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "auth_group"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_permission: {
        Row: {
          codename: string
          content_type_id: number
          id: number
          name: string
        }
        Insert: {
          codename: string
          content_type_id: number
          id?: number
          name: string
        }
        Update: {
          codename?: string
          content_type_id?: number
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "auth_permission_content_type_id_2f476e4b_fk_django_co"
            columns: ["content_type_id"]
            isOneToOne: false
            referencedRelation: "django_content_type"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_user: {
        Row: {
          date_joined: string
          email: string
          first_name: string
          id: number
          is_active: boolean
          is_staff: boolean
          is_superuser: boolean
          last_login: string | null
          last_name: string
          password: string
          username: string
        }
        Insert: {
          date_joined: string
          email: string
          first_name: string
          id?: number
          is_active: boolean
          is_staff: boolean
          is_superuser: boolean
          last_login?: string | null
          last_name: string
          password: string
          username: string
        }
        Update: {
          date_joined?: string
          email?: string
          first_name?: string
          id?: number
          is_active?: boolean
          is_staff?: boolean
          is_superuser?: boolean
          last_login?: string | null
          last_name?: string
          password?: string
          username?: string
        }
        Relationships: []
      }
      auth_user_groups: {
        Row: {
          group_id: number
          id: number
          user_id: number
        }
        Insert: {
          group_id: number
          id?: number
          user_id: number
        }
        Update: {
          group_id?: number
          id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "auth_user_groups_group_id_97559544_fk_auth_group_id"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "auth_group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auth_user_groups_user_id_6a12ed8b_fk_auth_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_user"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_user_user_permissions: {
        Row: {
          id: number
          permission_id: number
          user_id: number
        }
        Insert: {
          id?: number
          permission_id: number
          user_id: number
        }
        Update: {
          id?: number
          permission_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "auth_permission"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_user"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          clicks: number | null
          conversion_rate: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: number
          image_url: string | null
          impressions: number | null
          placement: string
          priority: number | null
          start_date: string
          status: string
          store_id: number
          target_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          clicks?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: number
          image_url?: string | null
          impressions?: number | null
          placement: string
          priority?: number | null
          start_date: string
          status?: string
          store_id: number
          target_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          clicks?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: number
          image_url?: string | null
          impressions?: number | null
          placement?: string
          priority?: number | null
          start_date?: string
          status?: string
          store_id?: number
          target_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banners_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banners_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          booking_number: string
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          customer_email: string | null
          customer_id: string
          customer_name: string
          customer_phone: string
          duration_minutes: number
          end_time: string
          id: number
          item_id: number
          notes: string | null
          price: number
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          store_id: number
          updated_at: string | null
        }
        Insert: {
          booking_date: string
          booking_number: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id: string
          customer_name: string
          customer_phone: string
          duration_minutes: number
          end_time: string
          id?: number
          item_id: number
          notes?: string | null
          price: number
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          store_id: number
          updated_at?: string | null
        }
        Update: {
          booking_date?: string
          booking_number?: string
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string
          customer_name?: string
          customer_phone?: string
          duration_minutes?: number
          end_time?: string
          id?: number
          item_id?: number
          notes?: string | null
          price?: number
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          store_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "products_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "services_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "services_with_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      business_directory_tunisia: {
        Row: {
          business_status: string | null
          categories: string[] | null
          categoryName: string | null
          city: string
          claimed_at: string | null
          claimed_by: string | null
          countryCode: string | null
          data_source: string | null
          description: string | null
          full_address: string | null
          id: number
          is_claimed: boolean | null
          last_updated: string | null
          latitude: number | null
          longitude: number | null
          opening_hours: Json | null
          phone: string | null
          photos: string[] | null
          place_id: string | null
          reviewsCount: number | null
          scraped_at: string | null
          state: string | null
          store_id: number | null
          street: string | null
          tags: string[] | null
          title: string
          totalScore: number | null
          url: string | null
          verified: boolean | null
          vitrine_category: string | null
          website: string | null
        }
        Insert: {
          business_status?: string | null
          categories?: string[] | null
          categoryName?: string | null
          city: string
          claimed_at?: string | null
          claimed_by?: string | null
          countryCode?: string | null
          data_source?: string | null
          description?: string | null
          full_address?: string | null
          id?: number
          is_claimed?: boolean | null
          last_updated?: string | null
          latitude?: number | null
          longitude?: number | null
          opening_hours?: Json | null
          phone?: string | null
          photos?: string[] | null
          place_id?: string | null
          reviewsCount?: number | null
          scraped_at?: string | null
          state?: string | null
          store_id?: number | null
          street?: string | null
          tags?: string[] | null
          title: string
          totalScore?: number | null
          url?: string | null
          verified?: boolean | null
          vitrine_category?: string | null
          website?: string | null
        }
        Update: {
          business_status?: string | null
          categories?: string[] | null
          categoryName?: string | null
          city?: string
          claimed_at?: string | null
          claimed_by?: string | null
          countryCode?: string | null
          data_source?: string | null
          description?: string | null
          full_address?: string | null
          id?: number
          is_claimed?: boolean | null
          last_updated?: string | null
          latitude?: number | null
          longitude?: number | null
          opening_hours?: Json | null
          phone?: string | null
          photos?: string[] | null
          place_id?: string | null
          reviewsCount?: number | null
          scraped_at?: string | null
          state?: string | null
          store_id?: number | null
          street?: string | null
          tags?: string[] | null
          title?: string
          totalScore?: number | null
          url?: string | null
          verified?: boolean | null
          vitrine_category?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_directory_tunisia_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      django_admin_log: {
        Row: {
          action_flag: number
          action_time: string
          change_message: string
          content_type_id: number | null
          id: number
          object_id: string | null
          object_repr: string
          user_id: number
        }
        Insert: {
          action_flag: number
          action_time: string
          change_message: string
          content_type_id?: number | null
          id?: number
          object_id?: string | null
          object_repr: string
          user_id: number
        }
        Update: {
          action_flag?: number
          action_time?: string
          change_message?: string
          content_type_id?: number | null
          id?: number
          object_id?: string | null
          object_repr?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "django_admin_log_content_type_id_c4bce8eb_fk_django_co"
            columns: ["content_type_id"]
            isOneToOne: false
            referencedRelation: "django_content_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "django_admin_log_user_id_c564eba6_fk_auth_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth_user"
            referencedColumns: ["id"]
          },
        ]
      }
      django_content_type: {
        Row: {
          app_label: string
          id: number
          model: string
        }
        Insert: {
          app_label: string
          id?: number
          model: string
        }
        Update: {
          app_label?: string
          id?: number
          model?: string
        }
        Relationships: []
      }
      django_migrations: {
        Row: {
          app: string
          applied: string
          id: number
          name: string
        }
        Insert: {
          app: string
          applied: string
          id?: number
          name: string
        }
        Update: {
          app?: string
          applied?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      django_session: {
        Row: {
          expire_date: string
          session_data: string
          session_key: string
        }
        Insert: {
          expire_date: string
          session_data: string
          session_key: string
        }
        Update: {
          expire_date?: string
          session_data?: string
          session_key?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          acceptance_rate: number | null
          account_holder: string | null
          account_number: string | null
          address: string | null
          avg_delivery_time_minutes: number | null
          background_check_expiry_date: string | null
          background_check_status: string | null
          background_check_verified_at: string | null
          bank_name: string | null
          city: string | null
          completion_rate: number | null
          country: string | null
          created_at: string | null
          current_address: string | null
          current_lat: number | null
          current_lng: number | null
          earnings_this_month: number | null
          earnings_this_week: number | null
          email: string
          id: string
          id_expiry_date: string | null
          id_status: string | null
          id_verified_at: string | null
          insurance_expiry_date: string | null
          insurance_status: string | null
          insurance_verified_at: string | null
          join_date: string | null
          last_active: string | null
          last_payout_date: string | null
          license_expiry_date: string | null
          license_status: string | null
          license_verified_at: string | null
          location_updated_at: string | null
          name: string
          phone: string
          postal_code: string | null
          rating: number | null
          registration_expiry_date: string | null
          registration_status: string | null
          registration_verified_at: string | null
          status: string | null
          total_deliveries: number | null
          total_earnings: number | null
          updated_at: string | null
          vehicle_capacity_kg: number | null
          vehicle_last_inspection: string | null
          vehicle_license_plate: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_status: string | null
          vehicle_type: string | null
          vehicle_year: number | null
        }
        Insert: {
          acceptance_rate?: number | null
          account_holder?: string | null
          account_number?: string | null
          address?: string | null
          avg_delivery_time_minutes?: number | null
          background_check_expiry_date?: string | null
          background_check_status?: string | null
          background_check_verified_at?: string | null
          bank_name?: string | null
          city?: string | null
          completion_rate?: number | null
          country?: string | null
          created_at?: string | null
          current_address?: string | null
          current_lat?: number | null
          current_lng?: number | null
          earnings_this_month?: number | null
          earnings_this_week?: number | null
          email: string
          id?: string
          id_expiry_date?: string | null
          id_status?: string | null
          id_verified_at?: string | null
          insurance_expiry_date?: string | null
          insurance_status?: string | null
          insurance_verified_at?: string | null
          join_date?: string | null
          last_active?: string | null
          last_payout_date?: string | null
          license_expiry_date?: string | null
          license_status?: string | null
          license_verified_at?: string | null
          location_updated_at?: string | null
          name: string
          phone: string
          postal_code?: string | null
          rating?: number | null
          registration_expiry_date?: string | null
          registration_status?: string | null
          registration_verified_at?: string | null
          status?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          vehicle_capacity_kg?: number | null
          vehicle_last_inspection?: string | null
          vehicle_license_plate?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_status?: string | null
          vehicle_type?: string | null
          vehicle_year?: number | null
        }
        Update: {
          acceptance_rate?: number | null
          account_holder?: string | null
          account_number?: string | null
          address?: string | null
          avg_delivery_time_minutes?: number | null
          background_check_expiry_date?: string | null
          background_check_status?: string | null
          background_check_verified_at?: string | null
          bank_name?: string | null
          city?: string | null
          completion_rate?: number | null
          country?: string | null
          created_at?: string | null
          current_address?: string | null
          current_lat?: number | null
          current_lng?: number | null
          earnings_this_month?: number | null
          earnings_this_week?: number | null
          email?: string
          id?: string
          id_expiry_date?: string | null
          id_status?: string | null
          id_verified_at?: string | null
          insurance_expiry_date?: string | null
          insurance_status?: string | null
          insurance_verified_at?: string | null
          join_date?: string | null
          last_active?: string | null
          last_payout_date?: string | null
          license_expiry_date?: string | null
          license_status?: string | null
          license_verified_at?: string | null
          location_updated_at?: string | null
          name?: string
          phone?: string
          postal_code?: string | null
          rating?: number | null
          registration_expiry_date?: string | null
          registration_status?: string | null
          registration_verified_at?: string | null
          status?: string | null
          total_deliveries?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          vehicle_capacity_kg?: number | null
          vehicle_last_inspection?: string | null
          vehicle_license_plate?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_status?: string | null
          vehicle_type?: string | null
          vehicle_year?: number | null
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string | null
          friend_id: string
          id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          available_days: Json | null
          booking_count: number | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          embedding: string | null
          id: number
          image_2: string | null
          image_3: string | null
          is_bookable: boolean | null
          item_type: Database["public"]["Enums"]["item_type"]
          main_image: string
          name: string
          order_count: number | null
          price: number
          price_unit: string
          rating_average: number | null
          slug: string
          status: Database["public"]["Enums"]["item_status"]
          stock_quantity: number | null
          store_id: number | null
          total_reviews: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          available_days?: Json | null
          booking_count?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          embedding?: string | null
          id?: number
          image_2?: string | null
          image_3?: string | null
          is_bookable?: boolean | null
          item_type?: Database["public"]["Enums"]["item_type"]
          main_image?: string
          name: string
          order_count?: number | null
          price: number
          price_unit?: string
          rating_average?: number | null
          slug: string
          status?: Database["public"]["Enums"]["item_status"]
          stock_quantity?: number | null
          store_id?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          available_days?: Json | null
          booking_count?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          embedding?: string | null
          id?: number
          image_2?: string | null
          image_3?: string | null
          is_bookable?: boolean | null
          item_type?: Database["public"]["Enums"]["item_type"]
          main_image?: string
          name?: string
          order_count?: number | null
          price?: number
          price_unit?: string
          rating_average?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["item_status"]
          stock_quantity?: number | null
          store_id?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "items_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          metadata: Json | null
          receiver_id: string
          sender_id: string
          type: Database["public"]["Enums"]["message_type"] | null
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          receiver_id: string
          sender_id: string
          type?: Database["public"]["Enums"]["message_type"] | null
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          receiver_id?: string
          sender_id?: string
          type?: Database["public"]["Enums"]["message_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_read: boolean | null
          link: string | null
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_notes: string | null
          customer_phone: string
          delivery_address: string
          id: number
          item_id: number | null
          order_number: string
          quantity: number
          status: Database["public"]["Enums"]["order_status"]
          store_id: number
          total_price: number
          tracking_code: string | null
          unit_price: number
          updated_at: string | null
          validated_at: string | null
          vendor_notes: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_notes?: string | null
          customer_phone: string
          delivery_address: string
          id?: number
          item_id?: number | null
          order_number: string
          quantity?: number
          status?: Database["public"]["Enums"]["order_status"]
          store_id: number
          total_price: number
          tracking_code?: string | null
          unit_price: number
          updated_at?: string | null
          validated_at?: string | null
          vendor_notes?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string
          delivery_address?: string
          id?: number
          item_id?: number | null
          order_number?: string
          quantity?: number
          status?: Database["public"]["Enums"]["order_status"]
          store_id?: number
          total_price?: number
          tracking_code?: string | null
          unit_price?: number
          updated_at?: string | null
          validated_at?: string | null
          vendor_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "products_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "services_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "services_with_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      promotion_items: {
        Row: {
          item_id: number
          promotion_id: number
        }
        Insert: {
          item_id: number
          promotion_id: number
        }
        Update: {
          item_id?: number
          promotion_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotion_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "products_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "services_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "services_with_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_items_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          active: boolean
          apply_to_all: boolean | null
          created_at: string
          description: string | null
          discount_percent: number | null
          discount_text: string | null
          id: number
          item_id: number | null
          store_id: number
          title: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          active?: boolean
          apply_to_all?: boolean | null
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          discount_text?: string | null
          id?: never
          item_id?: number | null
          store_id: number
          title: string
          valid_from: string
          valid_until: string
        }
        Update: {
          active?: boolean
          apply_to_all?: boolean | null
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          discount_text?: string | null
          id?: never
          item_id?: number | null
          store_id?: number
          title?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "products_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "services_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "services_with_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      reel_comments: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content: string | null
          created_at: string | null
          id: number
          reel_id: number | null
          user_id: string | null
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string | null
          created_at?: string | null
          id?: never
          reel_id?: number | null
          user_id?: string | null
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string | null
          created_at?: string | null
          id?: never
          reel_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reel_comments_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reel_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reel_sponsorships: {
        Row: {
          campaign_id: number | null
          id: number
          priority_score: number | null
          reel_id: number | null
        }
        Insert: {
          campaign_id?: number | null
          id?: number
          priority_score?: number | null
          reel_id?: number | null
        }
        Update: {
          campaign_id?: number | null
          id?: number
          priority_score?: number | null
          reel_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reel_sponsorships_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "sponsored_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reel_sponsorships_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
        ]
      }
      reel_stats: {
        Row: {
          clicks_count: number | null
          contact_count: number | null
          likes_count: number | null
          reel_id: number
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          clicks_count?: number | null
          contact_count?: number | null
          likes_count?: number | null
          reel_id: number
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          clicks_count?: number | null
          contact_count?: number | null
          likes_count?: number | null
          reel_id?: number
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reel_stats_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: true
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
        ]
      }
      reels: {
        Row: {
          category: string | null
          created_at: string | null
          cta_type: string | null
          cta_value: string | null
          currency: string | null
          id: number
          is_sponsored: boolean | null
          item_id: number | null
          media_path: string
          media_type: string | null
          price: number | null
          status: string | null
          store_id: number
          subtitle: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          cta_type?: string | null
          cta_value?: string | null
          currency?: string | null
          id?: number
          is_sponsored?: boolean | null
          item_id?: number | null
          media_path: string
          media_type?: string | null
          price?: number | null
          status?: string | null
          store_id: number
          subtitle?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          cta_type?: string | null
          cta_value?: string | null
          currency?: string | null
          id?: number
          is_sponsored?: boolean | null
          item_id?: number | null
          media_path?: string
          media_type?: string | null
          price?: number | null
          status?: string | null
          store_id?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reels_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reels_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "products_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reels_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "services_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reels_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "services_with_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reels_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reels_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_id: string
          booking_id: number | null
          comment: string
          created_at: string | null
          id: number
          image_1: string | null
          image_2: string | null
          is_approved: boolean | null
          is_spam: boolean | null
          is_verified: boolean | null
          item_id: number | null
          order_id: number | null
          qr_scanned_at: string | null
          qr_token: string | null
          rating: number
          responded_at: string | null
          sentiment_label: Database["public"]["Enums"]["sentiment_label"] | null
          sentiment_score: number | null
          store_id: number
          title: string | null
          updated_at: string | null
          vendor_response: string | null
          vendor_response_ai_suggestion: string | null
        }
        Insert: {
          author_id: string
          booking_id?: number | null
          comment: string
          created_at?: string | null
          id?: number
          image_1?: string | null
          image_2?: string | null
          is_approved?: boolean | null
          is_spam?: boolean | null
          is_verified?: boolean | null
          item_id?: number | null
          order_id?: number | null
          qr_scanned_at?: string | null
          qr_token?: string | null
          rating: number
          responded_at?: string | null
          sentiment_label?:
            | Database["public"]["Enums"]["sentiment_label"]
            | null
          sentiment_score?: number | null
          store_id: number
          title?: string | null
          updated_at?: string | null
          vendor_response?: string | null
          vendor_response_ai_suggestion?: string | null
        }
        Update: {
          author_id?: string
          booking_id?: number | null
          comment?: string
          created_at?: string | null
          id?: number
          image_1?: string | null
          image_2?: string | null
          is_approved?: boolean | null
          is_spam?: boolean | null
          is_verified?: boolean | null
          item_id?: number | null
          order_id?: number | null
          qr_scanned_at?: string | null
          qr_token?: string | null
          rating?: number
          responded_at?: string | null
          sentiment_label?:
            | Database["public"]["Enums"]["sentiment_label"]
            | null
          sentiment_score?: number | null
          store_id?: number
          title?: string | null
          updated_at?: string | null
          vendor_response?: string | null
          vendor_response_ai_suggestion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "products_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "services_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "services_with_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_places: {
        Row: {
          created_at: string | null
          id: number
          store_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          store_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          store_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_places_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_places_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      service_directory: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          created_at: string | null
          description: string | null
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: Json | null
          owner_id: string
          phone: string | null
          rating_average: number | null
          service_id: number
          slug: string
          status: string | null
          total_reviews: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: Json | null
          owner_id: string
          phone?: string | null
          rating_average?: number | null
          service_id?: number
          slug: string
          status?: string | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: Json | null
          owner_id?: string
          phone?: string | null
          rating_average?: number | null
          service_id?: number
          slug?: string
          status?: string | null
          total_reviews?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_schedules: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: number
          is_active: boolean | null
          item_id: number
          max_bookings: number | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: number
          is_active?: boolean | null
          item_id: number
          max_bookings?: number | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: number
          is_active?: boolean | null
          item_id?: number
          max_bookings?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_schedules_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_schedules_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "products_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_schedules_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "services_only"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_schedules_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "services_with_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      sponsored_campaigns: {
        Row: {
          budget: number | null
          created_at: string | null
          end_date: string | null
          id: number
          start_date: string | null
          status: string | null
          store_id: number | null
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: number
          start_date?: string | null
          status?: string | null
          store_id?: number | null
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: number
          start_date?: string | null
          status?: string | null
          store_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_campaigns_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_campaigns_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_analytics: {
        Row: {
          created_at: string | null
          id: number
          session_id: string
          store_id: number | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          session_id: string
          store_id?: number | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          session_id?: string
          store_id?: number | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_analytics_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_analytics_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string
          banner_url: string | null
          business_directory_id: number | null
          business_license_url: string | null
          business_registration: string | null
          category: Database["public"]["Enums"]["store_category"]
          city: string
          created_at: string | null
          description: string | null
          email: string | null
          gallery: Json | null
          id: number
          id_business: number | null
          id_card_url: string | null
          latitude: number
          logo_url: string | null
          longitude: number
          name: string
          opening_hours: Json | null
          owner_id: string
          phone: string
          rating_average: number | null
          rne: string | null
          sentiment_positive_percent: number | null
          service_id: number | null
          slug: string
          status: Database["public"]["Enums"]["store_status"]
          total_orders: number | null
          total_reviews: number | null
          updated_at: string | null
          verification_notes: string | null
          verified_at: string | null
          view_count: number | null
          website: string | null
        }
        Insert: {
          address: string
          banner_url?: string | null
          business_directory_id?: number | null
          business_license_url?: string | null
          business_registration?: string | null
          category?: Database["public"]["Enums"]["store_category"]
          city: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          gallery?: Json | null
          id?: number
          id_business?: number | null
          id_card_url?: string | null
          latitude: number
          logo_url?: string | null
          longitude: number
          name: string
          opening_hours?: Json | null
          owner_id: string
          phone: string
          rating_average?: number | null
          rne?: string | null
          sentiment_positive_percent?: number | null
          service_id?: number | null
          slug: string
          status?: Database["public"]["Enums"]["store_status"]
          total_orders?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          view_count?: number | null
          website?: string | null
        }
        Update: {
          address?: string
          banner_url?: string | null
          business_directory_id?: number | null
          business_license_url?: string | null
          business_registration?: string | null
          category?: Database["public"]["Enums"]["store_category"]
          city?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          gallery?: Json | null
          id?: number
          id_business?: number | null
          id_card_url?: string | null
          latitude?: number
          logo_url?: string | null
          longitude?: number
          name?: string
          opening_hours?: Json | null
          owner_id?: string
          phone?: string
          rating_average?: number | null
          rne?: string | null
          sentiment_positive_percent?: number | null
          service_id?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["store_status"]
          total_orders?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          view_count?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_id_business_fkey"
            columns: ["id_business"]
            isOneToOne: true
            referencedRelation: "business_directory_tunisia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_id_business_fkey"
            columns: ["id_business"]
            isOneToOne: true
            referencedRelation: "unclaimed_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "service_directory"
            referencedColumns: ["service_id"]
          },
        ]
      }
      stories: {
        Row: {
          author_id: string | null
          caption: string | null
          created_at: string
          expires_at: string
          id: number
          is_approved: boolean
          media_type: string
          media_url: string
          store_id: number
          views_count: number
        }
        Insert: {
          author_id?: string | null
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: never
          is_approved?: boolean
          media_type?: string
          media_url: string
          store_id: number
          views_count?: number
        }
        Update: {
          author_id?: string | null
          caption?: string | null
          created_at?: string
          expires_at?: string
          id?: never
          is_approved?: boolean
          media_type?: string
          media_url?: string
          store_id?: number
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "stories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          id: number
          story_id: number
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: never
          story_id: number
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: never
          story_id?: number
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          current_period_end: string
          current_period_start: string
          id: number
          plan_name: string
          price: number | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          current_period_end: string
          current_period_start: string
          id?: number
          plan_name: string
          price?: number | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          current_period_end?: string
          current_period_start?: string
          id?: number
          plan_name?: string
          price?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string | null
          sender_type: string
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
          sender_type: string
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          channel: Database["public"]["Enums"]["support_ticket_channel"] | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          id: string
          last_reply_at: string
          priority:
            | Database["public"]["Enums"]["support_ticket_priority"]
            | null
          status: Database["public"]["Enums"]["support_ticket_status"] | null
          store_id: number
          subject: string
          ticket_number: number
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          channel?: Database["public"]["Enums"]["support_ticket_channel"] | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          last_reply_at?: string
          priority?:
            | Database["public"]["Enums"]["support_ticket_priority"]
            | null
          status?: Database["public"]["Enums"]["support_ticket_status"] | null
          store_id: number
          subject: string
          ticket_number?: number
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          channel?: Database["public"]["Enums"]["support_ticket_channel"] | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          id?: string
          last_reply_at?: string
          priority?:
            | Database["public"]["Enums"]["support_ticket_priority"]
            | null
          status?: Database["public"]["Enums"]["support_ticket_status"] | null
          store_id?: number
          subject?: string
          ticket_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          booking_id: number | null
          collection_time: string | null
          customer_id: string | null
          customer_name: string | null
          date: string | null
          delivery_duration_minutes: number | null
          driver_name: string | null
          drop_location: string | null
          fee: number | null
          id: string
          km: number | null
          merchant_id: number | null
          merchant_name: string | null
          merchant_number: string | null
          order_number: string
          pickup_time: string | null
          qr_code_token: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          time_accepted: string | null
          time_created: string | null
          time_delivered: string | null
          transaction_code: string
          type: Database["public"]["Enums"]["transaction_type"] | null
          wait_duration_minutes: number | null
        }
        Insert: {
          amount?: number
          booking_id?: number | null
          collection_time?: string | null
          customer_id?: string | null
          customer_name?: string | null
          date?: string | null
          delivery_duration_minutes?: number | null
          driver_name?: string | null
          drop_location?: string | null
          fee?: number | null
          id?: string
          km?: number | null
          merchant_id?: number | null
          merchant_name?: string | null
          merchant_number?: string | null
          order_number: string
          pickup_time?: string | null
          qr_code_token?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          time_accepted?: string | null
          time_created?: string | null
          time_delivered?: string | null
          transaction_code: string
          type?: Database["public"]["Enums"]["transaction_type"] | null
          wait_duration_minutes?: number | null
        }
        Update: {
          amount?: number
          booking_id?: number | null
          collection_time?: string | null
          customer_id?: string | null
          customer_name?: string | null
          date?: string | null
          delivery_duration_minutes?: number | null
          driver_name?: string | null
          drop_location?: string | null
          fee?: number | null
          id?: string
          km?: number | null
          merchant_id?: number | null
          merchant_name?: string | null
          merchant_number?: string | null
          order_number?: string
          pickup_time?: string | null
          qr_code_token?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          time_accepted?: string | null
          time_created?: string | null
          time_delivered?: string | null
          transaction_code?: string
          type?: Database["public"]["Enums"]["transaction_type"] | null
          wait_duration_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interactions: {
        Row: {
          created_at: string | null
          id: number
          reel_id: number | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          reel_id?: number | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          reel_id?: number | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_interactions_reel_id_fkey"
            columns: ["reel_id"]
            isOneToOne: false
            referencedRelation: "reels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          category: string | null
          id: number
          score: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          id?: number
          score?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          id?: number
          score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_search_history: {
        Row: {
          created_at: string | null
          id: number
          query: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          query: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          query?: string
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string | null
          email: string | null
          email_notifications_enabled: boolean | null
          full_name: string | null
          id: string
          latitude: number | null
          login_alerts_enabled: boolean | null
          longitude: number | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: string | null
          two_factor_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name?: string | null
          id: string
          latitude?: number | null
          login_alerts_enabled?: boolean | null
          longitude?: number | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          email_notifications_enabled?: boolean | null
          full_name?: string | null
          id?: string
          latitude?: number | null
          login_alerts_enabled?: boolean | null
          longitude?: number | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      active_stores_with_stats: {
        Row: {
          address: string | null
          banner_url: string | null
          business_directory_id: number | null
          business_license_url: string | null
          business_registration: string | null
          category: Database["public"]["Enums"]["store_category"] | null
          city: string | null
          created_at: string | null
          description: string | null
          email: string | null
          gallery: Json | null
          id: number | null
          id_business: number | null
          id_card_url: string | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string | null
          opening_hours: Json | null
          owner_id: string | null
          phone: string | null
          rating_average: number | null
          rne: string | null
          sentiment_positive_percent: number | null
          service_id: number | null
          slug: string | null
          status: Database["public"]["Enums"]["store_status"] | null
          total_items: number | null
          total_orders: number | null
          total_reviews: number | null
          updated_at: string | null
          verification_notes: string | null
          verified_at: string | null
          view_count: number | null
          website: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_id_business_fkey"
            columns: ["id_business"]
            isOneToOne: true
            referencedRelation: "business_directory_tunisia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_id_business_fkey"
            columns: ["id_business"]
            isOneToOne: true
            referencedRelation: "unclaimed_businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: true
            referencedRelation: "service_directory"
            referencedColumns: ["service_id"]
          },
        ]
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      products_only: {
        Row: {
          available_days: Json | null
          booking_count: number | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          embedding: string | null
          id: number | null
          image_2: string | null
          image_3: string | null
          is_bookable: boolean | null
          item_type: Database["public"]["Enums"]["item_type"] | null
          main_image: string | null
          name: string | null
          order_count: number | null
          price: number | null
          price_unit: string | null
          rating_average: number | null
          slug: string | null
          status: Database["public"]["Enums"]["item_status"] | null
          stock_quantity: number | null
          store_id: number | null
          total_reviews: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          available_days?: Json | null
          booking_count?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          embedding?: string | null
          id?: number | null
          image_2?: string | null
          image_3?: string | null
          is_bookable?: boolean | null
          item_type?: Database["public"]["Enums"]["item_type"] | null
          main_image?: string | null
          name?: string | null
          order_count?: number | null
          price?: number | null
          price_unit?: string | null
          rating_average?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["item_status"] | null
          stock_quantity?: number | null
          store_id?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          available_days?: Json | null
          booking_count?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          embedding?: string | null
          id?: number | null
          image_2?: string | null
          image_3?: string | null
          is_bookable?: boolean | null
          item_type?: Database["public"]["Enums"]["item_type"] | null
          main_image?: string | null
          name?: string | null
          order_count?: number | null
          price?: number | null
          price_unit?: string | null
          rating_average?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["item_status"] | null
          stock_quantity?: number | null
          store_id?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "items_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      services_only: {
        Row: {
          available_days: Json | null
          booking_count: number | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          embedding: string | null
          id: number | null
          image_2: string | null
          image_3: string | null
          is_bookable: boolean | null
          item_type: Database["public"]["Enums"]["item_type"] | null
          main_image: string | null
          name: string | null
          order_count: number | null
          price: number | null
          price_unit: string | null
          rating_average: number | null
          slug: string | null
          status: Database["public"]["Enums"]["item_status"] | null
          stock_quantity: number | null
          store_id: number | null
          total_reviews: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          available_days?: Json | null
          booking_count?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          embedding?: string | null
          id?: number | null
          image_2?: string | null
          image_3?: string | null
          is_bookable?: boolean | null
          item_type?: Database["public"]["Enums"]["item_type"] | null
          main_image?: string | null
          name?: string | null
          order_count?: number | null
          price?: number | null
          price_unit?: string | null
          rating_average?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["item_status"] | null
          stock_quantity?: number | null
          store_id?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          available_days?: Json | null
          booking_count?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          embedding?: string | null
          id?: number | null
          image_2?: string | null
          image_3?: string | null
          is_bookable?: boolean | null
          item_type?: Database["public"]["Enums"]["item_type"] | null
          main_image?: string | null
          name?: string | null
          order_count?: number | null
          price?: number | null
          price_unit?: string | null
          rating_average?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["item_status"] | null
          stock_quantity?: number | null
          store_id?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "items_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      services_with_schedules: {
        Row: {
          available_days: Json | null
          booking_count: number | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          embedding: string | null
          id: number | null
          image_2: string | null
          image_3: string | null
          is_bookable: boolean | null
          item_type: Database["public"]["Enums"]["item_type"] | null
          main_image: string | null
          name: string | null
          order_count: number | null
          price: number | null
          price_unit: string | null
          rating_average: number | null
          schedule: Json | null
          slug: string | null
          status: Database["public"]["Enums"]["item_status"] | null
          stock_quantity: number | null
          store_id: number | null
          total_reviews: number | null
          updated_at: string | null
          view_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "items_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "active_stores_with_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      unclaimed_businesses: {
        Row: {
          business_name: string | null
          category_name: string | null
          city: string | null
          created_at: string | null
          id: number | null
          phone: string | null
          reviews_count: number | null
          street: string | null
          total_score: number | null
          vitrine_category: string | null
          website: string | null
        }
        Insert: {
          business_name?: string | null
          category_name?: string | null
          city?: string | null
          created_at?: string | null
          id?: number | null
          phone?: string | null
          reviews_count?: number | null
          street?: string | null
          total_score?: number | null
          vitrine_category?: string | null
          website?: string | null
        }
        Update: {
          business_name?: string | null
          category_name?: string | null
          city?: string | null
          created_at?: string | null
          id?: number | null
          phone?: string | null
          reviews_count?: number | null
          street?: string | null
          total_score?: number | null
          vitrine_category?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      check_slot_availability: {
        Args: {
          p_date: string
          p_end_time: string
          p_item_id: number
          p_start_time: string
        }
        Returns: boolean
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      extract_place_id_from_url: {
        Args: { google_url: string }
        Returns: string
      }
      generate_filename: {
        Args: { original_filename: string; prefix?: string }
        Returns: string
      }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_public_url: {
        Args: { bucket_name: string; file_path: string }
        Returns: string
      }
      gettransactionid: { Args: never; Returns: unknown }
      insert_google_place: { Args: { place_data: Json }; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      map_google_category_to_vitrine: {
        Args: { google_category: string }
        Returns: string
      }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      search_business_directory: {
        Args: {
          filter_category?: string
          filter_governorate?: string
          search_limit?: number
          search_query: string
        }
        Returns: {
          address: string
          business_name: string
          category: string
          governorate: string
          id: number
          is_claimed: boolean
          phone: string
          similarity: number
        }[]
      }
      search_items_semantic: {
        Args: {
          city_filter?: string
          item_type_filter?: Database["public"]["Enums"]["item_type"]
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          city: string
          description: string
          duration_minutes: number
          id: number
          item_type: Database["public"]["Enums"]["item_type"]
          name: string
          price: number
          price_unit: string
          similarity: number
          store_name: string
        }[]
      }
      search_nearby_businesses: {
        Args: {
          search_category?: string
          search_limit?: number
          search_query?: string
          search_radius?: number
          user_lat: number
          user_lng: number
        }
        Returns: {
          category_name: string
          city: string
          distance_km: number
          google_url: string
          has_premium_store: boolean
          id: number
          latitude: number
          longitude: number
          phone: string
          reviews_count: number
          store_id: number
          store_slug: string
          street: string
          title: string
          total_score: number
          vitrine_category: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      booking_status:
        | "PENDING"
        | "CONFIRMED"
        | "COMPLETED"
        | "CANCELLED"
        | "NO_SHOW"
      friendship_status: "PENDING" | "ACCEPTED" | "DECLINED" | "BLOCKED"
      item_status: "AVAILABLE" | "OUT_OF_STOCK" | "ON_DEMAND" | "UNAVAILABLE"
      item_type: "PRODUCT" | "SERVICE"
      message_type: "text" | "image" | "audio" | "file"
      order_status:
        | "PENDING"
        | "VALIDATED"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED"
      sentiment_label: "POSITIVE" | "NEUTRAL" | "NEGATIVE"
      store_category:
        | "RESTAURANT"
        | "RETAIL"
        | "SERVICE"
        | "BEAUTY"
        | "REPAIR"
        | "HEALTH"
        | "EDUCATION"
        | "ENTERTAINMENT"
        | "PROFESSIONAL"
        | "HOME"
        | "OTHER"
      store_status:
        | "PENDING"
        | "ACTIVE"
        | "SUSPENDED"
        | "REJECTED"
        | "REVIEW"
        | "APPROVED"
        | "PUBLISHED"
      support_ticket_channel: "email" | "chat" | "phone" | "social"
      support_ticket_priority: "low" | "medium" | "high" | "critical"
      support_ticket_status:
        | "open"
        | "in_progress"
        | "waiting_customer"
        | "resolved"
      transaction_status: "completed" | "pending" | "failed" | "processing"
      transaction_type: "payment" | "refund" | "wallet_topup"
      user_role: "CLIENT" | "PRO" | "ADMIN"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: [
        "PENDING",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
      ],
      friendship_status: ["PENDING", "ACCEPTED", "DECLINED", "BLOCKED"],
      item_status: ["AVAILABLE", "OUT_OF_STOCK", "ON_DEMAND", "UNAVAILABLE"],
      item_type: ["PRODUCT", "SERVICE"],
      message_type: ["text", "image", "audio", "file"],
      order_status: [
        "PENDING",
        "VALIDATED",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
      ],
      sentiment_label: ["POSITIVE", "NEUTRAL", "NEGATIVE"],
      store_category: [
        "RESTAURANT",
        "RETAIL",
        "SERVICE",
        "BEAUTY",
        "REPAIR",
        "HEALTH",
        "EDUCATION",
        "ENTERTAINMENT",
        "PROFESSIONAL",
        "HOME",
        "OTHER",
      ],
      store_status: [
        "PENDING",
        "ACTIVE",
        "SUSPENDED",
        "REJECTED",
        "REVIEW",
        "APPROVED",
        "PUBLISHED",
      ],
      support_ticket_channel: ["email", "chat", "phone", "social"],
      support_ticket_priority: ["low", "medium", "high", "critical"],
      support_ticket_status: [
        "open",
        "in_progress",
        "waiting_customer",
        "resolved",
      ],
      transaction_status: ["completed", "pending", "failed", "processing"],
      transaction_type: ["payment", "refund", "wallet_topup"],
      user_role: ["CLIENT", "PRO", "ADMIN"],
    },
  },
} as const
