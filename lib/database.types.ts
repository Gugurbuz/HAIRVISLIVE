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
          price: number | null
          proposal_price: number | null
          is_unlocked: boolean | null
          is_negotiable: boolean | null
          patient_details: Json
          analysis_data: Json | null
          intake_data: Json | null
          name: string | null
          email: string | null
          phone: string | null
          concerns: string[] | null
          source: string | null
          scan_data: Json | null
          metadata: Json | null
          clinic_id: string | null
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
          price?: number | null
          proposal_price?: number | null
          is_unlocked?: boolean | null
          is_negotiable?: boolean | null
          patient_details: Json
          analysis_data?: Json | null
          intake_data?: Json | null
          name?: string | null
          email?: string | null
          phone?: string | null
          concerns?: string[] | null
          source?: string | null
          scan_data?: Json | null
          metadata?: Json | null
          clinic_id?: string | null
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
          price?: number | null
          proposal_price?: number | null
          is_unlocked?: boolean | null
          is_negotiable?: boolean | null
          patient_details?: Json
          analysis_data?: Json | null
          intake_data?: Json | null
          name?: string | null
          email?: string | null
          phone?: string | null
          concerns?: string[] | null
          source?: string | null
          scan_data?: Json | null
          metadata?: Json | null
          clinic_id?: string | null
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
          slug: string | null
          location: string | null
          description: string | null
          contact_email: string | null
          contact_phone: string | null
          logo_url: string | null
          metadata: Json | null
          founding_year: number | null
          languages_spoken: string[] | null
          response_time_hours: number | null
          social_media: Json | null
          operating_hours: Json | null
          tier: string | null
          is_verified: boolean | null
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
          slug?: string | null
          location?: string | null
          description?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          logo_url?: string | null
          metadata?: Json | null
          founding_year?: number | null
          languages_spoken?: string[] | null
          response_time_hours?: number | null
          social_media?: Json | null
          operating_hours?: Json | null
          tier?: string | null
          is_verified?: boolean | null
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
          slug?: string | null
          location?: string | null
          description?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          logo_url?: string | null
          metadata?: Json | null
          founding_year?: number | null
          languages_spoken?: string[] | null
          response_time_hours?: number | null
          social_media?: Json | null
          operating_hours?: Json | null
          tier?: string | null
          is_verified?: boolean | null
        }
      }
      sessions: {
        Row: {
          id: string
          created_at: string
          user_id: string | null
          anonymous_id: string
          metadata: Json | null
          last_activity_at: string | null
          ended_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id?: string | null
          anonymous_id: string
          metadata?: Json | null
          last_activity_at?: string | null
          ended_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string | null
          anonymous_id?: string
          metadata?: Json | null
          last_activity_at?: string | null
          ended_at?: string | null
        }
      }
      analysis_logs: {
        Row: {
          id: string
          created_at: string
          session_id: string | null
          operation_type: string
          input_data: Json | null
          output_data: Json | null
          image_urls: string[] | null
          feature_flags: Json | null
          duration_ms: number | null
          error: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          session_id?: string | null
          operation_type: string
          input_data?: Json | null
          output_data?: Json | null
          image_urls?: string[] | null
          feature_flags?: Json | null
          duration_ms?: number | null
          error?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          session_id?: string | null
          operation_type?: string
          input_data?: Json | null
          output_data?: Json | null
          image_urls?: string[] | null
          feature_flags?: Json | null
          duration_ms?: number | null
          error?: string | null
        }
      }
      feature_flags: {
        Row: {
          id: string
          created_at: string
          name: string
          enabled: boolean
          config: Json | null
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          enabled?: boolean
          config?: Json | null
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          enabled?: boolean
          config?: Json | null
          description?: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          created_at: string
          user_id: string
          role: string
          clinic_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          role: string
          clinic_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          role?: string
          clinic_id?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          preferences: Json | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          preferences?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          preferences?: Json | null
        }
      }
      clinic_images: {
        Row: {
          id: string
          created_at: string
          clinic_id: string
          image_url: string
          image_type: 'gallery' | 'team' | 'hero' | 'before_after' | 'certificate' | 'facility'
          caption: string | null
          display_order: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          clinic_id: string
          image_url: string
          image_type: 'gallery' | 'team' | 'hero' | 'before_after' | 'certificate' | 'facility'
          caption?: string | null
          display_order?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          clinic_id?: string
          image_url?: string
          image_type?: 'gallery' | 'team' | 'hero' | 'before_after' | 'certificate' | 'facility'
          caption?: string | null
          display_order?: number | null
        }
      }
      clinic_videos: {
        Row: {
          id: string
          created_at: string
          clinic_id: string
          video_url: string
          thumbnail_url: string | null
          title: string | null
          description: string | null
          video_type: string | null
          display_order: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          clinic_id: string
          video_url: string
          thumbnail_url?: string | null
          title?: string | null
          description?: string | null
          video_type?: string | null
          display_order?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          clinic_id?: string
          video_url?: string
          thumbnail_url?: string | null
          title?: string | null
          description?: string | null
          video_type?: string | null
          display_order?: number | null
        }
      }
      clinic_team_members: {
        Row: {
          id: string
          created_at: string
          clinic_id: string
          name: string
          role: string
          bio: string | null
          photo_url: string | null
          credentials: string[] | null
          display_order: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          clinic_id: string
          name: string
          role: string
          bio?: string | null
          photo_url?: string | null
          credentials?: string[] | null
          display_order?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          clinic_id?: string
          name?: string
          role?: string
          bio?: string | null
          photo_url?: string | null
          credentials?: string[] | null
          display_order?: number | null
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
