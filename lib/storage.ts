import { supabase } from './supabase';
import { logger } from './logger';

export const uploadLeadImage = async (
  leadId: string,
  imageData: string,
  imageType: 'thumbnail' | 'simulation' | 'planning'
): Promise<string | null> => {
  try {
    const base64Data = imageData.includes(',')
      ? imageData.split(',')[1]
      : imageData;

    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const blob = new Blob([buffer], { type: 'image/png' });

    const fileName = `${leadId}/${imageType}_${Date.now()}.png`;

    const { data, error } = await supabase.storage
      .from('lead-images')
      .upload(fileName, blob, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      logger.error('Error uploading image', 'Storage', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('lead-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    logger.error('Error processing image upload', 'Storage', error);
    return null;
  }
};

export const deleteLeadImages = async (leadId: string): Promise<boolean> => {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from('lead-images')
      .list(leadId);

    if (listError || !files || files.length === 0) {
      return true;
    }

    const filePaths = files.map(file => `${leadId}/${file.name}`);

    const { error: deleteError } = await supabase.storage
      .from('lead-images')
      .remove(filePaths);

    if (deleteError) {
      logger.error('Error deleting images', 'Storage', deleteError);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Error processing image deletion', 'Storage', error);
    return false;
  }
};
