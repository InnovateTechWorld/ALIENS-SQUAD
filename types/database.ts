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
      users: {
        Row: {
          id: string
          phone: string
          name: string | null
          balance: number
          virtual_account_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone: string
          name?: string | null
          balance?: number
          virtual_account_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string
          name?: string | null
          balance?: number
          virtual_account_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      active_sessions: {
        Row: {
          id: string
          bin_id: string
          user_phone: string
          status: 'waiting' | 'verifying' | 'success' | 'failed'
          started_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          bin_id: string
          user_phone: string
          status?: 'waiting' | 'verifying' | 'success' | 'failed'
          started_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          bin_id?: string
          user_phone?: string
          status?: 'waiting' | 'verifying' | 'success' | 'failed'
          started_at?: string
          expires_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_phone: string
          bin_id: string
          amount: number
          type: 'recycle' | 'withdrawal'
          status: 'pending' | 'completed' | 'failed'
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_phone: string
          bin_id: string
          amount: number
          type: 'recycle' | 'withdrawal'
          status?: 'pending' | 'completed' | 'failed'
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_phone?: string
          bin_id?: string
          amount?: number
          type?: 'recycle' | 'withdrawal'
          status?: 'pending' | 'completed' | 'failed'
          metadata?: Json | null
          created_at?: string
        }
      }
      bins: {
        Row: {
          id: string
          bin_id: string
          location: string
          status: 'active' | 'inactive' | 'maintenance'
          last_activity: string | null
          created_at: string
        }
        Insert: {
          id?: string
          bin_id: string
          location: string
          status?: 'active' | 'inactive' | 'maintenance'
          last_activity?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          bin_id?: string
          location?: string
          status?: 'active' | 'inactive' | 'maintenance'
          last_activity?: string | null
          created_at?: string
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
  }
}
