import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Scan,
  ShieldCheck,
  Globe,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Eye,
  FileText,
  MessageSquare,
  Settings as SettingsIcon,
  CheckCircle2,
  Activity,
  Server
} from 'lucide-react';

export default function AppPreview() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'हिंदी', native: 'Hindi' },
    { code: 'te', label: 'తెలుగు', native: 'Telugu' },
    { code: 'gu', label: 'ગુજરાતી', native: 'Gujarati' },
    { code: 'ta', label: 'தமிழ்', native: 'Tamil' },
    { code: 'kn', label: 'ಕನ್ನಡ', native: 'Kannada' },
    { code: 'mr', label: 'मराठी', native: 'Marathi' },
    { code: 'bn', label: 'বাংলা', native: 'Bengali' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ', native: 'Punjabi' }
  ];

  const handleLangSelect = (code) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
    localStorage.setItem('bovine_lang', code);
    localStorage.setItem('bovine_language', code);
    try {
      document.documentElement.lang = code;
    } catch (_) {}
  };

  const pages = [
    {
      id: 'dashboard',
      name: 'Farmer Dashboard',
      subtitle: 'Daily milk yield, DBT earnings, Mandi ticker & health alerts',
      path: '/dashboard',
      icon: '🌾',
      previewImg: selectedLang === 'te' ? '/preview/lang_telugu_dashboard.png' : '/preview/lang_hindi_dashboard.png'
    },
    {
      id: 'scanner',
      name: 'AI Biometric Scanner',
      subtitle: '19 ICAR presets across 3 categories & live camera scan HUD',
      path: '/scanner',
      icon: '📸',
      previewImg: selectedLang === 'te' ? '/preview/lang_telugu_scanner.png' : '/preview/lang_hindi_scanner.png'
    },
    {
      id: 'result',
      name: 'Scan Result & Vitals',
      subtitle: 'Biometric geotag verification, HITL validation bar, and 4 vitals',
      path: '/scanner/result/scan_892654f028',
      icon: '🧬',
      previewImg: selectedLang === 'te' ? '/preview/lang_telugu_scanresult.png' : '/preview/lang_hindi_scanresult.png'
    },
    {
      id: 'passports',
      name: 'Digital Animal Passports',
      subtitle: '12-digit INAPH government pedigree, health records & QR verification',
      path: '/digital-passport',
      icon: '📋',
      previewImg: selectedLang === 'te' ? '/preview/lang_telugu_scanresult.png' : '/preview/lang_hindi_scanresult.png'
    },
    {
      id: 'marketplace',
      name: 'Livestock Marketplace',
      subtitle: '“Identify. Verify. Connect. Sell.” — Direct Mandi with multi-attribute filtering',
      path: '/marketplace',
      icon: '🛒',
      previewImg: '/preview/marketplace_main.png'
    },
    {
      id: 'sell',
      name: 'Sell Animal Portal',
      subtitle: 'Photo uploads, BREEDIFY AI vision analysis, morphology & calf pending registration',
      path: '/marketplace/sell',
      icon: '➕',
      previewImg: '/preview/marketplace_sell.png'
    },
    {
      id: 'detail',
      name: 'Animal Detail & Trust Tiers',
      subtitle: 'Photo gallery, AI vs Verified badges, 9 information cards & buy modal',
      path: '/marketplace/animal/MKT-IN-901',
      icon: '🐄',
      previewImg: '/preview/animal_detail.png'
    },
    {
      id: 'listings',
      name: 'Seller My Listings',
      subtitle: 'Active, pending, and sold management with inquiry metrics & sold archiving',
      path: '/marketplace/my-listings',
      icon: '📦',
      previewImg: '/preview/my_listings.png'
    },
    {
      id: 'history',
      name: 'Sales History & Ledger',
      subtitle: 'Lifetime revenue metrics, completed transactions & official transfer certificates',
      path: '/marketplace/history',
      icon: '📜',
      previewImg: '/preview/sales_history.png'
    },
    {
      id: 'settings',
      name: 'Application Settings',
      subtitle: '9 Indian languages switcher grid & Google Gemini vision config',
      path: '/settings',
      icon: '⚙️',
      previewImg: '/preview/lang_hindi_settings.png'
    },
    {
      id: 'login',
      name: 'Login & Onboarding',
      subtitle: 'Multi-role selection (Farmer, Vet, Vendor) with auto-language tuning',
      path: '/login',
      icon: '🔐',
      previewImg: '/preview/lang_telugu_login.png'
    }
  ];

  const currentView = pages.find((p) => p.id === activeTab) || pages[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 text-[#2A2A28]">
      
      {/* Top Banner */}
      <div className="bg-[#324E38] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-card border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#B0C4B1] bg-white/10 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                <span>🐄</span> BREEDIFY 3.0 APP PREVIEW
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                All Services Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-editorial font-bold text-white leading-tight">
              Interactive Application Preview & Navigation
            </h1>

            <p className="text-xs sm:text-sm text-[#D2E4D4] leading-relaxed">
              Explore the entire livestock intelligence platform across all 9 Indian languages. Switch dialects, preview pages, or jump directly into any live screen.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/dashboard"
              className="bg-[#D95A2B] hover:bg-[#C24E22] text-white px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Language Quick Switcher */}
      <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#D95A2B]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#2A2A28]">
              Switch App Language (9 Indian Languages)
            </h2>
          </div>
          <span className="text-[10px] text-[#7A7A70] font-mono">Real-time Hot Swap</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {languages.map((l) => {
            const isSelected = selectedLang === l.code;
            return (
              <button
                key={l.code}
                onClick={() => handleLangSelect(l.code)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#324E38] text-white shadow-md'
                    : 'bg-[#FAF5EB] text-[#4A4A40] border border-[#DFD3BF] hover:bg-[#F7F3EA]'
                }`}
              >
                <span>{l.label}</span>
                <span className="text-[10px] opacity-75 font-normal">({l.native})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {pages.map((p) => {
          const isActive = activeTab === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                isActive
                  ? 'bg-white border-2 border-[#D95A2B] shadow-md -translate-y-0.5'
                  : 'bg-[#F4EDE0] border-[#DFD3BF] hover:border-[#D95A2B] hover:bg-[#FAF5EB]'
              }`}
            >
              <div className="text-xl">{p.icon}</div>
              <div>
                <div className="text-xs font-bold text-[#2A2A28] truncate">{p.name}</div>
                <div className="text-[10px] text-[#7A7A70] line-clamp-1 mt-0.5">{p.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Preview Stage */}
      <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDE7DA] pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentView.icon}</span>
              <h3 className="font-editorial font-bold text-lg text-[#2A2A28]">
                {currentView.name}
              </h3>
            </div>
            <p className="text-xs text-[#7A7A70]">{currentView.subtitle}</p>
          </div>

          <Link
            to={currentView.path}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D95A2B] hover:bg-[#C25832] text-white text-xs font-bold shadow-sm transition-transform active:scale-95 shrink-0"
          >
            <span>Open {currentView.name}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* High Resolution Render Display */}
        <div className="rounded-2xl overflow-hidden border border-[#DFD3BF] bg-black/5 shadow-inner">
          <img
            src={currentView.previewImg}
            alt={currentView.name}
            className="w-full h-auto object-contain rounded-xl"
          />
        </div>
      </div>

      {/* Backend & Model Diagnostics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#2A2A28]">FastAPI Server (Port 8000)</div>
            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Active · SQLite Bovine DB
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#2A2A28]">Google Gemini Vision AI</div>
            <div className="text-[10px] text-purple-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              Multimodal 19 Breeds Active
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#2A2A28]">Vite React Dev Server (Port 5173)</div>
            <div className="text-[10px] text-blue-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              9 Languages i18n Synchronized
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
