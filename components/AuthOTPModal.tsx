import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, Loader2, Phone } from 'lucide-react';
import { sendOtp, verifyOtp } from '../lib/authService';
import { LanguageCode } from '../translations';

interface AuthOTPModalProps {
  onComplete: (authData: { type: 'email' | 'phone'; value: string }) => void;
  lang: LanguageCode;
}

type Step = 'input' | 'verify';
type ContactType = 'email' | 'phone';

export default function AuthOTPModal({ onComplete, lang }: AuthOTPModalProps) {
  const [step, setStep] = useState<Step>('input');
  const [contactType, setContactType] = useState<ContactType>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Yükleniyor durumları
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEN = lang === 'EN';
  const isTR = lang === 'TR';

  // 1. Aşama: Kod Gönder
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const contactValue = contactType === 'email' ? email : phone;
    const result = await sendOtp(contactValue);

    setLoading(false);

    if (result.success) {
      setStep('verify');
    } else {
      setError(result.error || (isTR ? 'Kod gönderilemedi.' : 'Failed to send code.'));
    }
  };

  // 2. Aşama: Kodu Doğrula
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const contactValue = contactType === 'email' ? email : phone;
    const result = await verifyOtp(contactValue, otpCode);

    setLoading(false);

    if (result.success) {
      onComplete({
        type: contactType,
        value: contactValue,
      });
    } else {
      setError(result.error || (isTR ? 'Kod hatalı.' : 'Invalid code.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl">

        {/* Başlık */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {contactType === 'email' ? (
              <Mail className="w-8 h-8 text-teal-600" />
            ) : (
              <Phone className="w-8 h-8 text-teal-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {step === 'input'
              ? (isTR ? 'Giriş Yap / Kayıt Ol' : 'Sign In / Register')
              : (isTR ? 'Kodu Doğrula' : 'Verify Code')}
          </h2>
          <p className="text-slate-600">
            {step === 'input'
              ? (isTR
                  ? 'Analiz sonucunuzu kaydetmek için iletişim bilgilerinizi girin.'
                  : 'Enter your contact information to save your analysis results.')
              : (isTR
                  ? `${contactType === 'email' ? email : phone} adresine gönderilen 6 haneli kodu girin.`
                  : `Enter the 6-digit code sent to ${contactType === 'email' ? email : phone}.`)}
          </p>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* FORM 1: E-posta veya Telefon Girişi */}
        {step === 'input' && (
          <form onSubmit={handleSendCode} className="space-y-6">
            {/* Contact Type Selector */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setContactType('email')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  contactType === 'email'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-4 h-4" />
                {isTR ? 'E-posta' : 'Email'}
              </button>
              <button
                type="button"
                onClick={() => setContactType('phone')}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  contactType === 'phone'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Phone className="w-4 h-4" />
                {isTR ? 'Telefon' : 'Phone'}
              </button>
            </div>

            {/* Input Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {contactType === 'email'
                  ? (isTR ? 'E-Posta Adresi' : 'Email Address')
                  : (isTR ? 'Telefon Numarası' : 'Phone Number')}
              </label>
              {contactType === 'email' ? (
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isTR ? 'ornek@email.com' : 'example@email.com'}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                />
              ) : (
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 555 123 4567"
                  className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isTR ? 'Gönderiliyor...' : 'Sending...'}
                </>
              ) : (
                <>
                  {isTR ? 'Kod Gönder' : 'Send Code'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* FORM 2: Kod Doğrulama */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {isTR ? 'Doğrulama Kodu' : 'Verification Code'}
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-4 text-slate-900 text-center text-2xl tracking-widest focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isTR ? 'Doğrulanıyor...' : 'Verifying...'}
                </>
              ) : (
                <>
                  {isTR ? 'Girişi Tamamla' : 'Complete Sign In'}
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('input');
                setError(null);
              }}
              className="w-full text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              {isTR
                ? `${contactType === 'email' ? 'E-posta' : 'Telefon'} adresini değiştir`
                : `Change ${contactType === 'email' ? 'email' : 'phone'} address`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}