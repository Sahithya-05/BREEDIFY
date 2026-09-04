import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  Phone, 
  MapPin, 
  ArrowRight, 
  Stethoscope, 
  Tractor,
  Milk,
  Sprout,
  Globe,
  Loader2
} from 'lucide-react';
import { auth } from '../services/firebase';
import { signInAnonymously } from 'firebase/auth';
import { setUserProfile } from '../services/firestoreService';

export default function Login({ onLogin }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('farmer');
  const [selectedLang, setSelectedLang] = useState('en');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'mr', label: 'मराठी' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' }
  ];

  const handleLanguageChange = (code) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
    localStorage.setItem('bovine_lang', code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let authUid = null;
    try {
      const userCredential = await signInAnonymously(auth);
      authUid = userCredential?.user?.uid;
    } catch (authErr) {
      console.warn('Firebase Auth anonymous login notice:', authErr?.message || authErr);
    }

    const userId = authUid || `usr_${Date.now()}`;
    const userData = {
      id: userId,
      uid: userId,
      name: name.trim(),
      mobile: mobile.trim(),
      location: location.trim(),
      role: role,
      preferred_language: selectedLang,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setUserProfile(userData);
    } catch (fsErr) {
      console.warn('Firestore user profile save notice:', fsErr?.message || fsErr);
    }

    localStorage.setItem('bovine_user', JSON.stringify(userData));
    localStorage.setItem('bovine_token', 'mock_jwt_token_bovine_2026');
    
    setIsSubmitting(false);
    if (onLogin) onLogin(userData);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#324E38] flex items-center justify-center p-4 md:p-8 font-sans">
      
      {/* Main Split Container */}
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT PANEL - BRANDING & MAXIMIZED LOGO (5 Cols) */}
        <div className="lg:col-span-5 h-full bg-[#3D5B44]/95 backdrop-blur-md p-6 sm:p-10 rounded-[32px] border border-white/15 text-white flex flex-col items-center justify-between text-center shadow-xl space-y-6">
          
          {/* Brand Header */}
          <div className="pt-2">
            <h2 className="font-black text-3xl sm:text-4xl lg:text-5xl tracking-widest text-white uppercase font-sans">
              BREEDIFY
            </h2>
          </div>

          {/* Maximized Logo Frame */}
          <div className="w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 max-w-full aspect-square rounded-[36px] overflow-hidden shadow-2xl border-4 border-white/25 bg-white p-3 flex items-center justify-center transition-transform hover:scale-105 duration-300">
            <img 
              src="/breedify_logo.jpg" 
              alt="BREEDIFY" 
              className="w-full h-full object-contain rounded-2xl" 
            />
          </div>

          {/* Welcome Title */}
          <div className="pb-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-editorial text-white">
              Welcome, <span className="italic font-normal text-[#F2DFCE]">Kisan</span> 🙏
            </h1>
          </div>

        </div>

        {/* RIGHT PANEL - FORM CARD (7 Cols) */}
        <div className="lg:col-span-7 bg-[#F4EDE0] p-6 sm:p-9 rounded-[32px] shadow-2xl text-[#2A2A28] space-y-5 border border-[#DFD3BF]">
          
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-[#F5EBE1] text-[#D96B43] text-[10px] font-bold uppercase tracking-wider">
              · {t('loginPage.selectRole', 'SIGN IN / SIGN UP')}
            </span>
            <div className="w-6 h-6 text-[#A3B899] flex items-center justify-center">
              <Sprout className="w-5 h-5 text-[#88A07A]" />
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-[#2A2A28]">
              {t('loginPage.title', 'Create your AI profile')}
            </h2>
            <p className="text-xs text-[#8A8A80]">
              {t('loginPage.subtitle', 'Takes 30 seconds. No password needed.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            
            {/* FULL NAME */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A7A70] block mb-1">
                {t('loginPage.fullName', 'FULL NAME')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#A8A89E] absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('loginPage.namePlaceholder', 'Bandela Revanth')}
                  className="w-full bg-white border border-[#E3DDCF] rounded-full pl-11 pr-4 py-2.5 text-xs text-[#2A2A28] font-medium focus:outline-none focus:border-[#D96B43] shadow-sm"
                />
              </div>
            </div>

            {/* MOBILE NUMBER */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A7A70] block mb-1">
                {t('loginPage.mobileNumber', 'MOBILE NUMBER')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-4 flex items-center gap-1.5 text-xs font-semibold text-[#5A5A50] pointer-events-none">
                  <span>IN +91</span>
                  <Phone className="w-3.5 h-3.5 text-[#A8A89E]" />
                </div>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={mobile}
                  onKeyDown={(e) => {
                    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'];
                    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                      return;
                    }
                    if (!/^[0-9]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = (e.clipboardData || window.clipboardData).getData('text');
                    const cleanDigits = pastedData.replace(/\D/g, '').slice(0, 10);
                    setMobile(cleanDigits);
                  }}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setMobile(digits);
                  }}
                  placeholder={t('loginPage.mobilePlaceholder', '98XXXXXXXX')}
                  className="w-full bg-white border border-[#E3DDCF] rounded-full pl-24 pr-4 py-2.5 text-xs text-[#2A2A28] font-medium focus:outline-none focus:border-[#D96B43] shadow-sm tracking-wider"
                />
              </div>
            </div>

            {/* VILLAGE / CITY / STATE */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A7A70] block mb-1">
                {t('loginPage.farmLocation', 'VILLAGE / CITY / STATE')}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#A8A89E] absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('loginPage.locationPlaceholder', 'e.g. Hyderabad, Telangana')}
                  className="w-full bg-white border border-[#E3DDCF] rounded-full pl-11 pr-4 py-2.5 text-xs text-[#2A2A28] font-medium focus:outline-none focus:border-[#D96B43] shadow-sm"
                />
              </div>
            </div>

            {/* I AM A... ROLE SELECTOR (3 Cards) */}
            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A7A70] block mb-1.5">
                {t('loginPage.selectRole', 'I AM A...')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                
                {/* Farmer Card */}
                <div
                  onClick={() => setRole('farmer')}
                  className={`p-3 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between ${
                    role === 'farmer'
                      ? 'bg-white border-2 border-[#D96B43] shadow-sm'
                      : 'bg-white border-[#E3DDCF] hover:bg-[#F9F7F2]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      role === 'farmer' ? 'bg-[#F9ECE6] text-[#D96B43]' : 'bg-[#F2EFE9] text-[#7A7A70]'
                    }`}>
                      <Sprout className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#2A2A28]">{t('loginPage.roleFarmer', 'Farmer / Kisan')}</span>
                  </div>
                  <p className="text-[10px] text-[#8A8A80] leading-tight pl-1">
                    {t('role.farmerPortal', 'Scan, health, vet chat, passport, mandi')}
                  </p>
                </div>

                {/* Vet Officer Card */}
                <div
                  onClick={() => setRole('vet')}
                  className={`p-3 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between ${
                    role === 'vet'
                      ? 'bg-white border-2 border-[#D96B43] shadow-sm'
                      : 'bg-white border-[#E3DDCF] hover:bg-[#F9F7F2]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      role === 'vet' ? 'bg-[#F9ECE6] text-[#D96B43]' : 'bg-[#F2EFE9] text-[#7A7A70]'
                    }`}>
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#2A2A28]">{t('loginPage.roleVet', 'Veterinary Officer')}</span>
                  </div>
                  <p className="text-[10px] text-[#8A8A80] leading-tight pl-1">
                    {t('role.vetPortal', 'Scan, health, diagnosis, passport')}
                  </p>
                </div>

                {/* Milk Vendor Card */}
                <div
                  onClick={() => setRole('vendor')}
                  className={`p-3 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between ${
                    role === 'vendor'
                      ? 'bg-white border-2 border-[#D96B43] shadow-sm'
                      : 'bg-white border-[#E3DDCF] hover:bg-[#F9F7F2]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      role === 'vendor' ? 'bg-[#F9ECE6] text-[#D96B43]' : 'bg-[#F2EFE9] text-[#7A7A70]'
                    }`}>
                      <Milk className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#2A2A28]">{t('loginPage.roleVendor', 'Milk Vendor')}</span>
                  </div>
                  <p className="text-[10px] text-[#8A8A80] leading-tight pl-1">
                    {t('role.vendorPortal', 'Procurement, Fat/SNF pricing, payouts')}
                  </p>
                </div>

              </div>
            </div>

            {/* PREFERRED LANGUAGE */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Globe className="w-3.5 h-3.5 text-[#D96B43]" />
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A7A70]">
                  {t('loginPage.preferredLanguage', 'PREFERRED LANGUAGE')}
                </label>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {languages.map((l) => {
                  const isSelected = selectedLang === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => handleLanguageChange(l.code)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#D96B43] text-white font-bold shadow-sm'
                          : 'bg-white text-[#4A4A40] border border-[#E3DDCF] hover:bg-[#F7F3EA]'
                      }`}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#D96B43] hover:bg-[#C25832] disabled:opacity-75 text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Syncing Cloud Profile...</span>
                  </>
                ) : (
                  <>
                    <span>{t('loginPage.continueButton', 'Continue to Dashboard')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
