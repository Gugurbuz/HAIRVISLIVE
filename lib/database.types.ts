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
      prompts: {
        Row: {
          id: string
          name: string
          version: string
          prompt_text: string
          description: string
          is_active: boolean
          created_at: string
          created_by: string
          metadata: Json
        }
        Insert: {
          id?: string
          name: string
          version: string
          prompt_text: string
          description?: string
          is_active?: boolean
          created_at?: string
          created_by?: string
          metadata?: Json
        }
        Update: {
          id?: string
          name?: string
          version?: string
          prompt_text?: string
          description?: string
          is_active?: boolean
          created_at?: string
          created_by?: string
          metadata?: Json
        }
      }
      prompt_usage_logs: {
        Row: {
          id: string
          prompt_id: string | null
          prompt_name: string
          prompt_version: string
          execution_time_ms: number
          token_count: number
          model: string
          success: boolean
          error_message: string | null
          input_hash: string | null
          output_size_bytes: number
          created_at: string
          user_id: string | null
          session_id: string | null
        }
        Insert: {
          id?: string
          prompt_id?: string | null
          prompt_name: string
          prompt_version: string
          execution_time_ms?: number
          token_count?: number
          model?: string
          success?: boolean
          error_message?: string | null
          input_hash?: string | null
          output_size_bytes?: number
          created_at?: string
          user_id?: string | null
          session_id?: string | null
        }
        Update: {
          id?: string
          prompt_id?: string | null
          prompt_name?: string
          prompt_version?: string
          execution_time_ms?: number
          token_count?: number
          model?: string
          success?: boolean
          error_message?: string | null
          input_hash?: string | null
          output_size_bytes?: number
          created_at?: string
          user_id?: string | null
          session_id?: string | null
        }
      }
      ai_validation_errors: {
        Row: {
          id: string
          usage_log_id: string | null
          prompt_name: string
          prompt_version: string
          validation_schema: string
          errors: Json
          raw_response: string
          expected_format: string
          created_at: string
          resolved: boolean
          resolution_notes: string | null
        }
        Insert: {
          id?: string
          usage_log_id?: string | null
          prompt_name: string
          prompt_version: string
          validation_schema: string
          errors?: Json
          raw_response: string
          expected_format?: string
          created_at?: string
          resolved?: boolean
          resolution_notes?: string | null
        }
        Update: {
          id?: string
          usage_log_id?: string | null
          prompt_name?: string
          prompt_version?: string
          validation_schema?: string
          errors?: Json
          raw_response?: string
          expected_format?: string
          created_at?: string
          resolved?: boolean
          resolution_notes?: string | null
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
