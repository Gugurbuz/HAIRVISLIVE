export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'clinic' | 'patient'

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
          user_id: string | null
          anonymous_id: string | null
          started_at: string
          last_activity_at: string
          metadata: Json
          ended_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          anonymous_id?: string | null
          started_at?: string
          last_activity_at?: string
          metadata?: Json
          ended_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          anonymous_id?: string | null
          started_at?: string
          last_activity_at?: string
          metadata?: Json
          ended_at?: string | null
        }
      }
      analysis_logs: {
        Row: {
          id: string
          session_id: string
          operation_type: string
          input_data: Json
          output_data: Json | null
          image_urls: string[] | null
          feature_flags: Json
          duration_ms: number | null
          error: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          operation_type: string
          input_data: Json
          output_data?: Json | null
          image_urls?: string[] | null
          feature_flags?: Json
          duration_ms?: number | null
          error?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          operation_type?: string
          input_data?: Json
          output_data?: Json | null
          image_urls?: string[] | null
          feature_flags?: Json
          duration_ms?: number | null
          error?: string | null
          created_at?: string
        }
      }
      feature_flags: {
        Row: {
          id: string
          key: string
          enabled: boolean
          description: string
          config: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          enabled?: boolean
          description: string
          config?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          enabled?: boolean
          description?: string
          config?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: UserRole
          clinic_id: string | null
          permissions: Json | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          role?: UserRole
          clinic_id?: string | null
          permissions?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          role?: UserRole
          clinic_id?: string | null
          permissions?: Json | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      clinic_images: {
        Row: {
          id: string
          clinic_id: string
          image_url: string
          image_type: 'hero' | 'gallery' | 'before_after' | 'certificate' | 'facility' | 'team'
          caption: string | null
          display_order: number | null
          is_featured: boolean | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          image_url: string
          image_type: 'hero' | 'gallery' | 'before_after' | 'certificate' | 'facility' | 'team'
          caption?: string | null
          display_order?: number | null
          is_featured?: boolean | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          image_url?: string
          image_type?: 'hero' | 'gallery' | 'before_after' | 'certificate' | 'facility' | 'team'
          caption?: string | null
          display_order?: number | null
          is_featured?: boolean | null
          metadata?: Json | null
          created_at?: string
        }
      }
      clinic_videos: {
        Row: {
          id: string
          clinic_id: string
          video_url: string
          title: string | null
          description: string | null
          thumbnail_url: string | null
          duration_seconds: number | null
          display_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          video_url: string
          title?: string | null
          description?: string | null
          thumbnail_url?: string | null
          duration_seconds?: number | null
          display_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          video_url?: string
          title?: string | null
          description?: string | null
          thumbnail_url?: string | null
          duration_seconds?: number | null
          display_order?: number | null
          created_at?: string
        }
      }
      clinic_team_members: {
        Row: {
          id: string
          clinic_id: string
          full_name: string
          title: string | null
          photo_url: string | null
          specializations: string[] | null
          certifications: Json | null
          experience_years: number | null
          languages: string[] | null
          bio: string | null
          display_order: number | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          full_name: string
          title?: string | null
          photo_url?: string | null
          specializations?: string[] | null
          certifications?: Json | null
          experience_years?: number | null
          languages?: string[] | null
          bio?: string | null
          display_order?: number | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          full_name?: string
          title?: string | null
          photo_url?: string | null
          specializations?: string[] | null
          certifications?: Json | null
          experience_years?: number | null
          languages?: string[] | null
          bio?: string | null
          display_order?: number | null
          is_active?: boolean | null
          created_at?: string
        }
      }
      clinic_services: {
        Row: {
          id: string
          clinic_id: string
          service_name: string
          description: string | null
          base_price: number | null
          currency: string | null
          duration_hours: number | null
          recovery_days: number | null
          is_featured: boolean | null
          display_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          service_name: string
          description?: string | null
          base_price?: number | null
          currency?: string | null
          duration_hours?: number | null
          recovery_days?: number | null
          is_featured?: boolean | null
          display_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          service_name?: string
          description?: string | null
          base_price?: number | null
          currency?: string | null
          duration_hours?: number | null
          recovery_days?: number | null
          is_featured?: boolean | null
          display_order?: number | null
          created_at?: string
        }
      }
      clinic_packages: {
        Row: {
          id: string
          clinic_id: string
          package_name: string
          tier: 'Basic' | 'Standard' | 'Premium' | null
          price: number | null
          currency: string | null
          graft_range_min: number | null
          graft_range_max: number | null
          inclusions: Json | null
          description: string | null
          is_active: boolean | null
          display_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          package_name: string
          tier?: 'Basic' | 'Standard' | 'Premium' | null
          price?: number | null
          currency?: string | null
          graft_range_min?: number | null
          graft_range_max?: number | null
          inclusions?: Json | null
          description?: string | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          package_name?: string
          tier?: 'Basic' | 'Standard' | 'Premium' | null
          price?: number | null
          currency?: string | null
          graft_range_min?: number | null
          graft_range_max?: number | null
          inclusions?: Json | null
          description?: string | null
          is_active?: boolean | null
          display_order?: number | null
          created_at?: string
        }
      }
      clinic_statistics: {
        Row: {
          id: string
          clinic_id: string
          total_procedures: number | null
          success_rate_percent: number | null
          average_rating: number | null
          total_reviews: number | null
          years_established: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          total_procedures?: number | null
          success_rate_percent?: number | null
          average_rating?: number | null
          total_reviews?: number | null
          years_established?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          total_procedures?: number | null
          success_rate_percent?: number | null
          average_rating?: number | null
          total_reviews?: number | null
          years_established?: number | null
          updated_at?: string
        }
      }
      clinic_facilities: {
        Row: {
          id: string
          clinic_id: string
          facility_name: string
          description: string | null
          icon: string | null
          display_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          facility_name: string
          description?: string | null
          icon?: string | null
          display_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          facility_name?: string
          description?: string | null
          icon?: string | null
          display_order?: number | null
          created_at?: string
        }
      }
      clinic_lead_views: {
        Row: {
          id: string
          clinic_id: string
          lead_id: string
          viewed_at: string | null
          is_purchased: boolean | null
          purchased_at: string | null
          credits_spent: number | null
        }
        Insert: {
          id?: string
          clinic_id: string
          lead_id: string
          viewed_at?: string | null
          is_purchased?: boolean | null
          purchased_at?: string | null
          credits_spent?: number | null
        }
        Update: {
          id?: string
          clinic_id?: string
          lead_id?: string
          viewed_at?: string | null
          is_purchased?: boolean | null
          purchased_at?: string | null
          credits_spent?: number | null
        }
      }
      lead_images: {
        Row: {
          id: string
          lead_id: string
          storage_path: string
          image_type: 'scalp' | 'simulation' | 'original' | 'analysis'
          metadata: Json | null
          created_at: string
          thumbnail_path: string | null
          file_size_bytes: number | null
          mime_type: string | null
        }
        Insert: {
          id?: string
          lead_id: string
          storage_path: string
          image_type: 'scalp' | 'simulation' | 'original' | 'analysis'
          metadata?: Json | null
          created_at?: string
          thumbnail_path?: string | null
          file_size_bytes?: number | null
          mime_type?: string | null
        }
        Update: {
          id?: string
          lead_id?: string
          storage_path?: string
          image_type?: 'scalp' | 'simulation' | 'original' | 'analysis'
          metadata?: Json | null
          created_at?: string
          thumbnail_path?: string | null
          file_size_bytes?: number | null
          mime_type?: string | null
        }
      }
      proposals: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          lead_id: string
          clinic_id: string
          price: number
          currency: string
          treatment_type: string
          package_tier: string
          inclusions: Json
          message: string | null
          status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          title: string | null
          description: string | null
          details: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          lead_id: string
          clinic_id: string
          price: number
          currency?: string
          treatment_type: string
          package_tier: string
          inclusions: Json
          message?: string | null
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          title?: string | null
          description?: string | null
          details?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          lead_id?: string
          clinic_id?: string
          price?: number
          currency?: string
          treatment_type?: string
          package_tier?: string
          inclusions?: Json
          message?: string | null
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          title?: string | null
          description?: string | null
          details?: Json | null
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
          is_active: boolean | null
          created_at: string
          created_by: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          name: string
          version: string
          prompt_text: string
          description?: string
          is_active?: boolean | null
          created_at?: string
          created_by?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          name?: string
          version?: string
          prompt_text?: string
          description?: string
          is_active?: boolean | null
          created_at?: string
          created_by?: string | null
          metadata?: Json | null
        }
      }
      prompt_usage_logs: {
        Row: {
          id: string
          prompt_id: string | null
          prompt_name: string
          prompt_version: string
          execution_time_ms: number | null
          token_count: number | null
          model: string
          success: boolean | null
          error_message: string | null
          input_hash: string | null
          output_size_bytes: number | null
          created_at: string
          user_id: string | null
          session_id: string | null
        }
        Insert: {
          id?: string
          prompt_id?: string | null
          prompt_name: string
          prompt_version: string
          execution_time_ms?: number | null
          token_count?: number | null
          model?: string
          success?: boolean | null
          error_message?: string | null
          input_hash?: string | null
          output_size_bytes?: number | null
          created_at?: string
          user_id?: string | null
          session_id?: string | null
        }
        Update: {
          id?: string
          prompt_id?: string | null
          prompt_name?: string
          prompt_version?: string
          execution_time_ms?: number | null
          token_count?: number | null
          model?: string
          success?: boolean | null
          error_message?: string | null
          input_hash?: string | null
          output_size_bytes?: number | null
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
          resolved: boolean | null
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
          resolved?: boolean | null
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
          resolved?: boolean | null
          resolution_notes?: string | null
        }
      }
      api_rate_limits: {
        Row: {
          id: string
          user_id: string | null
          anonymous_id: string | null
          endpoint: string
          request_count: number | null
          window_start: string | null
          last_request_at: string | null
          blocked_until: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          anonymous_id?: string | null
          endpoint: string
          request_count?: number | null
          window_start?: string | null
          last_request_at?: string | null
          blocked_until?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string | null
          anonymous_id?: string | null
          endpoint?: string
          request_count?: number | null
          window_start?: string | null
          last_request_at?: string | null
          blocked_until?: string | null
          metadata?: Json | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          success: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          success?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          success?: boolean | null
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
      user_role: UserRole
    }
  }
}
