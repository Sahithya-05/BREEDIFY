import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Globe, Bell, Save, Check, WifiOff, Volume2 } from 'lucide-react';

export default function Settings() {
  const { t, i18n } = useTranslation();

  const [lang, setLang] = useState(i18n.language || 'en');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '');
  const [notifications, setNotifications] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);
  const [voiceAssistance, setVoiceAssistance] = useState(true);
  const [saved, setSaved] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' }
  ];

  const handleSave = (e) => {
    e.preventDefault();
    const cleanKey = apiKey.trim();
    localStorage.setItem('gemini_api_key', cleanKey);
    localStorage.setItem('bovine_gemini_key', cleanKey);
    localStorage.setItem('bovine_lang', lang);
    localStorage.setItem('bovine_language', lang);
    localStorage.setItem('bovine_offline_sync', String(offlineSync));
    localStorage.setItem('bovine_voice_assist', String(voiceAssistance));
    i18n.changeLanguage(lang);
    try {
      document.documentElement.lang = lang;
    } catch (_) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-editorial font-bold text-charcoal">
          {t('settingsPage.title', 'Application')} <span className="text-terracotta">{t('settingsPage.highlight', 'Settings & Config')}</span>
        </h1>
        <p className="text-xs text-charcoal-muted">{t('settingsPage.subtitle', 'Configure language preferences, API integrations, and offline sync.')}</p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
          <Check className="w-4 h-4" /> {t('settingsPage.savedSuccess', 'Settings Saved Successfully!')}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-[#F4EDE0] p-8 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-6">
        
        {/* Language Selection */}
        <div>
          <label className="label-uppercase block mb-2">{t('settingsPage.systemLanguage', 'SYSTEM LANGUAGE (9 INDIAN LANGUAGES)')}</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {languages.map((l) => (
              <button
                type="button"
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  i18n.changeLanguage(l.code);
                  localStorage.setItem('bovine_lang', l.code);
                  localStorage.setItem('bovine_language', l.code);
                }}
                className={`p-3 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer ${
                  (lang === l.code || i18n.language === l.code)
                    ? 'bg-[#324E38] text-white border-[#324E38]'
                    : 'bg-[#FAF5EB] text-charcoal border-[#DFD3BF] hover:bg-[#F0E6D2]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gemini API Key Configuration */}
        <div className="pt-2 border-t border-[#EDE7DA] space-y-2">
          <div className="flex items-center justify-between">
            <label className="label-uppercase block">{t('settingsPage.geminiKeyTitle', 'GOOGLE GEMINI VISION & COPILOT API KEY')}</label>
            <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
              {t('settingsPage.activeStatus', 'Active: Gemini Multimodal')}
            </span>
          </div>
          <p className="text-[11px] text-charcoal-muted">
            {t('settingsPage.keyDescription', 'Used for high-precision breed biometric recognition and real-time veterinary copilot responses.')}
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t('settingsPage.keyPlaceholder', 'Enter Gemini API Key...')}
            className="w-full bg-[#FAF5EB] border border-[#DFD3BF] rounded-xl px-4 py-2.5 text-xs text-charcoal font-mono focus:outline-none focus:border-[#324E38]"
          />
        </div>

        {/* Offline Diagnostic & Sync Mode */}
        <div className="flex items-center justify-between pt-2 border-t border-[#EDE7DA]">
          <div>
            <span className="font-bold text-xs text-charcoal block">{t('settingsPage.offlineTitle', 'Offline AI Intelligence & Local Sync')}</span>
            <span className="text-[10px] text-charcoal-muted">{t('settingsPage.offlineDesc', 'Enable on-device veterinary diagnosis and breed inference without requiring internet')}</span>
          </div>
          <input
            type="checkbox"
            checked={offlineSync}
            onChange={(e) => setOfflineSync(e.target.checked)}
            className="w-5 h-5 accent-[#324E38] cursor-pointer"
          />
        </div>

        {/* Voice Readout Assistance */}
        <div className="flex items-center justify-between pt-2 border-t border-[#EDE7DA]">
          <div>
            <span className="font-bold text-xs text-charcoal block">{t('settingsPage.voiceTitle', 'Voice Guidance & Multi-lingual Text-to-Speech')}</span>
            <span className="text-[10px] text-charcoal-muted">{t('settingsPage.voiceDesc', 'Automatically read veterinary advisory and scan results aloud in local dialect')}</span>
          </div>
          <input
            type="checkbox"
            checked={voiceAssistance}
            onChange={(e) => setVoiceAssistance(e.target.checked)}
            className="w-5 h-5 accent-[#324E38] cursor-pointer"
          />
        </div>

        {/* Notifications Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-[#EDE7DA]">
          <div>
            <span className="font-bold text-xs text-charcoal block">{t('settingsPage.notificationsTitle', 'Veterinary Alerts & Mandi Price Updates')}</span>
            <span className="text-[10px] text-charcoal-muted">{t('settingsPage.notificationsDesc', 'Receive SMS and push notifications for vaccine schedules and local milk prices')}</span>
          </div>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="w-5 h-5 accent-terracotta cursor-pointer"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-terracotta hover:bg-terracotta-hover text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
        >
          {t('settingsPage.saveButton', 'Save Configuration')}
        </button>

      </form>
    </div>
  );
}
