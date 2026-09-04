import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Scan,
  HeartPulse,
  MessageSquare,
  Building2,
  History as HistoryIcon,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  FileText,
  Globe,
  Check,
  Menu,
  X,
  Stethoscope,
  Droplets,
  Sprout,
  ShieldCheck,
  Activity,
  QrCode,
  Eye,
  Store,
  PlusCircle,
  Package,
  Heart,
  ShoppingBag,
  Bot
} from 'lucide-react';
import { getRoleBadge, ROLES } from '../utils/rbac';

export default function AppLayout({ children, user, onLogout }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(() => {
    return user || JSON.parse(localStorage.getItem('bovine_user') || '{}') || {
      name: 'Ramesh Patel',
      location: 'Anand, Gujarat',
      role: 'farmer'
    };
  });

  useEffect(() => {
    if (user) setCurrentUser(user);
  }, [user]);

  const initials = currentUser.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'RP';

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

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const handleLanguageSelect = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('bovine_lang', code);
    localStorage.setItem('bovine_language', code);
    try {
      document.documentElement.lang = code;
    } catch (_) {}
    setLangDropdownOpen(false);
  };

  const handleRoleSwitch = (newRole) => {
    let newName = currentUser.name;
    if (newRole === 'vet') newName = 'Dr. Anita Joshi, B.V.Sc';
    else if (newRole === 'vendor') newName = 'Amul Procurement Unit';
    else newName = 'Ramesh Patel';

    const updatedUser = {
      ...currentUser,
      role: newRole,
      name: newName
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('bovine_user', JSON.stringify(updatedUser));
    setRoleDropdownOpen(false);
    navigate('/dashboard');
    window.location.reload();
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ROLE-SPECIFIC NAVIGATION CONFIGURATION (Specification 26 & 27)
  const role = (currentUser.role || 'farmer').toLowerCase();

  const marketplaceSubItems = [
    { path: '/marketplace', label: t('nav.marketplace', 'Marketplace'), icon: Store, exact: true },
    { path: '/marketplace/sell', label: t('nav.sellAnimal', 'Sell Animal'), icon: PlusCircle },
    { path: '/marketplace/my-listings', label: t('nav.myListings', 'My Listings'), icon: Package },
    { path: '/marketplace/saved', label: t('nav.savedAnimals', 'Saved Animals'), icon: Heart },
    { path: '/marketplace/purchases', label: t('nav.myPurchases', 'My Purchases'), icon: ShoppingBag },
    { path: '/marketplace/history', label: t('nav.salesHistory', 'Sales History'), icon: HistoryIcon }
  ];

  let navItems = [];
  if (role === 'vet' || role === 'veterinarian') {
    navItems = [
      { path: '/dashboard', label: t('nav.commandCenter', 'Command Center'), icon: Activity },
      { path: '/marketplace', label: t('nav.livestockMarketplace', 'Marketplace'), icon: Store, isMarketplace: true },
      { path: '/digital-passport', label: t('nav.animal360', 'Animal 360°'), icon: QrCode },
      { path: '/health', label: t('nav.surveillance', 'Surveillance'), icon: HeartPulse },
      { path: '/assistant', label: t('nav.aiAgent', 'AI Agent'), icon: Bot },
      { path: '/insurance-finance', label: t('nav.certificates', 'Certificates'), icon: Building2 },
      { path: '/history', label: t('nav.clinicalAudit', 'Clinical Audit'), icon: HistoryIcon },
      { path: '/reports', label: t('nav.reports', 'Reports'), icon: BarChart3 },
      { path: '/settings', label: t('nav.settings', 'Settings'), icon: SettingsIcon },
    ];
  } else if (role === 'vendor' || role === 'milk_vendor' || role === 'flw') {
    navItems = [
      { path: '/dashboard', label: t('nav.milkHub', 'Milk Hub'), icon: Droplets },
      { path: '/marketplace', label: t('nav.livestockMarketplace', 'Marketplace'), icon: Store, isMarketplace: true },
      { path: '/digital-passport', label: t('nav.bovines', 'Bovines'), icon: FileText },
      { path: '/health', label: t('nav.qualityAudit', 'Quality Audit'), icon: HeartPulse },
      { path: '/assistant', label: t('nav.aiAgent', 'AI Agent'), icon: Bot },
      { path: '/insurance-finance', label: t('nav.pricing', 'Pricing'), icon: Building2 },
      { path: '/history', label: t('nav.collections', 'Collections'), icon: HistoryIcon },
      { path: '/reports', label: t('nav.analytics', 'Analytics'), icon: BarChart3 },
      { path: '/settings', label: t('nav.settings', 'Settings'), icon: SettingsIcon },
    ];
  } else {
    // Farmer navigation
    navItems = [
      { path: '/dashboard', label: t('nav.home', 'Home'), icon: Home },
      { path: '/scanner', label: t('nav.scanner', 'AI Scan'), icon: Scan },
      { path: '/marketplace', label: t('nav.livestockMarketplace', 'Marketplace'), icon: Store, isMarketplace: true },
      { path: '/digital-passport', label: t('nav.passport', 'Passport'), icon: FileText },
      { path: '/identity', label: t('nav.biometricId', 'Biometric ID'), icon: Eye },
      { path: '/health', label: t('nav.health', 'Health'), icon: HeartPulse },
      { path: '/assistant', label: t('nav.aiAgent', 'AI Agent'), icon: Bot },
      { path: '/insurance-finance', label: t('nav.finance', 'Finance'), icon: Building2 },
      { path: '/history', label: t('nav.history', 'History'), icon: HistoryIcon },
      { path: '/reports', label: t('nav.reports', 'Reports'), icon: BarChart3 },
      { path: '/settings', label: t('nav.settings', 'Settings'), icon: SettingsIcon },
    ];
  }

  const roleInfo = getRoleBadge(role);
  const localizedRoleLabel = role === 'vet' || role === 'veterinarian'
    ? t('role.vetPortal', 'Veterinary Portal')
    : role === 'vendor' || role === 'milk_vendor' || role === 'flw'
      ? t('role.vendorPortal', 'Dairy Procurement Hub')
      : t('role.farmerPortal', 'Farmer Portal');

  return (
    <div className="min-h-screen bg-[#F8F3EA] flex font-sans">
      
      {/* LEFT ICON RAIL SIDEBAR (DESKTOP) */}
      <aside className="hidden sm:flex w-16 md:w-20 bg-[#324E38] m-3 rounded-[24px] flex-col items-center justify-between py-5 text-white shrink-0 shadow-lg z-20">
        
        {/* Top BREEDIFY Logo Badge - Peach/Terracotta circle matching reference image */}
        <NavLink
          to="/dashboard"
          title="BREEDIFY Home"
          className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex items-center justify-center shadow-md hover:scale-105 transition-transform bg-[#F5DFD5] border-2 border-[#E8A97D] p-1 shrink-0"
        >
          <img src="/breedify_logo.jpg" alt="BREEDIFY" className="w-full h-full object-cover rounded-full" />
        </NavLink>

        {/* Navigation Icons Vertical Stack */}
        <nav className="flex flex-col items-center gap-2.5 my-auto">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isMarketplaceRoute = location.pathname.startsWith('/marketplace');
            const isActive = item.isMarketplace
              ? isMarketplaceRoute
              : (location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path)));

            return (
              <div key={item.path} className="relative group">
                <NavLink
                  to={item.path}
                  title={item.label}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#4B6B52] text-white shadow-inner'
                      : 'text-[#B8CBB9] hover:bg-[#3D5B44] hover:text-white'
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                </NavLink>

                {/* Submenu flyout for Marketplace or regular tooltip */}
                {item.isMarketplace ? (
                  <div className="absolute left-14 top-0 hidden group-hover:block hover:block z-50 pl-2">
                    <div className="bg-[#2A2A28] border border-white/10 text-white rounded-2xl shadow-2xl p-2.5 w-52 space-y-1 backdrop-blur-md">
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#D96B43] border-b border-white/10 flex items-center justify-between">
                        <span>🛒 Livestock Marketplace</span>
                      </div>
                      {marketplaceSubItems.map((sub) => {
                        const SubIcon = sub.icon;
                        const isSubActive = sub.exact
                          ? location.pathname === sub.path
                          : location.pathname.startsWith(sub.path);
                        return (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isSubActive
                                ? 'bg-[#324E38] text-white shadow-xs'
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <SubIcon className="w-3.5 h-3.5 shrink-0 text-[#D96B43]" />
                            <span className="truncate">{sub.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <span className="absolute left-16 top-2.5 bg-[#2A2A28] text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Sign out */}
        <button
          onClick={onLogout}
          title={t('signOut', 'Sign out')}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#B8CBB9] hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </aside>

      {/* RIGHT MAIN LAYOUT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between border-b border-[#E8DFC9] bg-[#F8F3EA] relative z-30">
            
            {/* Brand Logo & Mobile Menu Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 rounded-xl text-[#2A2A28] hover:bg-[#F7F3EA]"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <NavLink to="/dashboard" className="flex items-center gap-3 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-md border-2 border-[#DFD3BF] bg-[#F4EDE0] group-hover:scale-105 transition-transform shrink-0 p-0.5">
                  <img src="/breedify_logo.jpg" alt="BREEDIFY" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-editorial font-bold text-[#2A2A28] tracking-tight">
                      BREEDIFY
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8EFE9] text-[#2F4332] border border-[#D5E2D7]">
                      {t('common.livestock', 'LIVESTOCK')}
                    </span>
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-[#7A7A70] font-semibold -mt-0.5">
                    {t('livestockIntelligence', 'LIVESTOCK INTELLIGENCE')}
                  </p>
                </div>
              </NavLink>

              {/* Role Indicator Badge */}
              <div className="relative" ref={roleDropdownRef}>
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer shadow-xs ${roleInfo.bg} ${roleInfo.text} ${roleInfo.border}`}
                  title="Click to switch role for testing demo workflow"
                >
                  <span>{roleInfo.icon}</span>
                  <span>{localizedRoleLabel}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {/* Role Switcher Dropdown */}
                {roleDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl border border-[#E3DDCF] shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3.5 py-1.5 border-b border-[#EDE7DA] text-[9px] font-black uppercase tracking-widest text-[#7A7A70]">
                      {t('switchPortalRole', 'SWITCH PORTAL ROLE (RBAC)')}
                    </div>
                    {[
                      { role: 'farmer', name: t('role.farmerKisan', 'Farmer / Kisan'), icon: '🌾', desc: t('role.farmerDesc', 'Livestock owner & dairy') },
                      { role: 'vet', name: t('role.vetOfficer', 'Veterinary Officer'), icon: '🩺', desc: t('role.vetDesc', 'Command center & clinical records') },
                      { role: 'vendor', name: t('role.milkVendor', 'Milk Vendor / Operator'), icon: '🥛', desc: t('role.vendorDesc', 'Collection & two-axis pricing') }
                    ].map(r => (
                      <button
                        key={r.role}
                        onClick={() => handleRoleSwitch(r.role)}
                        className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-[#F7F3EA] transition-colors ${
                          role === r.role ? 'bg-[#F5EBE1] text-[#D96B43] font-bold' : 'text-[#2A2A28]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{r.icon}</span>
                          <div>
                            <span className="block">{r.name}</span>
                            <span className="text-[10px] text-[#7A7A70] font-normal">{r.desc}</span>
                          </div>
                        </div>
                        {role === r.role && <Check className="w-3.5 h-3.5 text-[#D96B43]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* LANGUAGE DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF8] border border-[#E8DFC9] hover:border-[#D96B43] text-xs font-semibold text-[#4A4A40] shadow-xs transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-[#D96B43]" />
                  <span>{currentLang.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#8A8A80] transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-[#FFFDF8] rounded-2xl border border-[#E8DFC9] shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1 border-b border-[#EDE7DA] text-[10px] font-bold uppercase text-[#7A7A70]">
                      {t('selectLanguage', 'Select Language')}
                    </div>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-[#F7F3EA] transition-colors ${
                          i18n.language === lang.code ? 'text-[#D96B43] bg-[#F5EBE1]/50 font-bold' : 'text-[#2A2A28]'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>{lang.label}</span>
                          <span className="text-[10px] text-[#7A7A70] font-normal">{lang.native}</span>
                        </div>
                        {i18n.language === lang.code && <Check className="w-3.5 h-3.5 text-[#D96B43]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Profile Info */}
              <div className="hidden lg:flex items-center gap-2.5">
                <div className="text-right">
                  <div className="text-xs font-extrabold uppercase text-[#2A2A28] tracking-wide">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-medium text-[#7A7A70]">
                    {currentUser.location}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#F5EBE1] text-[#D96B43] font-extrabold text-xs flex items-center justify-center border border-[#EADBD0]">
                  {initials}
                </div>
              </div>

              {/* Sign out button */}
              <button
                onClick={onLogout}
                className="hidden md:flex items-center gap-1 text-xs font-semibold text-[#7A7A70] hover:text-[#2A2A28] px-2 py-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('signOut', 'Sign out')}</span>
              </button>

              {/* Terracotta Scan Now Pill Button */}
              <NavLink
                to="/scanner"
                className="bg-[#D96B43] hover:bg-[#C25832] text-white px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95 shrink-0"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>{t('scanNow', 'Scan Now')}</span>
              </NavLink>

            </div>

          </header>

          {/* MOBILE NAVIGATION DRAWER */}
          {mobileMenuOpen && (
            <div className="sm:hidden bg-[#324E38] text-white p-4 space-y-3 border-b border-white/10 z-40 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-emerald-300">Active Role: {roleInfo.label}</span>
              </div>
              <nav className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = item.isMarketplace 
                    ? location.pathname.startsWith('/marketplace')
                    : (location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path)));
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${
                        isActive ? 'bg-[#4B6B52] text-white' : 'text-[#B8CBB9] hover:bg-[#3D5B44] hover:text-white'
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              {/* Livestock Marketplace Submenu for Mobile */}
              <div className="border-t border-white/10 pt-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#E8A97D] mb-2 px-1 flex items-center gap-1.5">
                  <span>🛒</span>
                  <span>{t('nav.livestockMarketplace', 'Livestock Marketplace')}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {marketplaceSubItems.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = sub.exact
                      ? location.pathname === sub.path
                      : location.pathname.startsWith(sub.path);
                    return (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`p-2 rounded-xl flex items-center gap-2 text-[11px] font-semibold transition-all ${
                          isSubActive ? 'bg-[#4B6B52] text-white' : 'text-gray-300 hover:bg-[#3D5B44] hover:text-white'
                        }`}
                      >
                        <SubIcon className="w-3.5 h-3.5 shrink-0 text-[#D96B43]" />
                        <span className="truncate">{sub.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full pt-2 border-t border-white/10 text-left text-xs font-bold text-red-300 flex items-center gap-2 p-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('signOut', 'Sign out')}</span>
              </button>
            </div>
          )}

          {/* MAIN VIEW CONTENT CONTAINER */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-[#F8F3EA]">
            {children}
          </main>

        </div>

    </div>
  );
}
