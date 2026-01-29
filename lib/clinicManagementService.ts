import { supabase } from './supabase';
import type { Database } from './database.types';

type Clinic = Database['public']['Tables']['clinics']['Row'];
type ClinicUpdate = Database['public']['Tables']['clinics']['Update'];

export interface ClinicProfileUpdate {
  name?: string;
  description?: string;
  location?: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  founding_year?: number;
  languages_spoken?: string[];
  response_time_hours?: number;
  social_media?: Record<string, string>;
  operating_hours?: Record<string, any>;
}

export interface ClinicImage {
  id?: string;
  clinic_id: string;
  image_url: string;
  image_type: 'hero' | 'gallery' | 'before_after' | 'certificate' | 'facility' | 'team';
  caption?: string;
  display_order?: number;
  is_featured?: boolean;
  metadata?: Record<string, any>;
}

export interface ClinicVideo {
  id?: string;
  clinic_id: string;
  video_url: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  display_order?: number;
}

export interface TeamMember {
  id?: string;
  clinic_id: string;
  full_name: string;
  title?: string;
  photo_url?: string;
  specializations?: string[];
  certifications?: any[];
  experience_years?: number;
  languages?: string[];
  bio?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface ClinicService {
  id?: string;
  clinic_id: string;
  service_name: string;
  description?: string;
  base_price?: number;
  currency?: string;
  duration_hours?: number;
  recovery_days?: number;
  is_featured?: boolean;
  display_order?: number;
}

export interface ClinicPackage {
  id?: string;
  clinic_id: string;
  package_name: string;
  tier?: 'Basic' | 'Standard' | 'Premium';
  price?: number;
  currency?: string;
  graft_range_min?: number;
  graft_range_max?: number;
  inclusions?: any[];
  description?: string;
  is_active?: boolean;
  display_order?: number;
}

export interface LeadFilters {
  location?: string;
  age_min?: number;
  age_max?: number;
  norwood_scale?: string[];
  grafts_min?: number;
  grafts_max?: number;
  status?: string;
  limit?: number;
  offset?: number;
}

export const clinicManagementService = {
  // ============================================
  // PROFILE MANAGEMENT
  // ============================================
  async getClinicByUserId(userId: string): Promise<{ data: Clinic | null; error: any }> {
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('clinic_id')
      .eq('user_id', userId)
      .eq('role', 'clinic')
      .maybeSingle();

    if (roleError || !userRole?.clinic_id) {
      return { data: null, error: roleError || new Error('No clinic associated with user') };
    }

    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', userRole.clinic_id)
      .maybeSingle();

    return { data, error };
  },

  async updateClinicProfile(
    clinicId: string,
    updates: ClinicProfileUpdate
  ): Promise<{ data: Clinic | null; error: any }> {
    const { data, error } = await supabase
      .from('clinics')
      .update(updates)
      .eq('id', clinicId)
      .select()
      .maybeSingle();

    return { data, error };
  },

  async uploadClinicLogo(
    clinicId: string,
    file: File
  ): Promise<{ data: { url: string } | null; error: any }> {
    const fileName = `${clinicId}/logo_${Date.now()}_${file.name}`;
    const filePath = `clinic-logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('clinic-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('clinic-assets')
      .getPublicUrl(filePath);

    await supabase
      .from('clinics')
      .update({ logo_url: publicUrl })
      .eq('id', clinicId);

    return { data: { url: publicUrl }, error: null };
  },

  // ============================================
  // IMAGE MANAGEMENT
  // ============================================
  async addClinicImage(image: ClinicImage): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('clinic_images')
      .insert(image)
      .select()
      .maybeSingle();

    return { data, error };
  },

  async uploadClinicImage(
    clinicId: string,
    file: File,
    imageType: ClinicImage['image_type'],
    caption?: string
  ): Promise<{ data: { url: string; id: string } | null; error: any }> {
    const fileName = `${clinicId}/${imageType}/${Date.now()}_${file.name}`;
    const filePath = `clinic-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('clinic-assets')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('clinic-assets')
      .getPublicUrl(filePath);

    const { data, error } = await supabase
      .from('clinic_images')
      .insert({
        clinic_id: clinicId,
        image_url: publicUrl,
        image_type: imageType,
        caption: caption || '',
      })
      .select()
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    return { data: { url: publicUrl, id: data.id }, error: null };
  },

  async getClinicImages(
    clinicId: string,
    imageType?: ClinicImage['image_type']
  ): Promise<{ data: any[] | null; error: any }> {
    let query = supabase
      .from('clinic_images')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('display_order', { ascending: true });

    if (imageType) {
      query = query.eq('image_type', imageType);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async updateClinicImage(
    imageId: string,
    updates: Partial<ClinicImage>
  ): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('clinic_images')
      .update(updates)
      .eq('id', imageId)
      .select()
      .maybeSingle();

    return { data, error };
  },

  async deleteClinicImage(imageId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('clinic_images')
      .delete()
      .eq('id', imageId);

    return { error };
  },

  // ============================================
  // VIDEO MANAGEMENT
  // ============================================
  async addClinicVideo(video: ClinicVideo): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('clinic_videos')
      .insert(video)
      .select()
      .maybeSingle();

    return { data, error };
  },

  async getClinicVideos(clinicId: string): Promise<{ data: any[] | null; error: any }> {
    const { data, error } = await supabase
      .from('clinic_videos')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('display_order', { ascending: true });

    return { data, error };
  },

  async updateClinicVideo(
    videoId: string,
    updates: Partial<ClinicVideo>
  ): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('clinic_videos')
      .update(updates)
      .eq('id', videoId)
      .select()
      .maybeSingle();

    return { data, error };
  },

