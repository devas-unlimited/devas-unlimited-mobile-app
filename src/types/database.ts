export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type EventStatus = 'draft' | 'scheduled' | 'published' | 'archived' | 'cancelled'
export type ResourceStatus = 'draft' | 'scheduled' | 'published' | 'archived'
export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived'
export type AnnouncementPriority = 'normal' | 'important' | 'urgent'
export type AnnouncementType = 'general' | 'event_reminder' | 'retreat' | 'new_session' | 'new_recording' | 'schedule_change' | 'important_notice'
export type MediaType = 'image' | 'video' | 'audio' | 'pdf' | 'external_video' | 'external_audio'
export type AdminRole = 'client' | 'admin' | 'super_admin'
export type BannerImageMode = 'cover' | 'side'
export type BannerTheme = 'plum' | 'rose' | 'lavender' | 'gold' | 'cream'
export type SessionType = '1on1' | 'group' | 'coaching' | 'meditation' | 'breathwork' | 'akashic' | 'counselling' | 'energy_healing' | 'other'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: 'client' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'client' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'client' | 'admin'
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          slug: string
          category: string
          format: string
          description: string | null
          city: string | null
          venue: string | null
          starts_at: string
          ends_at: string | null
          registration_url: string | null
          cover_image_url: string | null
          is_featured: boolean
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          category: string
          format: string
          description?: string | null
          city?: string | null
          venue?: string | null
          starts_at: string
          ends_at?: string | null
          registration_url?: string | null
          cover_image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['events']['Insert']>
      }
      event_participants: {
        Row: {
          id: string
          event_id: string
          user_id: string
          registration_status: string
          attendance_status: string | null
          attended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          registration_status?: string
          attendance_status?: string | null
          attended_at?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['event_participants']['Insert']>
      }
      client_sessions: {
        Row: {
          id: string
          title: string
          session_kind: '1on1' | 'group'
          coach_name: string | null
          starts_at: string
          duration_minutes: number | null
          status: 'scheduled' | 'completed' | 'cancelled'
          recording_provider: string | null
          recording_url: string | null
          recording_duration_seconds: number | null
          recording_status: 'none' | 'processing' | 'available' | 'expired'
          is_private: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          session_kind: '1on1' | 'group'
          coach_name?: string | null
          starts_at: string
          duration_minutes?: number | null
          status?: 'scheduled' | 'completed' | 'cancelled'
          recording_provider?: string | null
          recording_url?: string | null
          recording_duration_seconds?: number | null
          recording_status?: 'none' | 'processing' | 'available' | 'expired'
          is_private?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['client_sessions']['Insert']>
      }
      session_participants: {
        Row: {
          session_id: string
          user_id: string
          attendance_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          session_id: string
          user_id: string
          attendance_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['session_participants']['Insert']>
      }
      meditation_sessions: {
        Row: {
          id: string
          user_id: string
          started_at: string
          completed_at: string | null
          duration_seconds: number
          intention: string | null
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          started_at: string
          completed_at?: string | null
          duration_seconds: number
          intention?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['meditation_sessions']['Insert']>
      }
      resources: {
        Row: {
          id: string
          title: string
          category: 'watch' | 'listen' | 'meditate'
          provider: string
          external_url: string
          thumbnail_url: string | null
          duration_minutes: number | null
          track_count: number | null
          description: string | null
          facilitator_name: string | null
          tags: string[] | null
          display_order: number
          is_featured: boolean
          is_published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          category: 'watch' | 'listen' | 'meditate'
          provider: string
          external_url: string
          thumbnail_url?: string | null
          duration_minutes?: number | null
          track_count?: number | null
          description?: string | null
          facilitator_name?: string | null
          tags?: string[] | null
          display_order?: number
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['resources']['Insert']>
      }
      journey_levels: {
        Row: {
          level: number
          name: string
          description: string | null
          required_sessions: number
          required_events: number
          required_meditation_days: number
          required_retreats: number
        }
        Insert: {
          level: number
          name: string
          description?: string | null
          required_sessions?: number
          required_events?: number
          required_meditation_days?: number
          required_retreats?: number
        }
        Update: Partial<Database['public']['Tables']['journey_levels']['Insert']>
      }
      home_banners: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          eyebrow: string | null
          image_url: string | null
          image_mode: BannerImageMode
          theme: BannerTheme
          cta_label: string | null
          link_url: string | null
          display_order: number
          is_active: boolean
          starts_at: string | null
          ends_at: string | null
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          eyebrow?: string | null
          image_url?: string | null
          image_mode?: BannerImageMode
          theme?: BannerTheme
          cta_label?: string | null
          link_url?: string | null
          display_order?: number
          is_active?: boolean
          starts_at?: string | null
          ends_at?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['home_banners']['Insert']>
      }
      journey_completions: {
        Row: {
          id: string
          user_id: string
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          completed_at?: string
        }
        Update: Partial<Database['public']['Tables']['journey_completions']['Insert']>
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: AdminRole
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: AdminRole
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['user_roles']['Insert']>
      }
      announcements: {
        Row: {
          id: string
          title: string
          short_message: string
          full_content: string | null
          type: AnnouncementType
          priority: AnnouncementPriority
          cover_image_url: string | null
          cta_label: string | null
          cta_url: string | null
          status: AnnouncementStatus
          is_featured: boolean
          is_dismissible: boolean
          audience: string
          target_event_id: string | null
          published_at: string | null
          expires_at: string | null
          display_order: number
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          short_message: string
          full_content?: string | null
          type?: AnnouncementType
          priority?: AnnouncementPriority
          cover_image_url?: string | null
          cta_label?: string | null
          cta_url?: string | null
          status?: AnnouncementStatus
          is_featured?: boolean
          is_dismissible?: boolean
          audience?: string
          target_event_id?: string | null
          published_at?: string | null
          expires_at?: string | null
          display_order?: number
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          user_id: string
          read_at: string | null
          dismissed_at: string | null
          created_at: string
        }
        Insert: {
          announcement_id: string
          user_id: string
          read_at?: string | null
          dismissed_at?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['announcement_reads']['Insert']>
      }
      media_assets: {
        Row: {
          id: string
          title: string
          media_type: MediaType
          provider: string | null
          storage_bucket: string | null
          storage_path: string | null
          external_url: string | null
          public_url: string | null
          thumbnail_url: string | null
          mime_type: string | null
          file_size: number | null
          duration_seconds: number | null
          visibility: 'public' | 'authenticated' | 'private'
          created_by: string | null
          created_at: string
          updated_at: string
          archived_at: string | null
        }
        Insert: {
          id?: string
          title: string
          media_type: MediaType
          provider?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          external_url?: string | null
          public_url?: string | null
          thumbnail_url?: string | null
          mime_type?: string | null
          file_size?: number | null
          duration_seconds?: number | null
          visibility?: 'public' | 'authenticated' | 'private'
          created_by?: string | null
          created_at?: string
          updated_at?: string
          archived_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['media_assets']['Insert']>
      }
      admin_activity_log: {
        Row: {
          id: string
          admin_user_id: string
          action: string
          entity_type: string
          entity_id: string | null
          summary: string
          created_at: string
        }
        Insert: {
          id?: string
          admin_user_id: string
          action: string
          entity_type: string
          entity_id?: string | null
          summary: string
          created_at?: string
        }
        Update: never
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: Record<never, never>; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type EventParticipant = Database['public']['Tables']['event_participants']['Row']
export type ClientSession = Database['public']['Tables']['client_sessions']['Row']
export type SessionParticipant = Database['public']['Tables']['session_participants']['Row']
export type MeditationSession = Database['public']['Tables']['meditation_sessions']['Row']
export type Resource = Database['public']['Tables']['resources']['Row']
export type JourneyLevel = Database['public']['Tables']['journey_levels']['Row']
export type UserRole = Database['public']['Tables']['user_roles']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type AnnouncementRead = Database['public']['Tables']['announcement_reads']['Row']
export type MediaAsset = Database['public']['Tables']['media_assets']['Row']
export type HomeBanner = Database['public']['Tables']['home_banners']['Row']
export type AdminActivityLog = Database['public']['Tables']['admin_activity_log']['Row']

export type SessionWithParticipant = ClientSession & {
  session_participants: SessionParticipant[]
}

export type EventWithParticipant = Event & {
  event_participants: EventParticipant[]
}

export type AdminClientRow = {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: 'client' | 'admin'
  created_at: string
  updated_at: string
  email?: string
  last_sign_in_at?: string | null
}
