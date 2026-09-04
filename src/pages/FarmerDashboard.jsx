import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Scan,
  Mic,
  MicOff,
  TrendingUp,
  HeartPulse,
  Award,
  AlertTriangle,
  CheckCircle2,
  Users,
  Building2,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Radio,
  FileText,
  Sparkles,
  ChevronRight,
  MessageSquare,
  IndianRupee,
  Droplets,
  Bell,
  Clock,
  Send,
  X,
  Bot,
  Eye,
  Store,
  Tag
} from 'lucide-react';
import { getPassports } from '../utils/passportStorage';
import { getFarmerMilkEarnings, getClinicalCases, createEmergencyRequest } from '../utils/ecosystemStorage';
import { getListings, getMarketplaceStats, fetchListingsFromFirestore } from '../utils/marketplaceStorage';
import { getFirestoreDashboardStats } from '../services/firestoreService';

export default function FarmerDashboard({ user }) {
  const { t, i18n } = useTranslation();

  const currentUser = user || JSON.parse(localStorage.getItem('bovine_user') || '{}') || {
    name: 'Ramesh Patel',
    role: 'farmer',
    location: 'Anand, Gujarat'
  };

  const [passports, setPassports] = useState([]);
  const [milkData, setMilkData] = useState({ todayLiters: 0, todayEarnings: 0, collections: [] });
  const [recentCases, setRecentCases] = useState([]);
  const [mandiData, setMandiData] = useState([]);

  // Marketplace state
  const [marketplaceStats, setMarketplaceStats] = useState({
    total: 0, cattle: 0, buffalo: 0, calves: 0, pregnant: 0, verified: 0
  });
  const [recentListings, setRecentListings] = useState([]);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('');

  // Emergency Vet Modal
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyText, setEmergencyText] = useState('');
  const [selectedAnimalTag, setSelectedAnimalTag] = useState('');
  const [emergencySentToast, setEmergencySentToast] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadedPassports = getPassports();
    setPassports(loadedPassports);
    if (loadedPassports.length > 0) {
      setSelectedAnimalTag(loadedPassports[0].tagNumber);
    }

    setMilkData(getFarmerMilkEarnings(currentUser.name));
    setRecentCases(getClinicalCases().slice(0, 2));

    // Baseline stats from marketplace cache
    setMarketplaceStats(getMarketplaceStats());
    setRecentListings(getListings().slice(0, 4));

    // Fetch live statistics from Cloud Firestore
    const loadFirestoreData = async () => {
      try {
        const fsStats = await getFirestoreDashboardStats();
        if (isMounted && fsStats) {
          setMarketplaceStats(prev => ({
            ...prev,
            total: fsStats.totalListings || prev.total,
            cattle: fsStats.cattleCount || prev.cattle,
            buffalo: fsStats.buffaloCount || prev.buffalo,
            pregnant: fsStats.pregnantCount || prev.pregnant,
            verified: fsStats.verifiedCount || prev.verified
          }));
        }
      } catch (e) {
        console.warn('Dashboard Firestore stats notice:', e);
      }

      try {
        const listings = await fetchListingsFromFirestore();
        if (isMounted && listings && listings.length > 0) {
          setRecentListings(listings.slice(0, 4));
        }
      } catch (e) {
        console.warn('Dashboard Firestore listings notice:', e);
      }
    };

    loadFirestoreData();

    fetch('/api/mandi')
      .then(res => res.json())
      .then(data => {
        if (isMounted) setMandiData(data);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [currentUser.name]);

  const formatHealthStatus = (status) => {
    if (!status) return t('dashboard.allSound', 'All Sound');
    if (status === 'Under Treatment') return t('dashboard.underTreatment', 'Under Treatment');
    if (status === 'Healthy' || status === 'All Clear' || status === 'All Sound') return t('dashboard.allClear', 'All Clear');
    if (status === 'Pregnant') return t('dashboard.pregnant', 'Pregnant');
    return status;
  };

  const getLocalizedDiagnosis = (diag) => {
    if (!diag) return t('dashboard.herdHealthDesc', 'Vaccinations and deworming up to date');
    if (diag.includes('Mastitis') || diag.includes('Streptococcus')) return t('dashboard.mastitis', 'Subclinical Mastitis (Streptococcus uberis)');
    return diag;
  };

  const getLocalizedMandiItem = (item) => {
    if (!item) return item;
    if (i18n.language === 'te') {
      if (item.includes('Murrah')) return 'ముర్రా గేదె పాలు (7% ఫ్యాట్)';
      if (item.includes('Gir')) return 'గీర్ ఆవు పాలు (A2 నాణ్యత)';
      if (item.includes('Sahiwal')) return 'సాహివాల్ ఆవు పాలు (4.5% ఫ్యాట్)';
      if (item.includes('Ongole')) return 'ఒంగోలు ఆవు పాలు';
      if (item.includes('Local')) return 'స్థానిక ఆవు పాలు';
      if (item.includes('Jaffarabadi')) return 'జాఫరాబాది గేదె పాలు';
    } else if (i18n.language === 'hi') {
      if (item.includes('Murrah')) return 'मुर्रा भैंस का दूध (7% फैट)';
      if (item.includes('Gir')) return 'गीर गाय का दूध (A2 गुणवत्ता)';
      if (item.includes('Sahiwal')) return 'साहीवाल गाय का दूध (4.5% फैट)';
      if (item.includes('Ongole')) return 'ओंगोल गाय का दूध';
      if (item.includes('Local')) return 'स्थानीय गाय का दूध';
      if (item.includes('Jaffarabadi')) return 'जाफराबादी भैंस का दूध';
    } else if (i18n.language === 'gu') {
      if (item.includes('Murrah')) return 'મુર્રા ભેંસનું દૂધ (7% ફેટ)';
      if (item.includes('Gir')) return 'ગીર ગાયનું દૂધ (A2 ગુણવત્તા)';
      if (item.includes('Sahiwal')) return 'સાહિવાલ ગાયનું દૂધ';
      if (item.includes('Ongole')) return 'ઓંગોલ ગાયનું દૂધ';
      if (item.includes('Local')) return 'સ્થાનિક ગાયનું દૂધ';
      if (item.includes('Jaffarabadi')) return 'જાફરાબાદી ભેંસનું દૂધ';
    } else if (i18n.language === 'ta') {
      if (item.includes('Murrah')) return 'முர்ரா எருமைப் பால் (7% கொழுப்பு)';
      if (item.includes('Gir')) return 'கிர் பசுவின் பால் (A2 தரம்)';
      if (item.includes('Sahiwal')) return 'சாகிவால் பசுவின் பால்';
      if (item.includes('Ongole')) return 'ஒங்கோல் பசுவின் பால்';
      if (item.includes('Local')) return 'நாட்டுப் பசுவின் பால்';
    } else if (i18n.language === 'kn') {
      if (item.includes('Murrah')) return 'ಮುರ್ರಾ ಎಮ್ಮೆ ಹಾಲು (7% ಕೊಬ್ಬು)';
      if (item.includes('Gir')) return 'ಗಿರ್ ಹಸುವಿನ ಹಾಲು (A2 ಗುಣಮಟ್ಟ)';
      if (item.includes('Sahiwal')) return 'ಸಾಹಿವಾಲ್ ಹಸುವಿನ ಹಾಲು';
      if (item.includes('Ongole')) return 'ಒಂಗೋಲ್ ಹಸುವಿನ ಹಾಲು';
      if (item.includes('Local')) return 'ಸ್ಥಳೀಯ ಹಸುವಿನ ಹಾಲು';
    } else if (i18n.language === 'mr') {
      if (item.includes('Murrah')) return 'मुर्‍हा म्हशीचे दूध (7% फॅट)';
      if (item.includes('Gir')) return 'गीर गायीचे दूध (A2 गुणवत्ता)';
      if (item.includes('Sahiwal')) return 'साहिवाल गायीचे दूध';
      if (item.includes('Ongole')) return 'ओंगोल गायीचे दूध';
      if (item.includes('Local')) return 'स्थानिक गायीचे दूध';
    } else if (i18n.language === 'bn') {
      if (item.includes('Murrah')) return 'মুরাহ মোষের দুধ (৭% ফ্যাট)';
      if (item.includes('Gir')) return 'গির গরুর দুধ (A2 গুণমান)';
      if (item.includes('Sahiwal')) return 'সাহিওয়াল গরুর দুধ';
      if (item.includes('Ongole')) return 'ওঙ্গোল গরুর দুধ';
      if (item.includes('Local')) return 'স্থানীয় গরুর দুধ';
    } else if (i18n.language === 'pa') {
      if (item.includes('Murrah')) return 'ਮੁਰਾ ਮੱਝ ਦਾ ਦੁੱਧ (7% ਫੈਟ)';
      if (item.includes('Gir')) return 'ਗੀਰ ਗਾਂ ਦਾ ਦੁੱਧ (A2 ਗੁਣਵੱਤਾ)';
      if (item.includes('Sahiwal')) return 'ਸਾਹੀਵਾਲ ਗਾਂ ਦਾ ਦੁੱਧ';
      if (item.includes('Ongole')) return 'ਓਂਗੋਲ ਗਾਂ ਦਾ ਦੁੱਧ';
      if (item.includes('Local')) return 'ਦੇਸੀ ਗਾਂ ਦਾ ਦੁੱਧ';
    }
    return item;
  };

  const getLocalizedDistrict = (district) => {
    if (!district) return district;
    if (i18n.language === 'te') {
      if (district.includes('Karnal')) return 'కర్నాల్';
      if (district.includes('Anand')) return 'ఆనంద్';
      if (district.includes('Ludhiana')) return 'లూధియానా';
      if (district.includes('Guntur')) return 'గుంటూరు';
      if (district.includes('Erode')) return 'ఈరోడ్';
      if (district.includes('Mehsana')) return 'మెహసానా';
    } else if (i18n.language === 'hi') {
      if (district.includes('Karnal')) return 'करनाल';
      if (district.includes('Anand')) return 'आनंद';
      if (district.includes('Ludhiana')) return 'लुधियाना';
      if (district.includes('Guntur')) return 'गुंटूर';
      if (district.includes('Erode')) return 'इरोड';
      if (district.includes('Mehsana')) return 'मेहसाणा';
    } else if (i18n.language === 'gu') {
      if (district.includes('Karnal')) return 'કરનાલ';
      if (district.includes('Anand')) return 'આણંદ';
      if (district.includes('Ludhiana')) return 'લુધિયાણા';
      if (district.includes('Guntur')) return 'ગુંટૂર';
      if (district.includes('Mehsana')) return 'મહેસાણા';
    } else if (i18n.language === 'ta') {
      if (district.includes('Karnal')) return 'கர்னால்';
      if (district.includes('Anand')) return 'ஆனந்த்';
      if (district.includes('Ludhiana')) return 'லூதியானா';
      if (district.includes('Guntur')) return 'குண்டூர்';
      if (district.includes('Erode')) return 'ஈரோடு';
    } else if (i18n.language === 'kn') {
      if (district.includes('Karnal')) return 'ಕರ್ನಾಲ್';
      if (district.includes('Anand')) return 'ಆನಂದ್';
      if (district.includes('Ludhiana')) return 'ಲೂಧಿಯಾನ';
      if (district.includes('Guntur')) return 'ಗುಂಟೂರು';
      if (district.includes('Erode')) return 'ಈರೋಡ್';
    }
    return district;
  };

  const getLocalizedPrice = (priceStr) => {
    if (!priceStr) return priceStr;
    const literWord = t('marketplace.milkYieldUnit', 'L').replace('/', '').trim() || 'L';
    return priceStr.replace(/\/\s*(Liter|L)\b/gi, `/ ${literWord}`);
  };

  const handleVoiceRecord = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      let query = "How can I increase milk yield & fat for my Murrah buffalo?";
      let reply = "Feed 60% green fodder (Napier/Maize) + 40% dry straw with 50g bypass fat and chelated minerals daily.";

      if (i18n.language === 'hi') {
        query = "मुर्रा भैंस का दूध और फैट कैसे बढ़ाएं?";
        reply = "60% हरा चारा (नेपियर/मक्का) + 40% सूखा भूसा दें और रोज़ 50 ग्राम बाईपास फैट व मिनरल मिक्सचर खिलाएं।";
      } else if (i18n.language === 'gu') {
        query = "ગીર ગાય માટે ઉનાળામાં કયો ખોરાક સારો છે?";
        reply = "ઉનાળામાં 20 કિલો લીલો ઘાસચારો (નેપિયર/જુવાર) + 3 કિલો દાણ અને 50 ગ્રામ મિનરલ મિશ્રણ આપો.";
      } else if (i18n.language === 'te') {
        query = "నా ఆవు పాల దిగుబడి ఎలా పెంచాలి?";
        reply = "60% పచ్చిమేత + 40% ఎండుగడ్డితో పాటు రోజుకు 50 గ్రాముల మినరల్ మిశ్రమం అందించండి.";
      }

      setVoiceQuery(query);
      setVoiceResponse(reply);
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langMap = { hi: 'hi-IN', gu: 'gu-IN', te: 'te-IN', en: 'en-IN' };
      recognition.lang = langMap[i18n.language] || 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceQuery('');
        setVoiceResponse('');
      };

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setVoiceQuery(transcript);
        setIsRecording(false);

        setTimeout(() => {
          let ans = "Maintain a 60:40 green-to-dry fodder balance and 50g daily chelated mineral mixture.";
          if (i18n.language === 'hi') {
            ans = "संतुलित आहार (60% हरा चारा, 40% सूखा) दें और रोज़ 50 ग्राम मिनरल मिक्सचर दें।";
          } else if (i18n.language === 'gu') {
            ans = "દરરોજ 60% લીલો ચારો, 40% સૂકો ચારો અને 50 ગ્રામ મિનરલ મિશ્રણ આપવું જરૂરી છે.";
          } else if (i18n.language === 'te') {
            ans = "సమతుల్య పచ్చిమేత, ఎండుగడ్డి మరియు 50 గ్రాముల మినరల్ మిశ్రమం ఇవ్వండి.";
          }
          setVoiceResponse(ans);
        }, 400);
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleSendEmergency = (e) => {
    e.preventDefault();
    createEmergencyRequest({
      animalId: selectedAnimalTag,
      tagNumber: selectedAnimalTag,
      farmerName: currentUser.name,
      village: currentUser.location || 'Anand, Gujarat',
      mobile: currentUser.mobile || '+91 98765 43210',
      emergencyType: 'Emergency Farmer Request',
      description: emergencyText || 'Animal showing severe distress, urgent vet visit requested.'
    }, 'farmer');

    setShowEmergencyModal(false);
    setEmergencyText('');
    setEmergencySentToast(true);
    setTimeout(() => setEmergencySentToast(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12 text-[#2A2A28]">

      {/* TOAST NOTIFICATION */}
      {emergencySentToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#8C381A] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 animate-in fade-in slide-in-from-top-4">
          <Stethoscope className="w-5 h-5 text-amber-300" />
          <div>
            <strong className="text-xs block">Emergency Vet Call Broadcasted!</strong>
            <span className="text-[11px] text-amber-100">Dispatched to District Veterinary Command Center.</span>
          </div>
        </div>
      )}

      {/* HERO BANNER - FARMER PORTAL */}
      <div className="bg-[#324E38] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-card border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#B0C4B1] bg-white/10 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                <span>🌾</span> {t('dashboard.portalBadge', 'Farmer Advisory Portal')}
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                {t('dashboard.activeFarmer', 'Active Dairy Farmer')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-editorial font-bold text-white leading-tight">
              {t('dashboard.welcomeBack', 'Welcome Back')}, {currentUser.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#D2E4D4] leading-relaxed">
              {t('dashboard.subtitle', 'Scan your livestock for instant breed recognition, milk yield optimization, health insights, and government loan eligibility.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="bg-red-700 hover:bg-red-800 text-white px-5 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-amber-300" />
              <span>{t('dashboard.emergencyVet', 'Emergency Vet')}</span>
            </button>

            <Link
              to="/scanner"
              className="bg-[#D95A2B] hover:bg-[#C24E22] text-white px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Scan className="w-4 h-4" />
              <span>{t('dashboard.startScan', 'Start AI Vision Scan')}</span>
            </Link>
          </div>
        </div>

        {/* Subtle Decorative Cow Silhouette Vector in Background */}
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none hidden md:block">
          <svg className="w-64 h-64 fill-white" viewBox="0 0 100 100">
            <path d="M85 35c-2-5-8-8-14-7-3-4-8-7-14-7-8 0-15 4-19 10-5-1-10 0-14 3-3-2-7-3-11-2-6 2-10 8-10 15 0 2 0 4 1 6-4 4-6 9-6 15 0 9 6 17 15 19v12h6v-10h18v10h6v-10h16v10h6v-12c8-2 14-10 14-19 0-4-1-8-3-11 3-3 5-7 4-11z" />
          </svg>
        </div>
      </div>

      {/* CROSS-ROLE LIVE SYNC METRICS: VENDOR RECORDED MILK & VET HEALTH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Today's Milk Recorded by Vendor */}
        <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-1.5 hover:border-[#D95A2B] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#7A7A70] flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-[#D95A2B]" />
              {t('dashboard.todayMilkSupplied', "TODAY'S MILK SUPPLIED")}
            </span>
            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {t('dashboard.vendorVerified', 'Vendor Verified')}
            </span>
          </div>
          <div className="text-2xl font-editorial font-bold text-[#2A2A28]">
            {milkData.todayLiters || 26.5} L
          </div>
          <p className="text-[11px] text-[#7A7A70]">
            {t('dashboard.milkSuppliedDesc', 'Morning & evening dairy collection recorded')}
          </p>
        </div>

        {/* Metric 2: Today's Milk Earnings */}
        <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-1.5 hover:border-emerald-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#7A7A70] flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              {t('dashboard.todayMilkEarnings', "TODAY'S MILK EARNINGS")}
            </span>
            <span className="text-[9px] font-bold bg-[#F5EBE1] text-[#D95A2B] px-2 py-0.5 rounded-full">
              {t('dashboard.dbtDirect', 'DBT Direct')}
            </span>
          </div>
          <div className="text-2xl font-editorial font-bold text-emerald-800">
            ₹{milkData.todayEarnings || 1667}
          </div>
          <p className="text-[11px] text-[#7A7A70]">
            {t('dashboard.milkEarningsDesc', 'Direct bank transfer credited to account')}
          </p>
        </div>

        {/* Metric 3: Health Alerts from Vet */}
        <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-1.5 hover:border-blue-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#7A7A70] flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-blue-600" />
              {t('dashboard.herdHealthIndex', 'HERD HEALTH INDEX')}
            </span>
            <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {t('dashboard.allClear', 'All Clear')}
            </span>
          </div>
          <div className="text-2xl font-editorial font-bold text-[#2A2A28]">
            {formatHealthStatus(recentCases[0]?.status)}
          </div>
          <p className="text-[11px] text-[#7A7A70] truncate">
            {getLocalizedDiagnosis(recentCases[0]?.diagnosis)}
          </p>
        </div>

        {/* Metric 4: Registered Livestock Passports */}
        <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-1.5 hover:border-purple-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#7A7A70] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              {t('dashboard.activeBovines', 'REGISTERED ANIMALS')}
            </span>
            <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              {t('dashboard.digitalId', 'Digital ID')}
            </span>
          </div>
          <div className="text-2xl font-editorial font-bold text-[#2A2A28]">
            {passports.length} {t('dashboard.bovines', 'Bovines')}
          </div>
          <p className="text-[11px] text-[#7A7A70]">
            {t('dashboard.inaphBiometric', 'All tagged with INAPH biometric identity')}
          </p>
        </div>

      </div>

      {/* MANDI MILK PRICE TICKER */}
      <div className="bg-[#F4EDE0] p-4 sm:p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#D95A2B] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#D95A2B]">
              {t('dashboard.mandiTicker', 'Nearby Mandi Milk Price Ticker')}
            </span>
          </div>
          <span className="text-[10px] text-[#7A7A70] font-mono">
            {t('dashboard.liveBenchmarks', 'Live Benchmarks 2026')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {(mandiData.length > 0 ? mandiData : [
            { district: 'Anand (Amul)', item: 'Gir Cow Milk (A2)', price_per_unit: '₹68 / L' },
            { district: 'Karnal Mandi', item: 'Murrah Buffalo (7.5% Fat)', price_per_unit: '₹64 / L' },
            { district: 'Ludhiana Dairy', item: 'Sahiwal Milk (A2)', price_per_unit: '₹60 / L' },
            { district: 'Guntur Coop', item: 'Buffalo Milk (8% Fat)', price_per_unit: '₹66 / L' },
            { district: 'Mehsana Mandi', item: 'Jaffarabadi Milk', price_per_unit: '₹65 / L' }
          ]).map((m, i) => (
            <div key={i} className="p-3 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] hover:border-[#D95A2B] transition-colors">
              <div className="text-[9px] text-[#7A7A70] uppercase font-extrabold truncate">{getLocalizedDistrict(m.district)}</div>
              <div className="text-xs font-bold text-[#2A2A28] truncate mt-0.5">{getLocalizedMandiItem(m.item)}</div>
              <div className="text-sm font-bold text-[#D95A2B] mt-1">{getLocalizedPrice(m.price_per_unit)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Link
          to="/scanner"
          className="p-4 rounded-3xl bg-[#F4EDE0] border border-[#DFD3BF] hover:border-[#D95A2B] shadow-soft flex items-center gap-3 transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#F5EBE1] text-[#D95A2B] flex items-center justify-center shrink-0">
            <Scan className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#2A2A28] truncate">{t('nav.scanner', 'AI Scan')}</div>
            <div className="text-[10px] text-[#7A7A70] truncate">{t('dashboard.identifyBreed', 'Identify Breed')}</div>
          </div>
        </Link>

        {/* ADDITIVE FEATURE: Animal Identity & Biometric Verification */}
        <Link
          to="/identity"
          className="p-4 rounded-3xl bg-[#F4EDE0] border border-[#DFD3BF] hover:border-[#324E38] shadow-soft flex items-center gap-3 transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#324E38] text-white flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#2A2A28] truncate">{t('nav.identity', 'Animal Identity')}</div>
            <div className="text-[10px] text-[#7A7A70] truncate">{t('dashboard.irisBiometric', 'Iris Biometric Layer')}</div>
          </div>
        </Link>

        <Link
          to="/digital-passport"
          className="p-4 rounded-3xl bg-[#F4EDE0] border border-[#DFD3BF] hover:border-[#324E38] shadow-soft flex items-center gap-3 transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#2A2A28] truncate">{t('nav.passports', 'Passports')}</div>
            <div className="text-[10px] text-[#7A7A70] truncate">{passports.length} {t('dashboard.registeredAnimals', 'Registered')}</div>
          </div>
        </Link>

        <Link
          to="/assistant"
          className="p-4 rounded-3xl bg-[#F4EDE0] border border-[#DFD3BF] hover:border-[#D95A2B] shadow-soft flex items-center gap-3 transition-all hover:-translate-y-0.5"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#F5EBE1] text-[#D95A2B] flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#2A2A28] truncate">{t('nav.aiAgent', 'AI Agent')}</div>
            <div className="text-[10px] text-[#7A7A70] truncate">{t('dashboard.askExpert', 'Ask Dairy Expert')}</div>
          </div>
        </Link>

        <button
          onClick={() => setShowEmergencyModal(true)}
          className="p-4 rounded-3xl bg-[#F4EDE0] border border-[#DFD3BF] hover:border-red-600 shadow-soft flex items-center gap-3 transition-all hover:-translate-y-0.5 text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#2A2A28] truncate">{t('dashboard.emergencyVet', 'Emergency Vet')}</div>
            <div className="text-[10px] text-[#7A7A70] truncate">{t('dashboard.directCall1962', 'Direct Call 1962')}</div>
          </div>
        </button>
      </div>

      {/* 🛒 LIVESTOCK MARKETPLACE OVERVIEW & RECENT LISTINGS (Master Prompt Section 2) */}
      <div className="bg-[#F4EDE0] p-6 sm:p-7 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-6">
        
        {/* Marketplace Overview Header Card */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-[#EDE7DA]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#324E38]/10 text-[#324E38] text-[11px] font-extrabold uppercase tracking-wider">
              <span>🛒</span>
              <span>{t('marketplace.title', 'Livestock Marketplace')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-editorial font-bold text-[#2A2A28]">
              {t('marketplace.subtitle', 'Buy and sell verified cattle, buffaloes, and calves')}
            </h2>
            <p className="text-xs text-[#7A7A70]">
              {t('marketplace.trustSubtitle', 'Direct farm-to-buyer livestock mandi with AI morphological verification and official Pashu Aadhaar records.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/marketplace"
              className="px-4 py-2.5 rounded-xl border border-[#DFD3BF] hover:bg-white text-[#2A2A28] text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>{t('marketplace.viewMarketplace', 'Browse Marketplace')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/marketplace/sell"
              className="px-5 py-2.5 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t('marketplace.sellYourAnimal', '+ SELL YOUR ANIMAL')}</span>
            </Link>
          </div>
        </div>

        {/* Quick Metrics Bar (6 Metrics) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#EDE7DA] text-center shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-[#7A7A70] block">{t('marketplace.animalsListed', 'Animals Listed')}</span>
            <span className="text-xl font-editorial font-bold text-[#2A2A28] mt-0.5 block">{marketplaceStats.total || 7}</span>
            <span className="text-[9px] text-[#324E38] font-semibold">{t('marketplace.inMandi', 'In Mandi')}</span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#EDE7DA] text-center shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-[#7A7A70] block">{t('marketplace.cattle', 'Cattle')}</span>
            <span className="text-xl font-editorial font-bold text-[#324E38] mt-0.5 block">{marketplaceStats.cattle || 4}</span>
            <span className="text-[9px] text-gray-500">{t('marketplace.cowsBulls', 'Cows & Bulls')}</span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#EDE7DA] text-center shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-[#7A7A70] block">{t('marketplace.buffaloes', 'Buffaloes')}</span>
            <span className="text-xl font-editorial font-bold text-[#2A2A28] mt-0.5 block">{marketplaceStats.buffalo || 3}</span>
            <span className="text-[9px] text-gray-500">{t('marketplace.murrahJaff', 'Murrah & Jaff.')}</span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#EDE7DA] text-center shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-[#7A7A70] block">{t('marketplace.calves', 'Calves')}</span>
            <span className="text-xl font-editorial font-bold text-[#D96B43] mt-0.5 block">{marketplaceStats.calves || 2}</span>
            <span className="text-[9px] text-emerald-600 font-semibold">{t('marketplace.youngBovines', 'Young Bovines')}</span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#EDE7DA] text-center shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-[#7A7A70] block">{t('marketplace.pregnantAnimals', 'Pregnant Animals')}</span>
            <span className="text-xl font-editorial font-bold text-amber-700 mt-0.5 block">{marketplaceStats.pregnant || 2}</span>
            <span className="text-[9px] text-amber-800 font-medium">{t('marketplace.vetVerified', 'Veterinary Verified')}</span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#EDE7DA] text-center shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-[#7A7A70] block">{t('marketplace.verifiedAnimals', 'Verified Animals')}</span>
            <span className="text-xl font-editorial font-bold text-emerald-700 mt-0.5 block">{marketplaceStats.verified || 5}</span>
            <span className="text-[9px] text-emerald-800 font-medium">{t('marketplace.pashuAadhaar', 'Pashu Aadhaar')}</span>
          </div>
        </div>

        {/* Recently Listed Animals Grid */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-editorial font-bold text-[#2A2A28]">
                {t('marketplace.recentlyListed', 'Recently Listed Animals')}
              </span>
              <span className="text-[10px] text-white bg-[#D96B43] px-2 py-0.5 rounded-full font-bold">
                {t('common.new', 'NEW')}
              </span>
            </div>
            <Link
              to="/marketplace"
              className="text-xs font-bold text-[#324E38] hover:text-[#D96B43] flex items-center gap-1 transition-colors"
            >
              <span>{t('marketplace.viewAllInMandi', 'View All In Mandi')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentListings.map((animal) => {
              const photo = animal.photos && animal.photos.length > 0
                ? (typeof animal.photos[0] === 'string' ? animal.photos[0] : animal.photos[0].preview)
                : 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80';

              return (
                <Link
                  key={animal.id}
                  to={`/marketplace/animal/${animal.id}`}
                  className="group bg-white rounded-2xl border border-[#EDE7DA] hover:border-[#D96B43] shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                    <img
                      src={photo}
                      alt={animal.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = (animal.category?.toLowerCase() === 'buffalo' || animal.species?.toLowerCase() === 'buffalo') ? '/breeds/murrah.jpg' : '/breeds/gir.jpg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge */}
                    {animal.verified && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t('common.verified', 'VERIFIED')}</span>
                      </span>
                    )}

                    <span className="absolute bottom-2 left-2 bg-[#2A2A28]/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-bold font-editorial shadow-xs">
                      ₹{Number(animal.price).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-[#7A7A70] mb-0.5">
                        <span className="font-bold text-[#324E38] uppercase">{animal.category}</span>
                        <span>{animal.age || '3 yrs'}</span>
                      </div>

                      <h4 className="font-editorial font-bold text-sm text-[#2A2A28] line-clamp-1 group-hover:text-[#D96B43] transition-colors">
                        {animal.title}
                      </h4>

                      {animal.milkYield && (
                        <div className="text-[11px] font-semibold text-blue-700 mt-1 flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-blue-500" />
                          <span>
                            {animal.milkYield.includes('L') || animal.milkYield.includes('Liter') 
                              ? animal.milkYield 
                              : `${animal.milkYield} ${t('marketplace.milkYieldUnit', 'L / day')}`}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-[#7A7A70]">
                      <span className="truncate max-w-[140px]">{animal.location || animal.seller?.location || 'Gujarat'}</span>
                      <span className="text-[#D96B43] font-bold group-hover:translate-x-0.5 transition-transform">{t('marketplace.details', 'Details')} &rarr;</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>

      {/* MAIN SPLIT: VOICE ADVISORY (5 Cols) + PASSPORTS & VET LOGS (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 5 COLS: VOICE-FIRST ADVISORY & RECENT VENDOR MILK RECEIPTS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 🐄 Animal Identity & Biometric Verification — Feature Showcase Card */}
          <Link to="/identity" className="block group">
            <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4 relative overflow-hidden transition-all hover:-translate-y-1 hover:border-[#D95A2B]">
              
              {/* Decorative sticker watermark */}
              <img src="/breeds/gir.jpg" alt="" className="absolute -right-4 -top-2 w-28 h-28 object-cover rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity rotate-6 pointer-events-none select-none" />
              <img src="/breeds/murrah.jpg" alt="" className="absolute -left-3 -bottom-4 w-24 h-24 object-cover rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity -rotate-12 pointer-events-none select-none" />

              {/* Sub-header */}
              <div className="flex items-center gap-2.5 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <img src="/stickers/iris_scan.jpg" alt="Iris Biometric" className="w-8 h-8 rounded-lg object-cover" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    {t('dashboard.officialRegistration', 'OFFICIAL REGISTRATION')}
                  </div>
                  <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                    {t('nav.identity', 'Animal Identity & Verification')}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-[#7A7A70] leading-relaxed relative z-10">
                {t('dashboard.irisLayerDesc', 'Iris-based individual animal biometric verification linked to official 12-digit BPA / Pashu Aadhaar tag IDs.')}
              </p>

              {/* Livestock Photo Row — Cattle, Calf, Buffalo */}
              <div className="flex items-center justify-center gap-3 py-1 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] p-1 overflow-hidden flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <img src="/breeds/gir.jpg" alt="Cattle" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] p-1 overflow-hidden flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <img src="/breeds/calf.jpg" alt="Calf" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] p-1 overflow-hidden flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <img src="/breeds/murrah.jpg" alt="Buffalo" className="w-full h-full object-cover rounded-xl" />
                </div>
              </div>

              {/* Lifecycle Steps */}
              <div className="grid grid-cols-3 gap-2 relative z-10 text-xs">
                <div className="bg-[#F4EDE0] rounded-xl p-2 text-center border border-[#EDE7DA]">
                  <div className="text-[10px] font-bold text-[#D95A2B]">{t('dashboard.register', 'Register')}</div>
                  <div className="text-[9px] text-[#7A7A70] mt-0.5">Calf → V1</div>
                </div>
                <div className="bg-[#F4EDE0] rounded-xl p-2 text-center border border-[#EDE7DA]">
                  <div className="text-[10px] font-bold text-emerald-700">{t('dashboard.verify', 'Verify')}</div>
                  <div className="text-[9px] text-[#7A7A70] mt-0.5">Multi-Match</div>
                </div>
                <div className="bg-[#F4EDE0] rounded-xl p-2 text-center border border-[#EDE7DA]">
                  <div className="text-[10px] font-bold text-[#324E38]">{t('dashboard.update', 'Update')}</div>
                  <div className="text-[9px] text-[#7A7A70] mt-0.5">Adult → V2/V3</div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center justify-between pt-1 relative z-10 border-t border-[#EDE7DA]">
                <span className="text-[10px] text-[#7A7A70] font-semibold">{t('dashboard.tapToOpen', 'Tap to open Biometric ID →')}</span>
                <div className="px-3.5 py-1.5 rounded-full bg-[#D95A2B] hover:bg-[#C24E22] text-white text-[10px] font-bold shadow-sm transition-colors">
                  {t('dashboard.open', 'Open →')}
                </div>
              </div>
            </div>
          </Link>

          {/* Recent Milk Vendor Collection Receipts (Cross-Role Proof) */}
          <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-3">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-2">
              <span className="text-[10px] font-black uppercase text-[#324E38] flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#D95A2B]" />
                {t('dashboard.milkReceiptsTitle', 'LIVESTOCK MILK VENDOR RECEIPTS')}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">{t('dashboard.autoSynced', 'Auto-Synced')}</span>
            </div>

            <div className="space-y-2 text-xs">
              {(milkData.collections.length > 0 ? milkData.collections.slice(0, 2) : [
                { id: 'MC-1', date: 'Today', liters: 14.5, fat: 7.6, snf: 9.2, totalPayout: 968.6, animalTag: 'TAG-IN-4420' },
                { id: 'MC-2', date: 'Today', liters: 12.0, fat: 4.8, snf: 8.8, totalPayout: 698.4, animalTag: 'TAG-IN-8891' }
              ]).map((c, i) => (
                <div key={i} className="p-3 bg-[#F4EDE0] rounded-2xl border border-[#DFD3BF] flex items-center justify-between">
                  <div>
                    <strong className="text-[#2A2A28] block">{c.animalTag || 'Milking Bovine'}</strong>
                    <span className="text-[10px] text-[#7A7A70]">{c.liters} L · {c.fat}% Fat · {c.snf}% SNF</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-700 block">₹{c.totalPayout}</span>
                    <span className="text-[9px] text-[#7A7A70]">{t('dashboard.paidDbt', 'Paid (DBT)')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT 7 COLS: DIGITAL PASSPORTS & VETERINARY CLINICAL LOG */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Digital Animal Passport Summary Card */}
          <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  📋
                </span>
                <div>
                  <h2 className="text-lg font-editorial font-bold text-[#2A2A28]">
                    {t('dashboard.digitalPassportTitle', 'Digital Animal Passport')}
                  </h2>
                  <span className="text-[10px] text-[#7A7A70]">
                    {passports.length} {t('dashboard.registeredAnimals', 'Registered Animals')}
                  </span>
                </div>
              </div>

              <Link
                to="/digital-passport"
                className="text-xs font-bold text-[#D95A2B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{t('dashboard.viewPassports', 'View Passports')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Passport Previews Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {passports.slice(0, 2).map((animal) => (
                <div
                  key={animal.id}
                  className="bg-[#F4EDE0] p-3.5 rounded-2xl border border-[#DFD3BF] hover:border-[#D95A2B] shadow-xs flex flex-col justify-between space-y-3 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-14 rounded-xl overflow-hidden border border-[#DFD3BF] shrink-0 bg-[#F5EBE1]">
                      <img
                        src={animal.photo}
                        alt={animal.breed}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = animal.species?.toLowerCase() === 'buffalo' ? '/breeds/murrah.jpg' : '/breeds/gir.jpg';
                        }}
                        className="w-full h-full object-cover"
                      />
                      <img
                        src={animal.species?.toLowerCase() === 'buffalo' ? '/breeds/murrah.jpg' : '/breeds/gir.jpg'}
                        alt=""
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-white shadow-xs object-cover bg-white"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-[#7A7A70]">
                          {animal.tagNumber}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#FAF5EB] border border-[#EDE7DA] text-[#324E38] flex items-center gap-1">
                          <img
                            src={animal.species?.toLowerCase() === 'buffalo' ? '/breeds/murrah.jpg' : '/breeds/gir.jpg'}
                            alt=""
                            className="w-3 h-3 rounded-full object-cover"
                          />
                          {animal.species === 'Buffalo' ? 'Buffalo' : 'Cattle'}
                        </span>
                      </div>
                      <h4 className="font-editorial font-bold text-sm text-[#2A2A28] truncate">
                        {animal.breed}
                      </h4>
                      <span className="text-[10px] text-[#7A7A70]">
                        {animal.gender} · {animal.age}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EDE7DA]">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      animal.health?.status === 'Healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {formatHealthStatus(animal.health?.status)}
                    </span>
                    <Link
                      to={`/digital-passport/${animal.id}`}
                      className="text-[11px] font-bold text-[#324E38] hover:underline flex items-center gap-1"
                    >
                      <span>{t('dashboard.viewPassport', 'View Passport')}</span> &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Role Clinical Log from Veterinarian */}
          <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#D95A2B]" />
                <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                  {t('dashboard.vetRecordsTitle', 'Verified Veterinary Clinical Records')}
                </h3>
              </div>
              <span className="text-[10px] text-[#7A7A70]">{t('dashboard.icarDept', 'ICAR / Animal Husbandry Dept')}</span>
            </div>

            <div className="space-y-3 text-xs">
              {recentCases.map((c, i) => (
                <div key={i} className="p-4 bg-[#F4EDE0] rounded-2xl border border-[#DFD3BF] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-[#2A2A28] text-sm block">{getLocalizedDiagnosis(c.diagnosis)}</strong>
                      <span className="text-[10px] text-[#7A7A70]">Patient: {c.breed} ({c.tagNumber}) · {c.date}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {formatHealthStatus(c.status)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5A5A50] bg-[#F4EDE0] p-2.5 rounded-xl border border-[#EDE7DA]">
                    <strong>{t('dashboard.rxTreatment', 'Rx Treatment:')}</strong> {c.treatmentGiven}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-[#7A7A70] pt-1">
                    <span>{t('dashboard.consultant', 'Consultant:')} <strong>{c.vetName}</strong></span>
                    {c.vaccinationGiven && <span className="text-emerald-700 font-bold">✓ {c.vaccinationGiven}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* EMERGENCY VET REQUEST MODAL */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4EDE0] rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#DFD3BF] shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2 text-red-700 font-bold">
                <Stethoscope className="w-5 h-5" />
                <h3 className="font-editorial text-base text-[#2A2A28]">
                  Emergency Veterinary Dispatch (1962)
                </h3>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F3EA] hover:bg-[#EDE7DA] flex items-center justify-center text-[#7A7A70]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmergency} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Select Affected Bovine</label>
                <select
                  value={selectedAnimalTag}
                  onChange={(e) => setSelectedAnimalTag(e.target.value)}
                  className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2.5 text-xs text-[#2A2A28]"
                >
                  {passports.map(p => (
                    <option key={p.id} value={p.tagNumber}>
                      {p.breed} — {p.tagNumber} ({p.gender})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Emergency Symptoms</label>
                <textarea
                  rows={3}
                  required
                  value={emergencyText}
                  onChange={(e) => setEmergencyText(e.target.value)}
                  placeholder="Describe emergency (e.g. Acute bloat, fallen cow unable to stand, high fever >105°F)..."
                  className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl p-3 text-xs text-[#2A2A28]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-snug">
                ⚠️ This request will be instantly pushed to the District Veterinary Command Center emergency queue with your GPS coordinates.
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="flex-1 bg-[#F4EDE0] border border-[#DFD3BF] py-2.5 rounded-xl font-bold text-[#7A7A70]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-700 hover:bg-red-800 text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Dispatch Vet Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