  async deleteClinicVideo(videoId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('clinic_videos')
      .delete()
      .eq('id', videoId);

    return { error };
  },

  // ============================================
  // TEAM MANAGEMENT
  // ============================================
  async addTeamMember(member: TeamMember): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('clinic_team_members')
      .insert(member)
      .select()
      .maybeSingle();

    return { data, error };
  },

  async getTeamMembers(clinicId: string): Promise<{ data: any[] | null; error: any }> {
    const { data, error } = await supabase
      .from('clinic_team_members')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    return { data, error };
  },

  async updateTeamMember(
    memberId: string,
    updates: Partial<TeamMember>
  ): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('clinic_team_members')
      .update(updates)
      .eq('id', memberId)
      .select()
      .maybeSingle();

    return { data, error };
  },

  async deleteTeamMember(memberId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('clinic_team_members')
      .update({ is_active: false })
      .eq('id', memberId);

    return { error };
  },

  // ============================================
  // SERVICES MANAGEMENT
  // ============================================
  async addService(service: ClinicService): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('clinic_services')
      .insert(service)
      .select()
      .maybeSingle();

    return { data, error };
  },

  async getServices(clinicId: string): Promise<{ data: any[] | null; error: any }> {
    const { data, error } = await supabase
      .from('clinic_services')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('display_order', { ascending: true });

    return { data, error };
  },

  async updateService(
    serviceId: string,
    updates: Partial<ClinicService>
  ): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('clinic_services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .maybeSingle();

    return { data, error };
  },

  async deleteService(serviceId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('clinic_services')
      .delete()
      .eq('id', serviceId);

    return { error };
  },

  // ============================================
  // PACKAGES MANAGEMENT
  // ============================================
  async addPackage(pkg: ClinicPackage): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('clinic_packages')
      .insert(pkg)
      .select()
      .maybeSingle();

    return { data, error };
  },

  async getPackages(clinicId: string): Promise<{ data: any[] | null; error: any }> {
    const { data, error } = await supabase
      .from('clinic_packages')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    return { data, error };
  },

  async updatePackage(
    packageId: string,
    updates: Partial<ClinicPackage>
  ): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('clinic_packages')
      .update(updates)
      .eq('id', packageId)
      .select()
      .maybeSingle();

    return { data, error };
  },

  async deletePackage(packageId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('clinic_packages')
      .update({ is_active: false })
      .eq('id', packageId);

    return { error };
  },

  // ============================================
  // LEAD MARKETPLACE
  // ============================================
  async getAvailableLeads(filters?: LeadFilters): Promise<{ data: any[] | null; error: any }> {
    let query = supabase
      .from('leads')
      .select('*, lead_images(*)')
      .eq('status', 'AVAILABLE')
      .order('created_at', { ascending: false });

    if (filters?.location) {
      query = query.ilike('country_code', `%${filters.location}%`);
    }

    if (filters?.age_min) {
      query = query.gte('age', filters.age_min);
    }

    if (filters?.age_max) {
      query = query.lte('age', filters.age_max);
    }

    if (filters?.norwood_scale?.length) {
      query = query.in('norwood_scale', filters.norwood_scale);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async getPurchasedLeads(clinicId: string): Promise<{ data: any[] | null; error: any }> {
    const { data, error } = await supabase
      .from('clinic_lead_views')
      .select(`
        *,
        lead:leads(*, lead_images(*))
      `)
      .eq('clinic_id', clinicId)
      .eq('is_purchased', true)
      .order('purchased_at', { ascending: false });

    return { data, error };
  },

  async purchaseLead(
    clinicId: string,
    leadId: string,
    creditsSpent: number
  ): Promise<{ data: any; error: any }> {
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .select('credits')
      .eq('id', clinicId)
      .maybeSingle();

    if (clinicError || !clinic) {
      return { data: null, error: clinicError || new Error('Clinic not found') };
    }

    if (clinic.credits < creditsSpent) {
      return { data: null, error: new Error('Insufficient credits') };
    }

    const { data, error } = await supabase
      .from('clinic_lead_views')
      .upsert({
        clinic_id: clinicId,
        lead_id: leadId,
        is_purchased: true,
        purchased_at: new Date().toISOString(),
        credits_spent: creditsSpent,
      })
      .select()
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    await supabase
      .from('clinics')
      .update({
        credits: clinic.credits - creditsSpent,
        total_purchased: supabase.rpc('increment', { x: 1 }),
        total_spent: (clinic as any).total_spent + creditsSpent,
      })
      .eq('id', clinicId);

    await supabase
      .from('transactions')
      .insert({
        clinic_id: clinicId,
        type: 'ACCESS',
        amount: -creditsSpent,
        description: `Purchased lead ${leadId}`,
        lead_id: leadId,
      });

    return { data, error: null };
  },

  async trackLeadView(clinicId: string, leadId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('clinic_lead_views')
      .upsert(
        {
          clinic_id: clinicId,
          lead_id: leadId,
          viewed_at: new Date().toISOString(),
        },
        {
          onConflict: 'clinic_id,lead_id',
          ignoreDuplicates: false,
        }
      );

    return { error };
  },

  // ============================================
  // ANALYTICS & STATISTICS
  // ============================================
  async getClinicStatistics(clinicId: string): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('clinic_statistics')
      .select('*')
      .eq('clinic_id', clinicId)
      .maybeSingle();

    return { data, error };
  },

  async updateStatistics(
    clinicId: string,
    updates: {
      total_procedures?: number;
      success_rate_percent?: number;
      average_rating?: number;
      total_reviews?: number;
    }
  ): Promise<{ data: any; error: any }> {
    const { data, error } = await supabase
      .from('clinic_statistics')
      .upsert({
        clinic_id: clinicId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    return { data, error };
  },

  async getLeadAnalytics(clinicId: string): Promise<{
    data: {
      total_viewed: number;
      total_purchased: number;
      conversion_rate: number;
      total_spent: number;
    } | null;
    error: any;
  }> {
    const { data: views, error: viewsError } = await supabase
      .from('clinic_lead_views')
      .select('*')
      .eq('clinic_id', clinicId);

    if (viewsError) {
      return { data: null, error: viewsError };
    }

    const totalViewed = views?.length || 0;
    const totalPurchased = views?.filter(v => v.is_purchased).length || 0;
    const totalSpent = views?.reduce((sum, v) => sum + (Number(v.credits_spent) || 0), 0) || 0;
    const conversionRate = totalViewed > 0 ? (totalPurchased / totalViewed) * 100 : 0;

    return {
      data: {
        total_viewed: totalViewed,
        total_purchased: totalPurchased,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        total_spent: totalSpent,
      },
      error: null,
    };
  },
};
