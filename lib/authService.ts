import { supabase } from './supabase';
import { logger } from './logger';

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
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      logger.error('Google sign in error', 'AuthService', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    logger.error('Unexpected error during Google sign in', 'AuthService', error);
    return { success: false, error: 'Google ile giriş yapılırken bir hata oluştu.' };
  }
};

export const signInWithApple = async (): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      logger.error('Apple sign in error', 'AuthService', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    logger.error('Unexpected error during Apple sign in', 'AuthService', error);
    return { success: false, error: 'Apple ile giriş yapılırken bir hata oluştu.' };
  }
};

export const signOut = async (): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Sign out error', 'AuthService', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    logger.error('Unexpected error during sign out', 'AuthService', error);
    return { success: false, error: 'Çıkış yapılırken bir hata oluştu.' };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      logger.error('Get user error', 'AuthService', error);
      return null;
    }

    return user;
  } catch (error: any) {
    logger.error('Unexpected error getting user', 'AuthService', error);
    return null;
  }
};