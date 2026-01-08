import React, { useState } from 'react';
import { X, Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { sendOtp, verifyOtp } from '../lib/authService';

interface AuthOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'input' | 'verify';

export default function AuthOTPModal({ isOpen, onClose, onSuccess }: AuthOTPModalProps) {
  const [step, setStep] = useState<Step>('input');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // Yükleniyor durumları
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Aşama: Kod Gönder
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await sendOtp(email);

    setLoading(false);

    if (result.success) {
      setStep('verify');
    } else {
      setError(result.error || 'Kod gönderilemedi.');
    }
  };

  // 2. Aşama: Kodu Doğrula
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await verifyOtp(email, otpCode);

    setLoading(false);

    if (result.success) {
      // Başarılı!
      onSuccess();
      onClose();
    } else {
      setError(result.error || 'Kod hatalı.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        
        {/* Kapatma Butonu */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Başlık */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {step === 'input' ? 'Giriş Yap / Kayıt Ol' : 'Kodu Doğrula'}
          </h2>
          <p className="text-gray-400">
            {step === 'input' 
              ? 'Analiz sonucunuzu kaydetmek için e-postanızı girin.' 
              : `${email} adresine gönderilen 6 haneli kodu girin.`}
          </p>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* FORM 1: E-posta Girişi */}
        {step === 'input' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">E-Posta Adresi</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  Kod Gönder
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
              <label className="block text-sm font-medium text-gray-400 mb-1">Doğrulama Kodu</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Doğrulanıyor...
                </>
              ) : (
                <>
                  Girişi Tamamla
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep('input'); setError(null); }}
              className="w-full text-sm text-gray-400 hover:text-white transition-colors"
            >
              E-posta adresini değiştir
            </button>
          </form>
        )}

      </div>
    </div>
  );
}