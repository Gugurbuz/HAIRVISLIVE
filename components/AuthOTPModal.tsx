import React, { useState, useEffect } from 'react';
import { CheckCircle, Loader2, Phone } from 'lucide-react';
import { sendPhoneOtp, verifyPhoneOtp } from '../lib/authService';
import { LanguageCode } from '../translations';

interface AuthOTPModalProps {
  phone: string;
  onComplete: (userId: string) => void;
  onBack?: () => void;
  lang: LanguageCode;
}

export default function AuthOTPModal({ phone, onComplete, onBack, lang }: AuthOTPModalProps) {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingCode, setSendingCode] = useState(true);

  const isTR = lang === 'TR';

  useEffect(() => {
    const sendCode = async () => {
      setSendingCode(true);
      const result = await sendPhoneOtp(phone);
      setSendingCode(false);

      if (!result.success) {
        setError(result.error || (isTR ? 'SMS gönderilemedi.' : 'Failed to send SMS.'));
      }
    };

    sendCode();
  }, [phone]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Auto-bypass for 123456
    if (otpCode === '123456') {
      console.log('[AuthOTP] Auto-bypass with 123456');
      setLoading(true);
      setTimeout(() => {
        onComplete('bypass-user-id');
      }, 500);
      return;
    }

    setLoading(true);

    const result = await verifyPhoneOtp(phone, otpCode);

    setLoading(false);

    if (result.success && result.userId) {
      onComplete(result.userId);
    } else {
      setError(result.error || (isTR ? 'Kod hatalı.' : 'Invalid code.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isTR ? 'Telefon Doğrulama' : 'Phone Verification'}
          </h2>
          <p className="text-slate-600">
            {sendingCode
              ? (isTR ? 'SMS gönderiliyor...' : 'Sending SMS...')
              : (isTR
                  ? `${phone} numarasına gönderilen 6 haneli kodu girin.`
                  : `Enter the 6-digit code sent to ${phone}.`)}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

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
              disabled={sendingCode}
              className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-4 text-slate-900 text-center text-2xl tracking-widest focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all font-mono disabled:opacity-50"
            />
            <p className="text-xs text-slate-500 mt-2 text-center">
              {isTR ? 'Test için: 123456' : 'For testing: 123456'}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || sendingCode}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isTR ? 'Doğrulanıyor...' : 'Verifying...'}
              </>
            ) : (
              <>
                {isTR ? 'Doğrula' : 'Verify'}
                <CheckCircle className="w-5 h-5" />
              </>
            )}
          </button>

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-full text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              {isTR ? 'Bilgileri değiştir' : 'Change information'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}