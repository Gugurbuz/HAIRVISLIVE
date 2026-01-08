import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { signInWithGoogle, signInWithApple, getCurrentUser } from '../lib/authService';
import { LanguageCode } from '../translations';
import { supabase } from '../lib/supabase';

interface SocialAuthModalProps {
  onComplete: (authData: { email: string; name: string; userId: string }) => void;
  lang: LanguageCode;
}

export default function SocialAuthModal({ onComplete, lang }: SocialAuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<'google' | 'apple' | null>(null);

  const isTR = lang === 'TR';

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        onComplete({
          email: user.email || '',
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          userId: user.id,
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [onComplete]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    setProvider('google');

    const result = await signInWithGoogle();

    if (!result.success) {
      setError(result.error || (isTR ? 'Google ile giriş yapılamadı.' : 'Failed to sign in with Google.'));
      setLoading(false);
      setProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    setError(null);
    setLoading(true);
    setProvider('apple');

    const result = await signInWithApple();

    if (!result.success) {
      setError(result.error || (isTR ? 'Apple ile giriş yapılamadı.' : 'Failed to sign in with Apple.'));
      setLoading(false);
      setProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isTR ? 'Giriş Yap' : 'Sign In'}
          </h2>
          <p className="text-slate-600">
            {isTR
              ? 'Analiz sonucunuzu kaydetmek için giriş yapın.'
              : 'Sign in to save your analysis results.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-50 text-slate-900 font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border-2 border-slate-200 hover:border-slate-300"
          >
            {loading && provider === 'google' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isTR ? 'Yönlendiriliyor...' : 'Redirecting...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {isTR ? 'Google ile Devam Et' : 'Continue with Google'}
              </>
            )}
          </button>

          <button
            onClick={handleAppleSignIn}
            disabled={loading}
            className="w-full bg-black hover:bg-slate-900 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading && provider === 'apple' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isTR ? 'Yönlendiriliyor...' : 'Redirecting...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                {isTR ? 'Apple ile Devam Et' : 'Continue with Apple'}
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-6">
          {isTR
            ? 'Giriş yaparak KVKK ve Gizlilik Politikasını kabul etmiş olursunuz.'
            : 'By signing in, you agree to our Privacy Policy and Terms.'}
        </p>
      </div>
    </div>
  );
}
