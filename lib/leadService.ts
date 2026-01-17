import { supabase } from './supabase';
import type { Database } from './database.types';

type Lead = Database['public']['Tables']['leads']['Row'];
type LeadInsert = Database['public']['Tables']['leads']['Insert'];
type LeadUpdate = Database['public']['Tables']['leads']['Update'];
type LeadImage = Database['public']['Tables']['lead_images']['Row'];
type LeadImageInsert = Database['public']['Tables']['lead_images']['Insert'];

export interface CreateLeadData {
  name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  concerns?: string[];
  norwood_scale?: string;
  estimated_grafts?: string;
  clinic_id?: string;
  source?: string;
  scan_data?: Record<string, any>;
  analysis_data?: Record<string, any>;
  patient_details?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface LeadWithImages extends Lead {
  images?: LeadImage[];
}

export const leadService = {
  async createLead(data: CreateLeadData): Promise<{ data: Lead | null; error: any }> {
    const leadData: LeadInsert = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      age: data.age,
      gender: data.gender,
      concerns: data.concerns || [],
      norwood_scale: data.norwood_scale,
      estimated_grafts: data.estimated_grafts,
      clinic_id: data.clinic_id,
      source: data.source || 'scanner',
      scan_data: data.scan_data || {},
      analysis_data: data.analysis_data,
      patient_details: data.patient_details,
      metadata: data.metadata || {},
      status: 'AVAILABLE',
    };

    const { data: lead, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .maybeSingle();

    return { data: lead, error };
  },

  async getLeadById(leadId: string): Promise<{ data: LeadWithImages | null; error: any }> {
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*, lead_images(*)')
      .eq('id', leadId)
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    return { data: lead as LeadWithImages, error: null };
  },

  async getAllLeads(filters?: {
    status?: string;
    clinic_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: LeadWithImages[] | null; error: any }> {
    let query = supabase
      .from('leads')
      .select('*, lead_images(*)')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.clinic_id) {
      query = query.eq('clinic_id', filters.clinic_id);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    return { data: data as LeadWithImages[], error };
  },

  async updateLead(leadId: string, updates: LeadUpdate): Promise<{ data: Lead | null; error: any }> {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', leadId)
      .select()
      .maybeSingle();

    return { data, error };
  },

  async deleteLead(leadId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    return { error };
  },

  async uploadLeadImage(
    leadId: string,
    file: File,
    imageType: string
  ): Promise<{ data: { path: string; url: string } | null; error: any }> {
    const timestamp = Date.now();
    const fileName = `${imageType}_${timestamp}_${file.name}`;
    const filePath = `${leadId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('scalp-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('scalp-images')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('lead_images')
      .insert({
        lead_id: leadId,
        storage_path: filePath,
        image_type: imageType,
        mime_type: file.type,
        file_size_bytes: file.size,
        metadata: {
          original_name: file.name,
          uploaded_at: new Date().toISOString(),
        },
      });

    if (dbError) {
      return { data: null, error: dbError };
    }

    return {
      data: {
        path: filePath,
        url: publicUrl,
      },
      error: null,
    };
  },

  async uploadLeadImageFromBlob(
    leadId: string,
    blob: Blob,
    fileName: string,
    imageType: string
  ): Promise<{ data: { path: string; url: string } | null; error: any }> {
    const timestamp = Date.now();
    const fullFileName = `${imageType}_${timestamp}_${fileName}`;
    const filePath = `${leadId}/${fullFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('scalp-images')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('scalp-images')
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase
      .from('lead_images')
      .insert({
        lead_id: leadId,
        storage_path: filePath,
        image_type: imageType,
        mime_type: blob.type,
        file_size_bytes: blob.size,
        metadata: {
          original_name: fileName,
          uploaded_at: new Date().toISOString(),
        },
      });

    if (dbError) {
      return { data: null, error: dbError };
    }

    return {
      data: {
        path: filePath,
        url: publicUrl,
      },
      error: null,
    };
  },

  async uploadScalpPhotosFromDataUrls(
    leadId: string,
    photos: Array<{ id: string; preview: string; label?: string }>
  ): Promise<{ success: number; errors: Array<{ id: string; error: any }> }> {
    let success = 0;
    const errors: Array<{ id: string; error: any }> = [];

    for (const photo of photos) {
      if (!photo.preview || typeof photo.preview !== 'string') {
        errors.push({ id: photo.id, error: 'Invalid preview data' });
        continue;
      }

      try {
        const res = await fetch(photo.preview);
        const blob = await res.blob();
        const file = new File([blob], `${photo.id}.jpg`, { type: blob.type || 'image/jpeg' });

        const result = await this.uploadLeadImage(leadId, file, photo.id);

        if (result.error) {
          errors.push({ id: photo.id, error: result.error });
        } else {
          success++;
        }
      } catch (err) {
        errors.push({ id: photo.id, error: err });
      }
    }

    return { success, errors };
  },

  async getLeadImages(leadId: string): Promise<{ data: LeadImage[] | null; error: any }> {
    const { data, error } = await supabase
      .from('lead_images')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  async deleteLeadImage(imageId: string): Promise<{ error: any }> {
    const { data: image, error: fetchError } = await supabase
      .from('lead_images')
      .select('storage_path')
      .eq('id', imageId)
      .maybeSingle();

    if (fetchError || !image) {
      return { error: fetchError };
    }

    const { error: storageError } = await supabase.storage
      .from('scalp-images')
      .remove([image.storage_path]);

    if (storageError) {
      return { error: storageError };
    }

    const { error: dbError } = await supabase
      .from('lead_images')
      .delete()
      .eq('id', imageId);

    return { error: dbError };
  },

  subscribeToLeads(
    callback: (payload: any) => void,
    filters?: { clinic_id?: string }
  ) {
    let channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: filters?.clinic_id ? `clinic_id=eq.${filters.clinic_id}` : undefined,
        },
        callback
      )
      .subscribe();

    return channel;
  },
};
