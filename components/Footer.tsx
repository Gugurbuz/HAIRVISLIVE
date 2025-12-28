// src/components/Footer.tsx
import React from 'react';
import { Shield, Mail, Phone, MapPin, Twitter, Instagram, Linkedin, Stethoscope, ArrowUpRight, BookOpen } from 'lucide-react';
import { LanguageCode } from '../translations';

interface FooterProps {
  lang: LanguageCode;
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ lang, onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0E1A2B] text-slate-400 pt-24 pb-12 rounded-t-[3.5rem] relative overflow-hidden mt-auto">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center border border-teal-400/20 shadow-lg shadow-teal-500/20">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M7 4c4 4-4 12 0 16" />
                  <path d="M12 4c4 4-4 12 0 16" />
                  <path d="M17 4c4 4-4 12 0 16" />
                </svg>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                HAIR<span className="text-teal-500">VIS</span>
              </span>
            </div>
            <p className="text-sm font-light leading-relaxed max-w-xs">
              Pioneering the future of hair visualization through AI image analysis. Connecting users with global centers of excellence for professional consultation.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialBtn icon={Linkedin} />
              <SocialBtn icon={Twitter} />
              <SocialBtn icon={Instagram} />
            </div>
          </div>

          {/* Patient Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Patients</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <button
                  onClick={() => onNavigate('LANDING')}
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  My Preview <ArrowUpRight size={12} className="opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('DIRECTORY')}
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  Centers of Excellence
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('BLOG')}
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  Knowledge Base <BookOpen size={14} className="opacity-70" />
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors">
                  Methodology
                </a>
              </li>
            </ul>
          </div>

          {/* Partner/Clinic Links */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Partners</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <button
                  onClick={() => onNavigate('CLINIC_LANDING')}
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  Partner Solutions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('PARTNER_JOIN')}
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  Join Network
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('PARTNER_PORTAL')}
                  className="hover:text-teal-400 transition-colors flex items-center gap-2"
                >
                  Clinic Login
                </button>
              </li>
            </ul>
          </div>

          {/* Legal/Compliance */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Compliance</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-center gap-2">
                <Shield size={14} className="text-teal-500" /> HIPAA Compliant
              </li>
              <li className="flex items-center gap-2">
                <Shield size={14} className="text-teal-500" /> GDPR Ready
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8">Contact</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-teal-500 mt-0.5 shrink-0" />
                <span>
                  Levent 199, Büyükdere Cd. No:199
                  <br />
                  Istanbul, Turkey
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-teal-500 shrink-0" />
                <a href="mailto:concierge@hairvis.ai" className="hover:text-white transition-colors">
                  concierge@hairvis.ai
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-teal-500 shrink-0" />
                <span>+90 (212) 555 0199</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Visual Tool Disclaimer */}
        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 mb-12">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 shrink-0 mt-1">
              <Stethoscope size={20} />
            </div>
            <div className="space-y-2">
              <h5 className="text-white text-xs font-black uppercase tracking-widest">Important Disclaimer</h5>
              <p className="text-xs leading-relaxed opacity-70">
                This is a <strong>visual, non-medical tool</strong> designed to help you visualize potential results based on the photos you upload. It does{' '}
                <strong>not</strong> provide a medical diagnosis, treatment plan, or guaranteed outcome. Estimations are indicative and based solely on visual
                input. Always consult with a certified physician for a physical examination and medical advice.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>System Operational</span>
          </div>
          <p>© {currentYear} HairVis Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const SocialBtn = ({ icon: Icon }: any) => (
  <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-teal-500 hover:text-black transition-all border border-white/10">
    <Icon size={16} />
  </button>
);

export default Footer;
