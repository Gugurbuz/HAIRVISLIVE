import React, { useState, useEffect } from 'react';
import { Save, Upload, MapPin, Phone, Mail, Globe, Calendar, Clock } from 'lucide-react';
import { clinicManagementService } from '../../lib/clinicManagementService';
import { supabase } from '../../lib/supabase';

interface ClinicProfileEditorProps {
  clinicId: string;
  onSave?: () => void;
}

export const ClinicProfileEditor: React.FC<ClinicProfileEditorProps> = ({ clinicId, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clinic, setClinic] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    contact_email: '',
    contact_phone: '',
    founding_year: new Date().getFullYear(),
    languages_spoken: [] as string[],
    response_time_hours: 24,
    social_media: {
      facebook: '',
      instagram: '',
      youtube: '',
      linkedin: '',
    },
    operating_hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '14:00', closed: false },
      sunday: { open: '', close: '', closed: true },
    },
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  useEffect(() => {
    loadClinic();
  }, [clinicId]);

  const loadClinic = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('clinics')
      .select('*')
      .eq('id', clinicId)
      .maybeSingle();

    if (data) {
      setClinic(data);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        location: data.location || '',
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
        founding_year: data.founding_year || new Date().getFullYear(),
        languages_spoken: data.languages_spoken || [],
        response_time_hours: data.response_time_hours || 24,
        social_media: data.social_media || {
          facebook: '',
          instagram: '',
          youtube: '',
          linkedin: '',
        },
        operating_hours: data.operating_hours || formData.operating_hours,
      });
      setLogoPreview(data.logo_url || '');
    }
    setLoading(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      if (logoFile) {
        const { data: logoData } = await clinicManagementService.uploadClinicLogo(
          clinicId,
          logoFile
        );
        if (logoData) {
          setLogoPreview(logoData.url);
        }
      }

      const { data, error } = await clinicManagementService.updateClinicProfile(
        clinicId,
        formData
      );

      if (!error) {
        onSave?.();
      }
    } catch (error) {
      console.error('Error saving clinic profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const addLanguage = (lang: string) => {
    if (!formData.languages_spoken.includes(lang)) {
      setFormData({
        ...formData,
        languages_spoken: [...formData.languages_spoken, lang],
      });
    }
  };

  const removeLanguage = (lang: string) => {
    setFormData({
      ...formData,
      languages_spoken: formData.languages_spoken.filter(l => l !== lang),
    });
  };

  const commonLanguages = [
    'English', 'Turkish', 'German', 'French', 'Spanish', 'Italian',
    'Russian', 'Arabic', 'Polish', 'Dutch'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Clinic Profile</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Logo Upload */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Clinic Logo</h3>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
            {logoPreview ? (
              <img src={logoPreview} alt="Clinic logo" className="w-full h-full object-cover" />
            ) : (
              <Upload size={32} className="text-slate-400" />
            )}
          </div>
          <div className="flex-1">
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer hover:bg-slate-200 transition-colors">
              <Upload size={18} />
              Upload Logo
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-500 mt-2">Recommended: Square image, at least 400x400px</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Basic Information</h3>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Clinic Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Tell patients about your clinic..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <MapPin size={16} className="inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Country"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Founding Year
            </label>
            <input
              type="number"
              value={formData.founding_year}
              onChange={(e) => setFormData({ ...formData, founding_year: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Mail size={16} className="inline mr-1" />
              Contact Email
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Phone size={16} className="inline mr-1" />
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <Clock size={16} className="inline mr-1" />
              Response Time (hours)
            </label>
            <input
              type="number"
              value={formData.response_time_hours}
              onChange={(e) => setFormData({ ...formData, response_time_hours: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Languages Spoken</h3>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {formData.languages_spoken.map(lang => (
              <span
                key={lang}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-semibold"
              >
                {lang}
                <button
                  onClick={() => removeLanguage(lang)}
                  className="text-teal-500 hover:text-teal-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {commonLanguages
              .filter(lang => !formData.languages_spoken.includes(lang))
              .map(lang => (
                <button
                  key={lang}
                  onClick={() => addLanguage(lang)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
                >
                  + {lang}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Social Media</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(formData.social_media).map(([platform, url]) => (
            <div key={platform}>
              <label className="block text-sm font-semibold text-slate-700 mb-2 capitalize">
                <Globe size={16} className="inline mr-1" />
                {platform}
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    social_media: {
                      ...formData.social_media,
                      [platform]: e.target.value,
                    },
                  })
                }
                placeholder={`https://${platform}.com/...`}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
