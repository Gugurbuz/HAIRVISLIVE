import { supabase } from './supabase';

interface AuthResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google Sign In Error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Unexpected Error (Google):', error);
    return { success: false, error: 'Google ile giriş yapılırken bir hata oluştu.' };
  }
};

export const signInWithApple = async (): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Apple Sign In Error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Unexpected Error (Apple):', error);
    return { success: false, error: 'Apple ile giriş yapılırken bir hata oluştu.' };
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