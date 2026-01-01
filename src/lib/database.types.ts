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
      roadmap_steps: {
        Row: {
          id: string
          roadmap_id: string
          step_number: number
          title: string
          description: string
          resources: Json
        }
        Insert: {
          id?: string
          roadmap_id: string
          step_number: number
          title: string
          description: string
          resources: Json
        }
        Update: {
          id?: string
          roadmap_id?: string
          step_number?: number
          title?: string
          description?: string
          resources?: Json
        }
      }
      roadmaps: {
        Row: {
          id: string
          user_id: string
          topic: string
          level: string
          is_favorite: boolean
          share_token: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic: string
          level: string
          is_favorite?: boolean
          share_token?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic?: string
          level?: string
          is_favorite?: boolean
          share_token?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
        }
        Insert: {
          id: string
          email: string
        }
        Update: {
          id?: string
          email?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}