import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User } from 'lucide-react';
import { LanguageCode } from '../translations';
import UserInfoModal from './UserInfoModal';
import AuthOTPModal from './AuthOTPModal';

interface ChatAuthFlowProps {
  lang: LanguageCode;
  onComplete: (userData: { firstName: string; lastName: string; email: string; phone: string; userId: string }) => void;
}

type Message =
  | { id: string; role: 'assistant'; text: string; }
  | { id: string; role: 'user'; text: string; };

const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

export default function ChatAuthFlow({ lang, onComplete }: ChatAuthFlowProps) {
  const isTR = lang === 'TR';
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [userInfo, setUserInfo] = useState<{ firstName: string; lastName: string; email: string; phone: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior });
    });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isTyping]);

  const pushAssistant = async (text: string, delay: number = 600) => {
    setIsTyping(true);
    await new Promise(r => setTimeout(r, delay));
    setMessages(prev => [...prev, { id: uid(), role: 'assistant', text }]);
    setIsTyping(false);
  };

  const pushUser = (text: string) => {
    setMessages(prev => [...prev, { id: uid(), role: 'user', text }]);
  };

  useEffect(() => {
    const startConversation = async () => {
      await pushAssistant(
        isTR
          ? 'Merhaba! Analiz sonuçlarınızı kaydetmek için kısa bir sohbet yapalım.'
          : "Hello! Let's have a quick chat to save your analysis results.",
        800
      );
      await pushAssistant(
        isTR
          ? 'Sadece birkaç saniye sürecek. Hazır mısınız?'
          : "It'll only take a few seconds. Ready?",
        1200
      );
      await pushAssistant(
        isTR
          ? 'Harika! Bilgilerinizi girmek için butona tıklayın.'
          : 'Great! Click the button to enter your information.',
        1800
      );
    };

    startConversation();
  }, []);

  const handleUserInfoComplete = (info: { firstName: string; lastName: string; email: string; phone: string }) => {
    setUserInfo(info);
    setShowUserInfoModal(false);

    pushUser(`${info.firstName} ${info.lastName}, ${info.email}, ${info.phone}`);

    setTimeout(async () => {
      await pushAssistant(
        isTR
          ? `Teşekkürler ${info.firstName}! Şimdi telefon numaranızı doğrulayalım.`
          : `Thank you ${info.firstName}! Now let's verify your phone number.`,
        400
      );
      setShowOTPModal(true);
    }, 600);
  };

  const handlePhoneOtpComplete = async (userId: string) => {
    setShowOTPModal(false);

    if (!userInfo) return;

    pushUser(isTR ? 'Doğrulama tamamlandı!' : 'Verification completed!');

    await pushAssistant(
      isTR
        ? 'Mükemmel! Analiz sonuçlarınız hazırlanıyor...'
        : 'Perfect! Preparing your analysis results...',
      500
    );

    setTimeout(() => {
      onComplete({
        ...userInfo,
        userId,
      });
    }, 1000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                {isTR ? 'GÜVENLİ KAYIT' : 'SECURE REGISTRATION'}
              </div>
              <div className="text-sm font-bold text-[#0E1A2B]">
                {isTR ? 'Sonuçlarınızı kaydedin' : 'Save your results'}
              </div>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="h-[60vh] overflow-y-auto px-8 py-6 space-y-4 custom-scrollbar"
          style={{
            scrollBehavior: 'smooth',
          }}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-5 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-slate-100 px-5 py-3 rounded-2xl">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="px-8 py-6 border-t border-slate-100">
          {!showUserInfoModal && !showOTPModal && messages.length >= 3 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowUserInfoModal(true)}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
            >
              <User className="w-5 h-5" />
              {isTR ? 'Bilgilerimi Gir' : 'Enter My Information'}
            </motion.button>
          )}

          {(showUserInfoModal || showOTPModal) && (
            <div className="text-center text-sm text-slate-500 font-medium">
              {isTR ? 'Lütfen formu doldurun...' : 'Please fill out the form...'}
            </div>
          )}
        </div>
      </div>

      {showUserInfoModal && (
        <UserInfoModal
          onComplete={handleUserInfoComplete}
          lang={lang}
        />
      )}

      {showOTPModal && userInfo && (
        <AuthOTPModal
          phone={userInfo.phone}
          onComplete={handlePhoneOtpComplete}
          onBack={() => {
            setShowOTPModal(false);
            setShowUserInfoModal(true);
          }}
          lang={lang}
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
