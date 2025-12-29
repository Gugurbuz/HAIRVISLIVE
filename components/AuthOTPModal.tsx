
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  ArrowRight, 
  Loader2, 
  Lock, 
  CheckCircle2 
} from 'lucide-react';
import { LanguageCode } from '../translations';

interface AuthOTPModalProps {
  onComplete: (contactData: any) => void;
  lang: LanguageCode;
}

const AuthOTPModal: React.FC<AuthOTPModalProps> = ({ onComplete, lang }) => {
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [contactType, setContactType] = useState<'phone' | 'email'>('phone');
  const [inputValue, setInputValue] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRTL = lang === 'AR';

  // Mock sending OTP
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.length < 5) {
        setError("Please enter a valid contact.");
        return;
    }
    setError(null);
    setIsLoading(true);
    
    // Simulate Network Request
    setTimeout(() => {
        setIsLoading(false);
        setStep('verify');
    }, 1500);
  };

  // Handle OTP Input
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) return;
    
    setIsLoading(true);
    // Simulate Verification
    setTimeout(() => {
        setIsLoading(false);
        onComplete({
            type: contactType,
            value: inputValue,
            verified: true
        });
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`w-full max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden ${isRTL ? 'text-right' : 'text-left'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-sm">
           {step === 'input' ? <Lock size={32} className="text-teal-600" /> : <ShieldCheck size={32} className="text-teal-600" />}
        </div>
        <h2 className="text-2xl font-black text-[#0E1A2B] tracking-tight leading-none mb-2">
            {step === 'input' ? 'Secure Your Report' : 'Verify Identity'}
        </h2>
        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">
            {step === 'input' 
                ? 'Your analysis is ready. Verify your number to view your report and control clinic access.' 
                : `Enter the code sent to ${inputValue}`
            }
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'input' ? (
            <motion.form 
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendCode}
                className="space-y-6"
            >
                {/* Type Toggle */}
                <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100">
                    <button
                        type="button"
                        onClick={() => setContactType('phone')}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${contactType === 'phone' ? 'bg-white text-[#0E1A2B] shadow-sm' : 'text-slate-400'}`}
                    >
                        <Smartphone size={14} /> Phone
                    </button>
                    <button
                        type="button"
                        onClick={() => setContactType('email')}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${contactType === 'email' ? 'bg-white text-[#0E1A2B] shadow-sm' : 'text-slate-400'}`}
                    >
                        <Mail size={14} /> Email
                    </button>
                </div>

                <div className="space-y-2">
                    <div className="relative group">
                        <input 
                            type={contactType === 'email' ? 'email' : 'tel'}
                            placeholder={contactType === 'email' ? 'name@example.com' : '+1 555 000 0000'}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-[#0E1A2B] placeholder:text-slate-300 focus:border-teal-500 focus:bg-white outline-none transition-all text-center tracking-wide"
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-red-500 text-[10px] font-bold text-center">{error}</p>}
                </div>

                <div className="space-y-3">
                    <button 
                        type="submit"
                        disabled={isLoading || !inputValue}
                        className="w-full py-4 bg-[#0E1A2B] text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-teal-600 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <>Send Code <ArrowRight size={14} /></>}
                    </button>
                    <p className="text-[9px] text-center text-slate-400 font-medium">
                        We respect your privacy. No spam, ever.
                    </p>
                </div>
            </motion.form>
        ) : (
            <motion.div 
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
            >
                <div className="flex gap-2 justify-center">
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            id={`otp-${idx}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-black text-center text-[#0E1A2B] focus:border-teal-500 focus:bg-white outline-none transition-all caret-teal-500"
                        />
                    ))}
                </div>

                <button 
                    onClick={handleVerify}
                    disabled={isLoading || otp.join('').length < 6}
                    className="w-full py-4 bg-teal-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-teal-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <>Verify & Access <CheckCircle2 size={16} /></>}
                </button>

                <button 
                    onClick={() => setStep('input')}
                    className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600"
                >
                    Change {contactType}
                </button>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AuthOTPModal;
