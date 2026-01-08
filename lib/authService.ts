import { supabase } from './supabase';

export type OTPType = 'email' | 'sms';

interface AuthResponse {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Kullanıcıya E-posta ile OTP (Tek Seferlik Kod) gönderir.
 * @param email - Kullanıcının email adresi
 */
export const sendOtp = async (email: string): Promise<AuthResponse> => {
  try {
    // Email formatı basit kontrol
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Geçerli bir e-posta adresi giriniz.' };
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // Kullanıcı yeni ise otomatik kayıt olsun mu? Evet.
        shouldCreateUser: true,
        // Bu link, Supabase ayarlarındaki Site URL ile eşleşmeli
        // Localhost'ta çalışırken sorun yaşamamak için genelde window.location kullanırız
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });

    if (error) {
      console.error('OTP Gönderme Hatası:', error.message);
      // Supabase'in bazı hata mesajları çok tekniktir, kullanıcıya sadeleştirelim
      if (error.message.includes("Signups not allowed")) {
         return { success: false, error: "Yeni üye alımı şu an kapalıdır." };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data };

  } catch (error: any) {
    console.error('Beklenmeyen Hata (Send):', error);
    return { success: false, error: 'Kod gönderilirken bir hata oluştu.' };
  }
};

/**
 * Kullanıcının e-postasına gelen 6 haneli kodu doğrular.
 * @param email - Kullanıcının email adresi
 * @param token - Gelen 6 haneli kod
 */
export const verifyOtp = async (email: string, token: string): Promise<AuthResponse> => {
  try {
    if (!token || token.length < 6) {
      return { success: false, error: 'Lütfen 6 haneli kodu eksiksiz girin.' };
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email',
    });

    if (error) {
      console.error('Doğrulama Hatası:', error.message);
      return { success: false, error: 'Girdiğiniz kod hatalı veya süresi dolmuş.' };
    }

    // Başarılı giriş
    return { success: true, data };

  } catch (error: any) {
    console.error('Beklenmeyen Hata (Verify):', error);
    return { success: false, error: 'Doğrulama sırasında teknik bir sorun oluştu.' };
  }
};