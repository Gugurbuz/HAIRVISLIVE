import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { signInWithGoogle, signInWithApple } from '../lib/authService';
import { LanguageCode } from '../translations';
import { supabase } from '../lib/supabase';

interface SocialAuthModalProps {
  onComplete: (authData: { email: string; name: string; userId: string }) => void;
  onBack?: () => void;
  lang: LanguageCode;
  mode?: 'signup' | 'signin';
}

export default function SocialAuthModal({ onComplete, onBack, lang, mode = 'signup' }: SocialAuthModalProps) {
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>(mode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<'google' | 'apple' | 'email' | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isTR = lang === 'TR';

  useEffect(() => {
    const checkExistingSession = async () => {
      console.log('[SocialAuthModal] Checking for existing session...');
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        console.log('[SocialAuthModal] Existing session found:', session.user.email);
        const user = session.user;
        onComplete({
          email: user.email || '',
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          userId: user.id,
        });
      }
    };

    checkExistingSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[SocialAuthModal] Auth state change:', event, session?.user?.email);
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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setProvider('email');

    try {
      if (authMode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error(isTR ? 'Şifreler eşleşmiyor.' : 'Passwords do not match.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (signUpError) throw signUpError;

        if (data?.user) {
          onComplete({
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || data.user.email || 'User',
            userId: data.user.id,
          });
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data?.user) {
          onComplete({
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || data.user.email || 'User',
            userId: data.user.id,
          });
        }
      }
    } catch (err: any) {
      console.error('[EmailAuth] Error:', err);
      setError(err.message || (isTR ? 'Bir hata oluştu.' : 'An error occurred.'));
    } finally {
      setLoading(false);
      setProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-4">
      <div className="w-full max-w-6xl h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Left Side - Visual */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1a2332] via-[#243447] to-[#2a4a5c] relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
            }} />
          </div>
          <div className="relative z-10 flex items-center justify-center w-full">
            <div className="text-center px-12">
              <div className="mb-8">
                <svg className="w-32 h-32 mx-auto text-teal-400 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                {isTR ? 'Geleceğini Gör' : 'Visualize Your Future'}
              </h2>
              <p className="text-lg text-slate-300">
                {isTR
                  ? 'Yapay zeka ile saç ekimi simülasyonu'
                  : 'AI-powered hair transplant simulation'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 overflow-y-auto">
          {/* Back to Home */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">{isTR ? 'Anasayfaya Dön' : 'Back to Home'}</span>
            </button>
          )}

          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-slate-900">hair</span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">simulate</span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {authMode === 'signup'
                ? (isTR ? 'Hesap Oluştur' : 'Create Account')
                : (isTR ? 'Tekrar Hoş Geldiniz' : 'Welcome back')}
            </h1>
            <p className="text-slate-600">
              {authMode === 'signup'
                ? (isTR ? 'Simülasyonunuzu görmek için giriş yapın.' : 'Sign in to view your simulation results.')
                : (isTR ? 'Simülasyonunuzu görmek için giriş yapın.' : 'Sign in to view your simulation results.')}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 text-slate-900 font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 border-2 border-slate-200"
            >
              {loading && provider === 'google' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                disabled
                className="bg-slate-100 text-slate-400 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-xs">{isTR ? 'Yakında' : 'Coming Soon'}</span>
              </button>
              <button
                disabled
                className="bg-slate-100 text-slate-400 font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="text-xs">{isTR ? 'Yakında' : 'Coming Soon'}</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500 font-medium">
                {isTR ? 'veya devam et' : 'or continue with'}
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@clinic.com"
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                {authMode === 'signin' && (
                  <button type="button" className="text-xs text-slate-500 hover:text-teal-600 font-medium">
                    {isTR ? 'Unuttum?' : 'Forgot?'}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {isTR ? 'Şifreyi Onayla' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {authMode === 'signup' && (
              <div className="flex items-start gap-2">
                <input type="checkbox" id="terms" required className="mt-1" />
                <label htmlFor="terms" className="text-xs text-slate-600">
                  {isTR ? 'Hüküm ve koşulları ve gizlilik politikasını kabul ediyorum' : 'I agree to the '}
                  <a href="#" className="text-teal-600 hover:underline">
                    {isTR ? '' : 'Terms of Service'}
                  </a>
                  {isTR ? '' : ' and '}
                  <a href="#" className="text-teal-600 hover:underline">
                    {isTR ? '' : 'Privacy Policy'}
                  </a>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading && provider === 'email'}
              className="w-full bg-[#0E1A2B] hover:bg-[#1a2d45] text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && provider === 'email' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isTR ? 'Yükleniyor...' : 'Loading...'}
                </>
              ) : (
                <>
                  {authMode === 'signup'
                    ? (isTR ? 'Hesap Oluştur' : 'Create Account')
                    : (isTR ? 'Giriş Yap' : 'Sign in to Dashboard')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              {authMode === 'signup'
                ? (isTR ? 'Hesabınız var mı? ' : 'Already have an account? ')
                : (isTR ? 'HairSimulate\'de yeni misiniz? ' : 'New to HairSimulate? ')}
              <button
                onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')}
                className="font-semibold text-teal-600 hover:underline"
              >
                {authMode === 'signup'
                  ? (isTR ? 'Giriş Yap' : 'Sign in')
                  : (isTR ? 'Hesap Oluştur' : 'Create an account')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
