import { supabase } from './supabase';
import type { Database } from './database.types';

type Clinic = Database['public']['Tables']['clinics']['Row'];
type ClinicInsert = Database['public']['Tables']['clinics']['Insert'];
type ClinicUpdate = Database['public']['Tables']['clinics']['Update'];

export interface CreateClinicData {
  name: string;
  slug: string;
  email: string;
  location?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  logo_url?: string;
  status?: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  clinic_info?: Record<string, any>;
  metadata?: Record<string, any>;
}

export const clinicService = {
  async createClinic(data: CreateClinicData): Promise<{ data: Clinic | null; error: any }> {
    const clinicData: ClinicInsert = {
      name: data.name,
      slug: data.slug,
      email: data.email,
      location: data.location || '',
      description: data.description || '',
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      logo_url: data.logo_url,
      status: data.status || 'ACTIVE',
      clinic_info: data.clinic_info || {},
      metadata: data.metadata || {},
      credits: 0,
      total_purchased: 0,
      total_spent: 0,
    };

    const { data: clinic, error } = await supabase
      .from('clinics')
      .insert(clinicData)
      .select()
      .maybeSingle();

    return { data: clinic, error };
  },

  async getClinicById(clinicId: string): Promise<{ data: Clinic | null; error: any }> {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', clinicId)
      .maybeSingle();

    return { data, error };
  },

  async getClinicBySlug(slug: string): Promise<{ data: Clinic | null; error: any }> {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    return { data, error };
  },

  async getClinicByEmail(email: string): Promise<{ data: Clinic | null; error: any }> {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    return { data, error };
  },

  async getAllClinics(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: Clinic[] | null; error: any }> {
    let query = supabase
      .from('clinics')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
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

  async updateClinic(clinicId: string, updates: ClinicUpdate): Promise<{ data: Clinic | null; error: any }> {
    const { data, error } = await supabase
      .from('clinics')
      .update(updates)
      .eq('id', clinicId)
      .select()
      .maybeSingle();

    return { data, error };
  },

  async deleteClinic(clinicId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('clinics')
      .delete()
      .eq('id', clinicId);

    return { error };
  },

  async getClinicLeads(clinicId: string, filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: any[] | null; error: any }> {
    let query = supabase
      .from('leads')
      .select('*, lead_images(*)')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
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

  async updateClinicCredits(
    clinicId: string,
    amount: number,
    operation: 'add' | 'subtract'
  ): Promise<{ data: Clinic | null; error: any }> {
    const { data: clinic, error: fetchError } = await supabase
      .from('clinics')
      .select('credits')
      .eq('id', clinicId)
      .maybeSingle();

    if (fetchError || !clinic) {
      return { data: null, error: fetchError };
    }

    const currentCredits = Number(clinic.credits) || 0;
    const newCredits = operation === 'add'
      ? currentCredits + amount
      : Math.max(0, currentCredits - amount);

    const { data, error } = await supabase
      .from('clinics')
      .update({ credits: newCredits })
      .eq('id', clinicId)
      .select()
      .maybeSingle();

    return { data, error };
  },
};
