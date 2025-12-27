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
      leads: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          country_code: string
          age: number
          gender: 'Male' | 'Female'
          norwood_scale: string
          estimated_grafts: string
          thumbnail_url: string | null
          status: 'AVAILABLE' | 'PURCHASED' | 'NEGOTIATING'
          price: number
          proposal_price: number
          is_unlocked: boolean
          is_negotiable: boolean
          patient_details: Json
          analysis_data: Json | null
          intake_data: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          country_code: string
          age: number
          gender: 'Male' | 'Female'
          norwood_scale: string
          estimated_grafts: string
          thumbnail_url?: string | null
          status?: 'AVAILABLE' | 'PURCHASED' | 'NEGOTIATING'
          price?: number
          proposal_price?: number
          is_unlocked?: boolean
          is_negotiable?: boolean
          patient_details: Json
          analysis_data?: Json | null
          intake_data?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          country_code?: string
          age?: number
          gender?: 'Male' | 'Female'
          norwood_scale?: string
          estimated_grafts?: string
          thumbnail_url?: string | null
          status?: 'AVAILABLE' | 'PURCHASED' | 'NEGOTIATING'
          price?: number
          proposal_price?: number
          is_unlocked?: boolean
          is_negotiable?: boolean
          patient_details?: Json
          analysis_data?: Json | null
          intake_data?: Json | null
        }
      }
      clinics: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          credits: number
          total_purchased: number
          total_spent: number
          status: 'ACTIVE' | 'PENDING' | 'SUSPENDED'
          clinic_info: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          credits?: number
          total_purchased?: number
          total_spent?: number
          status?: 'ACTIVE' | 'PENDING' | 'SUSPENDED'
          clinic_info?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          credits?: number
          total_purchased?: number
          total_spent?: number
          status?: 'ACTIVE' | 'PENDING' | 'SUSPENDED'
          clinic_info?: Json
        }
      }
      proposals: {
        Row: {
          id: string
          created_at: string
          lead_id: string
          clinic_id: string
          price: number
          currency: string
          treatment_type: string
          package_tier: string
          inclusions: Json
          message: string | null
          status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
        }
        Insert: {
          id?: string
          created_at?: string
          lead_id: string
          clinic_id: string
          price: number
          currency: string
          treatment_type: string
          package_tier: string
          inclusions: Json
          message?: string | null
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
        }
        Update: {
          id?: string
          created_at?: string
          lead_id?: string
          clinic_id?: string
          price?: number
          currency?: string
          treatment_type?: string
          package_tier?: string
          inclusions?: Json
          message?: string | null
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
        }
      }
      transactions: {
        Row: {
          id: string
          created_at: string
          clinic_id: string
          type: 'ACCESS' | 'REFILL' | 'PROPOSAL'
          amount: number
          description: string
          lead_id: string | null
          status: 'COMPLETED' | 'PENDING'
        }
        Insert: {
          id?: string
          created_at?: string
          clinic_id: string
          type: 'ACCESS' | 'REFILL' | 'PROPOSAL'
          amount: number
          description: string
          lead_id?: string | null
          status?: 'COMPLETED' | 'PENDING'
        }
        Update: {
          id?: string
          created_at?: string
          clinic_id?: string
          type?: 'ACCESS' | 'REFILL' | 'PROPOSAL'
          amount?: number
          description?: string
          lead_id?: string | null
          status?: 'COMPLETED' | 'PENDING'
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
