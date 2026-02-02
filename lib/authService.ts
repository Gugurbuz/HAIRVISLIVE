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

export const sendOtp = async (email: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      logger.error('Send OTP error', 'AuthService', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    logger.error('Unexpected error sending OTP', 'AuthService', error);
    return { success: false, error: 'OTP gönderilirken bir hata oluştu.' };
  }
};

export const verifyOtp = async (email: string, token: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      logger.error('Verify OTP error', 'AuthService', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    logger.error('Unexpected error verifying OTP', 'AuthService', error);
    return { success: false, error: 'OTP doğrulanırken bir hata oluştu.' };
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error('Email sign in error', 'AuthService', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    logger.error('Unexpected error during email sign in', 'AuthService', error);
    return { success: false, error: 'Giriş yapılırken bir hata oluştu.' };
  }
};

export const signUpWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      logger.error('Email sign up error', 'AuthService', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    logger.error('Unexpected error during email sign up', 'AuthService', error);
    return { success: false, error: 'Kayıt olurken bir hata oluştu.' };
  }
};