import { supabase } from './supabase';

interface AuthResponse {
  success: boolean;
  error?: string;
  userId?: string;
}

export const sendPhoneOtp = async (phone: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (error) {
      console.error('Phone OTP Send Error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected Error (Phone OTP):', error);
    return { success: false, error: 'SMS gönderilirken bir hata oluştu.' };
  }
};

export const verifyPhoneOtp = async (phone: string, token: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) {
      console.error('Phone OTP Verify Error:', error.message);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Kullanıcı bilgisi alınamadı.' };
    }

    return { success: true, userId: data.user.id };
  } catch (error: any) {
    console.error('Unexpected Error (Verify OTP):', error);
    return { success: false, error: 'Kod doğrulanırken bir hata oluştu.' };
  }
};

export const signOut = async (): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign Out Error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected Error (Sign Out):', error);
    return { success: false, error: 'Çıkış yapılırken bir hata oluştu.' };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Get User Error:', error.message);
      return null;
    }

    return user;
  } catch (error: any) {
    console.error('Unexpected Error (Get User):', error);
    return null;
  }
};
