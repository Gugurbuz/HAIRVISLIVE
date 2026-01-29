import React, { useState } from 'react';
import { User, Mail, Phone, Loader2, ArrowRight } from 'lucide-react';
import { LanguageCode } from '../translations';

interface UserInfoModalProps {
  onComplete: (userInfo: { firstName: string; lastName: string; email: string; phone: string }) => void;
  lang: LanguageCode;
}

export default function UserInfoModal({ onComplete, lang }: UserInfoModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTR = lang === 'TR';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      onComplete({ firstName, lastName, email, phone });
    } catch (err: any) {
      setError(err.message || (isTR ? 'Bir hata oluştu.' : 'An error occurred.'));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isTR ? 'Bilgilerinizi Girin' : 'Enter Your Information'}
          </h2>
          <p className="text-slate-600">
            {isTR
              ? 'Analiz sonucunuzu kaydetmek için bilgilerinizi girin.'
              : 'Enter your information to save your analysis results.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {isTR ? 'Ad' : 'First Name'}
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={isTR ? 'Ahmet' : 'John'}
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {isTR ? 'Soyad' : 'Last Name'}
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={isTR ? 'Yılmaz' : 'Doe'}
                className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              {isTR ? 'E-Posta' : 'Email'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isTR ? 'ornek@email.com' : 'example@email.com'}
              className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              {isTR ? 'Telefon' : 'Phone'}
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 555 123 4567"
              className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
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
                {isTR ? 'Gönderiliyor...' : 'Sending...'}
              </>
            ) : (
              <>
                {isTR ? 'Devam Et' : 'Continue'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 text-center mt-4">
            {isTR
              ? 'Devam ederek KVKK ve Gizlilik Politikasını kabul etmiş olursunuz.'
              : 'By continuing, you agree to our Privacy Policy and Terms.'}
          </p>
        </form>
      </div>
    </div>
  );
}
