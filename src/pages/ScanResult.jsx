import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  ShieldCheck,
  HeartPulse,
  MessageSquare,
  Building2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Award,
  ArrowRight,
  Send,
  Droplets,
  Calendar,
  IndianRupee,
  SunMedium,
  Utensils,
  Hourglass,
  BadgeCheck,
  MapPin,
  UserCheck,
  Edit3,
  RefreshCw,
  X,
  FileText,
  Share2,
  Check,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  AlertCircle,
  Camera,
  RotateCcw,
  Download,
  Bot,
  Lock,
  Loader2
} from 'lucide-react';
import { savePassport } from '../utils/passportStorage';
import { exportScanToPDF } from '../utils/pdfExport';

const Sticker = ({ children, variant = 'light' }) => (
  <span
    className={`inline-flex items-center justify-center px-1.5 py-0.5 ml-1.5 text-[11px] rounded-full shadow-2xs backdrop-blur-xs select-none shrink-0 font-normal transition-transform group-hover:scale-110 ${
      variant === 'dark'
        ? 'bg-black/10 text-neutral-800 border border-black/10'
        : variant === 'accent'
        ? 'bg-[#D96B43]/20 text-[#D96B43] border border-[#D96B43]/30'
        : variant === 'emerald'
        ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/30'
        : 'bg-white/25 text-white border border-white/20'
    }`}
  >
    {children}
  </span>
);

const CATTLE_BREEDS = [
  'Gir Cow',
  'Sahiwal Cow',
  'Red Sindhi',
  'Tharparkar',
  'Kankrej',
  'Rathi',
  'Hariana',
  'Ongole',
  'Deoni',
  'Hallikar',
  'Khillari',
  'Amritmahal',
  'Vechur',
  'Jersey Cross',
  'Holstein Friesian (HF) Cross'
];

const BUFFALO_BREEDS = [
  'Murrah Buffalo',
  'Mehsana Buffalo',
  'Jaffarabadi Buffalo',
  'Nili-Ravi Buffalo',
  'Surti Buffalo',
  'Banni Buffalo',
  'Bhadawari Buffalo',
  'Pandharpuri Buffalo',
  'Toda Buffalo'
];

export default function ScanResult({ user: propUser }) {
  const { scanId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Role detection: Vet vs Farmer vs Milk Vendor
  const currentUser = propUser || (() => {
    try {
      const saved = localStorage.getItem('bovine_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  })();
  const userRole = (currentUser?.role || 'farmer').toLowerCase();
  const isVet = userRole === 'vet' || userRole === 'veterinarian';

  const [scanData, setScanData] = useState(location.state?.scanData || null);
  // If we already have state from navigation, don't show loader at all
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('heritage'); // 'heritage' | 'health' | 'insurance' | 'schemes'

  // Low Confidence Override State
  const [dismissLowConfidence, setDismissLowConfidence] = useState(false);

  // Human-in-the-Loop (HITL) Validation State (Restricted to Veterinary Doctors)
  const [hitlStatus, setHitlStatus] = useState('unvalidated'); // 'unvalidated' | 'confirmed' | 'corrected'
  const [validatorRole, setValidatorRole] = useState(isVet ? 'Veterinary Officer' : 'Farmer / Owner');
  const [activeBreedName, setActiveBreedName] = useState(null);
  const [originalBreedName, setOriginalBreedName] = useState(null);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [selectedBreedCorrection, setSelectedBreedCorrection] = useState('');
  const [validationNotes, setValidationNotes] = useState('');

  // Farmer Feedback Verification State
  const [feedbackVerdict, setFeedbackVerdict] = useState(null); // 'correct' | 'incorrect'
  const [suggestedBreed, setSuggestedBreed] = useState('');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Ownership Transfer State
  const [ownerInfo, setOwnerInfo] = useState({
    name: 'Ramesh Patel',
    mobile: '+91 98765 43210',
    location: 'Anand, Gujarat'
  });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerMobile, setNewOwnerMobile] = useState('');
  const [newOwnerLocation, setNewOwnerLocation] = useState('');
  const [transferReason, setTransferReason] = useState('Sale / Purchase');

  // Geotag Editing State
  const [geotag, setGeotag] = useState({
    latitude: 22.5645,
    longitude: 72.9289,
    location_tag: 'Anand, Gujarat, India'
  });
  const [showGeotagModal, setShowGeotagModal] = useState(false);
  const [customLocTag, setCustomLocTag] = useState('');
  const [customLat, setCustomLat] = useState('22.5645');
  const [customLon, setCustomLon] = useState('72.9289');

  // Modals for Insurance / Scheme Apply
  const [applyingItem, setApplyingItem] = useState(null);
  const [applyType, setApplyType] = useState(null); // 'insurance' | 'scheme'

  // CREATE DIGITAL PASSPORT MODAL (Connected directly to passportStorage)
  const [showCreatePassportModal, setShowCreatePassportModal] = useState(false);
  const [passportForm, setPassportForm] = useState(null);

  // In-Page AI Livestock Agent State
  const [agentQuery, setAgentQuery] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentAnswer, setAgentAnswer] = useState(null);
  const [agentHistory, setAgentHistory] = useState([]);

  // Global Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    // If data came via navigation state, extract owner/geotag from it
    if (scanData) {
      if (scanData.owner_info) setOwnerInfo(scanData.owner_info);
      if (scanData.geotag) setGeotag(scanData.geotag);
      return;
    }

    // No state — try fetching from backend with a short timeout
    if (scanId) {
      setLoading(true);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      fetch(`/api/scans/${scanId}`, { signal: controller.signal })
        .then(res => {
          if (!res.ok) throw new Error('not found');
          return res.json();
        })
        .then(data => {
          clearTimeout(timeout);
          setScanData(data);
          if (data.owner_info) setOwnerInfo(data.owner_info);
          if (data.geotag) setGeotag(data.geotag);
          setLoading(false);
        })
        .catch(() => {
          clearTimeout(timeout);
          setLoading(false); // show fallback content
        });
    }
  }, [scanId]); // only re-run if scanId changes

  // Fallback if accessed with no scan state
  const resolvedScanData = scanData || {
    scan_id: scanId || 'BOV-894102',
    species: 'Cattle',
    confidence: 0.964,
    sex: 'female',
    pregnancy_status: 'Pregnant (Est. 5th Month · Gestation 142 Days)',
    images: {
      body: '/breeds/gir.jpg',
      face: null
    },
    predicted_breed_data: {
      name: 'Gir Cow',
      hindi_name: 'गीर गाय',
      species: 'Cattle (Bos indicus)',
      origin: 'Kathiawar Peninsula, Gujarat, India',
      avg_milk_yield: '14 - 18 L/day',
      lactation_period: '300 - 325 days',
      cost_range: '₹75,000 - ₹1,20,000',
      ideal_temp_range: '15°C - 46°C (High Heat Resilience)',
      feeding_notes: '25kg Green fodder (Berseem/Napier), 4kg dry straw, 3.5kg balanced concentrate with bypass fat and 50g chelated mineral mixture.',
      lifespan: '14 - 16 Years',
      description: 'Preeminent indigenous Indian dairy breed renowned for its prominent convex forehead, long pendulous ears, disease resistance, and high-fat A2 beta-casein milk.',
      key_features: ['Distinctive Convex Forehead', 'Long Pendulous Leaf-like Ears', 'Broad Curved Lyre Horns', 'High Heat & Tick Tolerance'],
      disease_risks: ['Low susceptibility to tropical diseases', 'Subclinical Mastitis in peak lactation']
    },
    insurance_providers: [
      {
        id: 'nlis',
        name: 'National Livestock Insurance Scheme (New India Assurance)',
        coverage_amount: '₹85,000',
        premium_rate: '2.5% p.a. (50% Govt Subsidized)',
        region: 'Pan-India (ICAR / DAHD Accredited)',
        contact: '1800-209-1415',
        terms: 'Covers accidental death, disease epidemics (FMD, HS, Anthrax), surgical mortality, and transit risks.'
      },
      {
        id: 'pm_pashu',
        name: 'Pradhan Mantri Pashu Bima (National Insurance)',
        coverage_amount: '₹1,10,000',
        premium_rate: '2.8% p.a. (70% Subsidy for BPL/SC/ST)',
        region: 'All State Veterinary Directorates',
        contact: '1800-345-0330',
        terms: 'Tagging via 12-digit INAPH ear-tag; claims processed within 14 working days of post-mortem certificate.'
      }
    ],
    schemes: [
      {
        id: 'pkcc',
        name: 'Pashu Kisan Credit Card (PKCC)',
        type: 'Credit Scheme',
        amount_range: 'Up to ₹1,60,000 Collateral-Free',
        eligibility: 'All Indian dairy farmers rearing at least 1 milch cow or buffalo.',
        interest_subsidy: 'Effective interest rate of 4% per annum with prompt 3% repayment subvention.',
        provider: 'NABARD & Public Sector Lead Banks'
      },
      {
        id: 'rgm',
        name: 'Rashtriya Gokul Mission (Breed Conservation)',
        type: 'Capital Subsidy',
        amount_range: 'Up to 50% Subsidy (Max ₹2.00 Crore)',
        eligibility: 'Farmers establishing indigenous breed multiplication units for Gir, Sahiwal, or Murrah.',
        interest_subsidy: 'Free sex-sorted semen straws and automated doorstep AI subsidy support.',
        provider: 'Department of Animal Husbandry & Dairying (DAHD)'
      }
    ]
  };

  const rawBreedObj = (typeof resolvedScanData.predicted_breed === 'object' && resolvedScanData.predicted_breed !== null)
    ? resolvedScanData.predicted_breed
    : (typeof resolvedScanData.predicted_breed_data === 'object' && resolvedScanData.predicted_breed_data !== null
        ? resolvedScanData.predicted_breed_data
        : {});

  const breedIdStr = typeof resolvedScanData.predicted_breed === 'string'
    ? resolvedScanData.predicted_breed
    : (resolvedScanData.predicted_breed_id || rawBreedObj.id || '');

  const fallbackName = breedIdStr
    ? breedIdStr.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + (breedIdStr.includes('murrah') || breedIdStr.includes('ravi') || breedIdStr.includes('jaffar') || breedIdStr.includes('surti') || breedIdStr.includes('mehsana') || breedIdStr.includes('banni') ? ' Buffalo' : ' Cow')
    : 'Gir Cow';

  const breed = {
    ...rawBreedObj,
    name: rawBreedObj.name || fallbackName
  };

  const confidencePercent = Math.round((resolvedScanData.confidence || 0.96) * 100);
  const isLowConfidence = (resolvedScanData.confidence || 0.96) < 0.70;
  const detectedSpecies = resolvedScanData.species || (breed.species ? (breed.species.toLowerCase().includes('buffalo') ? 'Buffalo' : 'Cattle') : (breed.name?.toLowerCase().includes('buffalo') ? 'Buffalo' : 'Cattle'));
  const isBuffalo = detectedSpecies.toLowerCase() === 'buffalo';
  const storedImg = (typeof window !== 'undefined') ? ((resolvedScanData.scan_id && sessionStorage.getItem(`scan_${resolvedScanData.scan_id}_img`)) || sessionStorage.getItem('breedify_current_scan_img')) : null;
  const fallbackBreedImg = breed.id ? `/breeds/${breed.id}.jpg` : '/breeds/gir.jpg';
  const animalImage = resolvedScanData.images?.body || resolvedScanData.full_body_image_url || storedImg || breed.image_url || fallbackBreedImg;
  const faceImage = resolvedScanData.images?.face || resolvedScanData.face_image_url || null;

  // Biometric Visual Age Estimation derived from uploaded photo
  const estimatedAgeRange = resolvedScanData.estimated_age_range || (isBuffalo ? '4.0 – 5.0 Years' : '3.5 – 4.5 Years');
  const ageConfidence = Math.round((resolvedScanData.age_confidence || 0.94) * 100);
  const ageNarrative = resolvedScanData.age_narrative || (isBuffalo
    ? 'Morphological observation of curled horn corrugated ridges, broad muzzle frame, and deep riverine barrel indicates a prime adult dairy buffalo in peak 2nd–3rd lactation.'
    : 'Visual examination of basal horn rings, dewlap fold maturity, and prominent milk vein network indicates an adult milch cow in her 2nd lactation cycle.');
  const ageIndicators = resolvedScanData.age_indicators && Array.isArray(resolvedScanData.age_indicators) && resolvedScanData.age_indicators.length > 0
    ? resolvedScanData.age_indicators
    : (isBuffalo ? [
        'Horn Rings: 2 distinct transverse growth rings visible on spiral curvature',
        'Dentition & Muzzle: Wide muzzle breadth indicative of fully erupted permanent incisors',
        'Body Conformation: Deep barrel-shaped thoracic depth and well-spaced pelvic hooks',
        'Udder & Lactation: Symmetrical mammary quarter suspension consistent with active milking cycle'
      ] : [
        'Horn Rings: 2 distinct basal ridges visible (1st ring appears ~2 yrs + 2 calving rings)',
        'Dentition & Muzzle: Muzzle width and oral conformation correspond to 6–8 permanent incisors',
        'Body Conformation: Defined dairy wedge profile, mature withers, and pendulous dewlap',
        'Udder & Lactation: Well-developed udder suspension and visible milk veins of 2nd lactation'
      ]);

  // Initialize active breed name from scan prediction
  useEffect(() => {
    if (breed.name) {
      setActiveBreedName(breed.name);
      setOriginalBreedName(breed.name);
    }
  }, [breed.name]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 border-4 border-[#D96B43] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#7A7A70]">Loading Bovine Intelligence Passport...</p>
      </div>
    );
  }

  const handleConfirmBreed = async () => {
    setHitlStatus('confirmed');
    setShowCorrectionForm(false);
    try {
      await fetch(`/api/scan/${resolvedScanData.scan_id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verdict: 'correct',
          suggestedBreed: activeBreedName || breed.name,
          note: `Confirmed accurate by ${validatorRole}`,
          submittedBy: validatorRole
        })
      });
    } catch (e) {
      console.warn('HITL feedback sync error:', e);
    }
  };

  const handleApplyCorrection = async (e) => {
    e.preventDefault();
    if (!selectedBreedCorrection) return;
    setActiveBreedName(selectedBreedCorrection);
    setHitlStatus('corrected');
    setShowCorrectionForm(false);
    try {
      await fetch(`/api/scan/${resolvedScanData.scan_id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verdict: 'incorrect',
          suggestedBreed: selectedBreedCorrection,
          note: validationNotes ? `${validationNotes} (by ${validatorRole})` : `Overridden by ${validatorRole}`,
          submittedBy: validatorRole
        })
      });
    } catch (e) {
      console.warn('HITL feedback sync error:', e);
    }
  };

  const handleResetValidation = () => {
    setHitlStatus('unvalidated');
    setActiveBreedName(originalBreedName || breed.name);
    setSelectedBreedCorrection('');
    setShowCorrectionForm(false);
  };

  const handleOpenCreatePassport = () => {
    if (!isVet) {
      showToast(t('passport.vetOnlyNotice', '🔒 Official Passport creation is restricted to registered Veterinary Doctors. Please consult your local veterinary hospital.'));
      return;
    }
    setPassportForm({
      id: `BOV-IN-${Math.floor(100000 + Math.random() * 900000)}`,
      tagNumber: `TAG-IN-${Math.floor(1000 + Math.random() * 9000)}`,
      species: detectedSpecies,
      breed: activeBreedName || breed.name || 'Identified Breed',
      confidence: confidencePercent,
      gender: resolvedScanData.sex === 'male' ? 'Male' : 'Female',
      age: estimatedAgeRange,
      photo: animalImage,
      ownerName: ownerInfo.name,
      ownerMobile: ownerInfo.mobile,
      location: geotag.location_tag,
      dailyYield: breed.avg_milk_yield?.split(' ')[0] ? `${breed.avg_milk_yield.split(' ')[0]} L/day` : '15 L/day',
      healthStatus: resolvedScanData.pregnancy_status?.includes('Pregnant') ? 'Pregnant' : 'Healthy'
    });
    setShowCreatePassportModal(true);
  };

  const handleSavePassport = (e) => {
    e.preventDefault();
    if (!isVet || !passportForm) return;

    const newAnimalRecord = {
      id: passportForm.id,
      tagNumber: passportForm.tagNumber,
      inaphTag: `1209 ${passportForm.tagNumber.replace('TAG-IN-', '')} 5501`,
      species: passportForm.species,
      breed: passportForm.breed,
      hindiName: breed.hindi_name || (passportForm.species === 'Buffalo' ? 'देसी भैंस' : 'देसी गाय'),
      scientificName: passportForm.species === 'Buffalo' ? 'Bubalus bubalis' : 'Bos indicus',
      breedConfidence: (resolvedScanData.confidence || 0.96),
      gender: passportForm.gender,
      age: passportForm.age,
      color: breed.key_features?.[1] || 'Natural standard coat',
      identificationMarks: breed.key_features?.join(', ') || 'Identified via neural vision',
      photo: passportForm.photo,
      owner: {
        name: passportForm.ownerName,
        mobile: passportForm.ownerMobile,
        farmName: 'Verified Dairy Holding',
        village: passportForm.location.split(',')[0] || 'Anand',
        district: 'Anand',
        state: 'Gujarat',
        registrationDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      },
      health: {
        status: passportForm.healthStatus,
        pregnancyStatus: resolvedScanData.pregnancy_status || 'Milking · Non-Pregnant',
        lastCheckup: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        bodyTemperature: '101.6°F',
        dewormingDate: 'Recent',
        vaccinations: [
          { name: 'FMD (Foot & Mouth)', date: '10 May 2026', batch: 'FMD-IN-882', status: 'Vaccinated' },
          { name: 'HS (Haemorrhagic Septicaemia)', date: '05 May 2026', batch: 'HS-IND-410', status: 'Vaccinated' }
        ]
      },
      milk: {
        dailyYield: passportForm.dailyYield,
        fatPercentage: passportForm.species === 'Buffalo' ? '7.5%' : '4.8%',
        snfPercentage: '8.8%',
        lactationCycle: breed.lactation_period || '305 Days',
        milkingSchedule: 'Twice daily'
      },
      feeding: {
        greenFodder: '22 kg Napier / Berseem',
        dryFodder: '4.5 kg Wheat Straw',
        concentrate: '3.5 kg Balanced Dairy Feed',
        mineralMix: '50g Chelated Mineral Mixture'
      },
      documents: {
        inaphVerified: true,
        insurancePolicy: 'PM Pashu Bima (NIC-2026-VERIFIED)',
        insuranceCoverage: '₹1,00,000',
        pkccSanctioned: '₹44,000'
      },
      timeline: [
        { date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), title: 'AI Vision Classification', note: `${confidencePercent}% ${breed.name} biometric match confirmed` }
      ]
    };

    savePassport(newAnimalRecord);
    setShowCreatePassportModal(false);
    navigate(`/digital-passport/${newAnimalRecord.id}`);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackVerdict) return;
    setFeedbackSubmitted(true);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAskAgent = async (promptText) => {
    const query = (promptText || agentQuery || '').trim();
    if (!query || agentLoading) return;
    setAgentLoading(true);
    setAgentQuery('');

    const userApiKey = localStorage.getItem('bovine_gemini_key') || localStorage.getItem('gemini_api_key') || '';
    let replyText = '';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': userApiKey
        },
        body: JSON.stringify({
          message: query,
          breed_name: breed.name,
          api_key: userApiKey
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        replyText = data?.reply;
      }
    } catch (err) {
      console.warn('Agent chat error:', err);
    }

    if (!replyText) {
      replyText = `### 🐄 BREEDIFY AI Agent Advisory for ${breed.name}:\n\nRegarding your question on **"${query}"**:\n• **Nutrition**: Maintain a balanced ration with 60% green succulent fodder and 40% chopped dry straw, supplemented by 50g chelated mineral mix.\n• **Health Monitoring**: Regular body temperature check (normal: 101.5°F–102.5°F) and seasonal vaccination against FMD and HS.\n• **Veterinary Note**: For clinical symptoms or acute emergencies, consult your local registered veterinary doctor.`;
    }

    const newEntry = { q: query, a: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setAgentAnswer(newEntry);
    setAgentHistory(prev => [newEntry, ...prev]);
    setAgentLoading(false);
  };

  const handleExportPDF = () => {
    try {
      const fileName = exportScanToPDF({
        scanData: resolvedScanData,
        breed,
        ownerInfo,
        geotag,
        animalImage,
        estimatedAgeRange,
        confidencePercent,
        detectedSpecies
      });
      showToast(`Biometric Passport ${fileName} downloaded! 📄📥`);
    } catch (err) {
      console.error('PDF export failed, printing fallback:', err);
      window.print();
      showToast(`Printing / saving Biometric Passport #${resolvedScanData.scan_id}`);
    }
  };

  const handleSaveTransfer = (e) => {
    e.preventDefault();
    if (!newOwnerName.trim()) return;
    const updatedOwner = {
      name: newOwnerName.trim(),
      mobile: newOwnerMobile.trim() || ownerInfo.mobile,
      location: newOwnerLocation.trim() || ownerInfo.location
    };
    setOwnerInfo(updatedOwner);
    setShowTransferModal(false);
    setNewOwnerName('');
    setNewOwnerMobile('');
    setNewOwnerLocation('');
    showToast(`Legal Ownership transferred to ${updatedOwner.name}! 🤝✅`);
  };

  const handleSaveGeotag = (e) => {
    e.preventDefault();
    setGeotag(prev => ({
      ...prev,
      location_tag: customLocTag.trim() || prev.location_tag,
      latitude: parseFloat(customLat) || prev.latitude,
      longitude: parseFloat(customLon) || prev.longitude
    }));
    setShowGeotagModal(false);
    showToast(`Geotag updated to ${customLocTag || geotag.location_tag}! 📍💾`);
  };

  const handleUseLiveGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCustomLat(pos.coords.latitude.toFixed(4));
          setCustomLon(pos.coords.longitude.toFixed(4));
          showToast(`Acquired live GPS: ${pos.coords.latitude.toFixed(4)}°N, ${pos.coords.longitude.toFixed(4)}°E 🛰️`);
        },
        (err) => {
          console.warn('GPS error:', err);
          showToast('Could not access live GPS. Using manual coordinates.');
        }
      );
    } else {
      showToast('Geolocation not supported on this device.');
    }
  };

  const handleOpenInsuranceModal = (insuranceItem) => {
    setApplyingItem(insuranceItem);
    setApplyType('insurance');
  };

  const handleSubmitInsurance = (e) => {
    e.preventDefault();
    const policyRef = `POL-${Math.floor(100000 + Math.random() * 900000)}`;
    const appliedName = applyingItem?.name || 'Livestock Insurance';
    setApplyingItem(null);
    showToast(`Applied for ${appliedName}! Policy Ref #${policyRef} 🛡️✨`);
  };

  const handleOpenSchemeModal = (schemeItem) => {
    setApplyingItem(schemeItem);
    setApplyType('scheme');
  };

  const handleSubmitScheme = (e) => {
    e.preventDefault();
    const schemeRef = `SCH-${Math.floor(100000 + Math.random() * 900000)}`;
    const appliedName = applyingItem?.name || 'Government Scheme';
    setApplyingItem(null);
    showToast(`Enrolled in ${appliedName}! Scheme Ref #${schemeRef} 🏛️💰`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 text-[#2A2A28]">

      {/* FLOATING NOTIFICATION TOAST */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#324E38] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 animate-in fade-in slide-in-from-top-4 max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* LOW CONFIDENCE WARNING ALERT (Specification 2) */}
      {isLowConfidence && !dismissLowConfidence && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h3 className="font-editorial font-bold text-base text-amber-900">
                Low Confidence Detection ({confidencePercent}%) — Unclear Angle or Lighting
              </h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                The AI model could not confidently identify this breed standard with high certainty. For legal passport registration, please upload a clearer side-profile image in natural lighting.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200">
            <Link
              to="/scanner"
              className="px-4 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors group"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Retake / Upload Clearer Photo</span>
              <Sticker>📸</Sticker>
            </Link>

            <button
              onClick={handleOpenCreatePassport}
              className="px-4 py-2 rounded-full bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors cursor-pointer flex items-center group"
            >
              <span>Enter Passport Manually</span>
              <Sticker variant="dark">✍️</Sticker>
            </button>

            <button
              onClick={() => setDismissLowConfidence(true)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-amber-800 hover:underline cursor-pointer flex items-center group"
            >
              <span>Continue Anyway</span>
              <Sticker variant="accent">➡️</Sticker>
            </button>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="bg-[#F4EDE0] p-5 sm:p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
        {/* TOP ROW: Animal Information & Validation Status */}
        <div className="space-y-2.5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D96B43] bg-[#F5EBE1] px-2.5 py-0.5 rounded-full">
                {t('result.aiResultNumber', 'AI VISION RESULT #')}{resolvedScanData.scan_id}
              </span>
              <span className="text-xs text-[#7A7A70]">· {t('result.generatedOn', 'Generated')} {new Date().toLocaleDateString()}</span>
            </div>

            {/* Species, Breed Title & High-Confidence Pill */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-lg font-bold px-3 py-1 rounded-xl bg-[#F7F3EA] text-[#324E38] border border-[#DFD3BF] flex items-center gap-1.5">
                {isBuffalo ? t('result.buffaloShort', '🐃 Buffalo') : t('result.cattleShort', '🐄 Cattle')}
              </span>

              <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-[#2A2A28]">
                {isLowConfidence && !dismissLowConfidence ? 'Mixed / Unconfirmed Breed' : (activeBreedName || breed.name || 'Identified Breed')}
              </h1>

              {breed.hindi_name && (
                <span className="text-base font-semibold text-[#7A7A70]">
                  ({breed.hindi_name})
                </span>
              )}

              <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs border ${
                isLowConfidence
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {confidencePercent}% {t('result.aiMatch', 'AI Match')}
              </span>

              {hitlStatus === 'confirmed' && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {t('result.hitlVerified', 'HITL Verified')}
                </span>
              )}
              {hitlStatus === 'corrected' && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  {t('result.expertCorrected', 'Expert Corrected')}
                </span>
              )}
            </div>

          <div className="text-xs text-[#7A7A70] mt-1.5 flex flex-wrap items-center gap-3">
            <span>{t('result.scientific', 'Scientific:')} <strong className="text-[#2A2A28] italic">{breed.species || (isBuffalo ? 'Bubalus bubalis' : 'Bos indicus')}</strong></span>
            <span>{t('result.origin', 'Origin:')} <strong className="text-[#2A2A28]">{breed.origin || 'India'}</strong></span>
            <button
              onClick={() => setShowGeotagModal(true)}
              className="bg-[#F4EDE0] border border-[#DFD3BF] text-[#D96B43] hover:bg-[#F5EBE1] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 transition-colors cursor-pointer group"
            >
              <MapPin className="w-3 h-3" />
              <span>{geotag.location_tag}</span>
              <Edit3 className="w-2.5 h-2.5 ml-0.5 opacity-60" />
              <Sticker variant="accent">📍</Sticker>
            </button>

            {/* Compact Sleek Status Badge for Non-Vet Roles (Farmer & Dairy Operator) */}
            {!isVet && (
              <div
                title="HITL breed override and clinical validation is restricted to authorized Veterinary Officers (ICAR / DAHD). As a Dairy Farmer / Operator, this record is queued for expert review."
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE5D6] hover:bg-[#E5DCB9] border border-[#DFD3BF] text-xs transition-colors shadow-2xs cursor-default"
              >
                {hitlStatus === 'confirmed' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-bold text-[#2A2A28]">
                      {t('result.clinicallyValidated', 'Clinically Validated by Vet')}
                    </span>
                    <span className="text-[10px] text-emerald-700 hidden sm:inline">
                      · {validatorRole || 'ICAR Specialist'}
                    </span>
                  </>
                ) : hitlStatus === 'corrected' ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-bold text-[#2A2A28]">
                      {t('result.expertCorrected', 'Expert Corrected')} ({activeBreedName})
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#324E38] shrink-0" />
                    <span className="font-bold text-[#2A2A28]">
                      {t('result.awaitingVetReviewShort', 'Awaiting Vet Validation')}
                    </span>
                    <span className="text-[10px] text-[#7A7A70] hidden sm:inline">
                      · {t('result.hitlQueuedNotice', 'Queued for ICAR review')}
                    </span>
                  </>
                )}
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#F4EDE0] text-[#7A7A70] border border-[#DFD3BF]">
                  {userRole === 'vendor' ? 'Vendor' : 'Farmer'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* HUMAN-IN-THE-LOOP (HITL) VALIDATION BAR (For Veterinary Doctors Only) */}
        {isVet && (
          <div className="pt-3 border-t border-[#EDE7DA] space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#2A2A28] block">
                      {t('result.hitlTitle', 'Human-in-the-Loop (HITL) Validation')}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#324E38] text-white">
                      {t('result.vetAccessOnly', 'Veterinary Doctor Portal Only')}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#7A7A70]">
                    {t('result.hitlSubtitle', 'Field validation & feedback loop for AI retraining')}
                  </span>
                </div>
              </div>

              {/* Validation Status Badge */}
              {hitlStatus === 'confirmed' ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {t('result.confirmedBy', 'Confirmed by')} {validatorRole}
                </span>
              ) : hitlStatus === 'corrected' ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {t('result.overriddenTo', 'Overridden to')} {activeBreedName}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-300">
                  {t('result.awaitingValidation', 'Awaiting Expert Validation')}
                </span>
              )}
            </div>

            {/* Action Buttons if Unvalidated */}
            {hitlStatus === 'unvalidated' && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-[#5A5A50]">
                  {t('result.isAccurateQuestion', 'Is this animal accurately identified as')} <strong>{activeBreedName || breed.name}</strong>?
                </span>
                <button
                  onClick={handleConfirmBreed}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer group"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('result.confirmBreed', '✓ Confirm Breed')}</span>
                  <Sticker>✅🎖️</Sticker>
                </button>
                <button
                  onClick={() => setShowCorrectionForm(!showCorrectionForm)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-50 text-[#D96B43] border border-[#D96B43] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer group"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t('result.correctBreed', 'Correct Breed')}</span>
                  <Sticker variant="accent">✏️🔍</Sticker>
                </button>
              </div>
            )}

            {/* Verified Feedback Message */}
            {hitlStatus !== 'unvalidated' && (
              <div className="p-3 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  {hitlStatus === 'confirmed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span className="text-[#2A2A28]">
                    {hitlStatus === 'confirmed' ? (
                      <>Validated as <strong>{activeBreedName}</strong> by {validatorRole}. Confidence locked for digital passport creation.</>
                    ) : (
                      <>Prediction corrected from <em>{originalBreedName}</em> to <strong>{activeBreedName}</strong> by {validatorRole}.</>
                    )}
                  </span>
                </div>
                <button
                  onClick={handleResetValidation}
                  className="text-[11px] text-[#7A7A70] hover:text-[#D96B43] font-semibold underline shrink-0 cursor-pointer flex items-center group"
                >
                  <span>Re-evaluate</span>
                  <Sticker variant="accent">🔄</Sticker>
                </button>
              </div>
            )}

            {/* Correction Form Drawer */}
            {showCorrectionForm && hitlStatus === 'unvalidated' && (
              <form onSubmit={handleApplyCorrection} className="p-4 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-[#2A2A28] block mb-1">Select Correct Breed:</label>
                    <select
                      value={selectedBreedCorrection}
                      onChange={(e) => setSelectedBreedCorrection(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#DFD3BF] bg-white text-xs font-semibold text-[#2A2A28] focus:outline-none focus:border-[#D96B43]"
                      required
                    >
                      <option value="">-- Choose Verified Breed --</option>
                      <optgroup label="Cattle Breeds">
                        {CATTLE_BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                      </optgroup>
                      <optgroup label="Buffalo Breeds">
                        {BUFFALO_BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#2A2A28] block mb-1">Validator Role:</label>
                    <select
                      value={validatorRole}
                      onChange={(e) => setValidatorRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#DFD3BF] bg-white text-xs font-semibold text-[#2A2A28]"
                    >
                      <option value="Veterinary Officer">Veterinary Officer</option>
                      <option value="Senior Veterinary Surgeon">Senior Veterinary Surgeon</option>
                      <option value="ICAR Livestock Specialist">ICAR Livestock Specialist</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#2A2A28] block mb-1 text-xs">Morphological Observation Notes (Optional):</label>
                  <input
                    type="text"
                    placeholder="e.g. Ear drooping angle, convex forehead curvature, and dewlap size indicate Gir traits"
                    value={validationNotes}
                    onChange={(e) => setValidationNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFD3BF] bg-white text-xs text-[#2A2A28] focus:outline-none focus:border-[#D96B43]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCorrectionForm(false)}
                    className="px-3.5 py-1.5 rounded-xl border border-[#DFD3BF] bg-white text-xs text-[#7A7A70] hover:bg-neutral-50 cursor-pointer flex items-center group"
                  >
                    <span>Cancel</span>
                    <Sticker variant="dark">❌</Sticker>
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center group"
                  >
                    <span>Apply & Submit Validation</span>
                    <Sticker>💾✨</Sticker>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Action Toolbar with PROMINENT "Create Digital Passport" BUTTON */}
        <div className="pt-3 border-t border-[#EDE7DA] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {isVet ? (
              <button
                onClick={handleOpenCreatePassport}
                className="px-5 py-2.5 rounded-full bg-[#D96B43] hover:bg-[#C25832] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer group"
              >
                <FileText className="w-4 h-4" />
                <span>{t('result.createDigitalPassport', 'Create Digital Passport')}</span>
                <Sticker>📋✨</Sticker>
              </button>
            ) : (
              <button
                onClick={() => showToast(t('passport.vetOnlyNotice', '🔒 Official Passport creation is restricted to registered Veterinary Doctors. Please consult your local veterinary hospital.'))}
                className="px-4 py-2.5 rounded-full bg-[#FAF5EB] hover:bg-[#F7F3EA] text-[#7A7A70] border border-[#DFD3BF] text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer group transition-all"
                title={t('passport.vetOnlyNotice', '🔒 Official Passport creation is restricted to registered Veterinary Doctors.')}
              >
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>{t('result.createDigitalPassport', 'Create Digital Passport')}</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold ml-1 border border-amber-300">
                  {t('passport.vetOnlyBadge', 'Vet Only')}
                </span>
              </button>
            )}

            <button
              onClick={() => {
                const el = document.getElementById('breedify-ai-agent-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else navigate('/assistant', { state: { breedName: breed.name } });
              }}
              className="px-4 py-2.5 rounded-full bg-[#324E38] hover:bg-[#253D2A] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer group"
            >
              <Bot className="w-4 h-4 text-[#D96B43]" />
              <span>{t('result.askAiAgent', 'Ask AI Agent')}</span>
              <Sticker>🤖💬</Sticker>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2.5 rounded-full bg-[#F4EDE0] hover:bg-[#F7F3EA] text-[#2A2A28] text-xs font-bold border border-[#DFD3BF] flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <Download className="w-3.5 h-3.5 text-[#7A7A70]" />
              <span>{t('result.exportPdf', 'Extract as PDF')}</span>
              <Sticker variant="dark">📄📥</Sticker>
            </button>

            <Link
              to="/scanner"
              className="px-3.5 py-2.5 rounded-full bg-[#F4EDE0] hover:bg-[#F7F3EA] text-[#7A7A70] hover:text-[#2A2A28] text-xs font-bold border border-[#DFD3BF] transition-colors flex items-center gap-1.5 group"
              title="New Scan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('result.newScan', 'New Scan')}</span>
              <Sticker variant="dark">📸🔄</Sticker>
            </Link>
          </div>
        </div>
      </div>

      {/* HERO SECTION: USER'S UPLOADED PHOTO + 4 KEY METRIC VITALS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT 5 COLS: User's Uploaded Photo Display & Biometrics */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Photo Showcase Container */}
          <div className="bg-[#F4EDE0] p-4 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7A7A70] flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-[#D96B43]" />
                {t('result.biometricVerification', 'BIOMETRIC IMAGE VERIFICATION')}
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                {t('result.tagHud', 'TAG:')} {resolvedScanData.scan_id}
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-black border border-[#DFD3BF] group">
              <img
                src={animalImage}
                alt="Scanned Bovine"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = breed.id ? `/breeds/${breed.id}.jpg` : '/breeds/gir.jpg';
                }}
                className="w-full h-full object-cover"
              />

              {/* AI Bounding Box HUD Overlay */}
              <div className="absolute inset-4 border-2 border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                <div className="flex justify-between items-start">
                  <span className="bg-emerald-600 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow">
                    ✓ {detectedSpecies} Confirmed ({confidencePercent}%)
                  </span>
                  <span className="bg-black/70 text-white text-[9px] font-mono px-2 py-0.5 rounded">
                    {t('result.fovFullBody', 'FOV: Full Body')}
                  </span>
                </div>
                <div className="flex justify-between items-end text-[9px] font-mono text-white/90">
                  <span className="bg-black/60 px-1.5 py-0.5 rounded">
                    LAT: {geotag.latitude?.toFixed(2)}° N
                  </span>
                  <span className="bg-black/60 px-1.5 py-0.5 rounded">
                    LON: {geotag.longitude?.toFixed(2)}° E
                  </span>
                </div>
              </div>

              {/* Geotag HUD badge */}
              <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full font-mono flex items-center gap-1 border border-white/20">
                <MapPin className="w-3 h-3 text-[#D96B43]" />
                <span className="truncate max-w-[200px]">{geotag.location_tag}</span>
              </div>

              {/* Face/Muzzle Picture-in-Picture if provided */}
              {faceImage && (
                <div className="absolute top-2 right-2 w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                  <img src={faceImage} alt="Muzzle Close-Up" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] text-center font-bold">
                    Muzzle
                  </span>
                </div>
              )}
            </div>

            {/* Key Physical Traits checklist */}
            {breed.key_features && Array.isArray(breed.key_features) && breed.key_features.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] font-extrabold text-[#7A7A70] uppercase block mb-1.5">
                  {t('result.distinguishingMarkers', 'Distinguishing Morphological Markers:')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {breed.key_features.map((feat, i) => (
                    <span key={i} className="text-xs bg-[#F7F3EA] text-[#324E38] px-2.5 py-1 rounded-lg border border-[#DFD3BF] font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#D96B43]" /> {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ANIMAL OWNER RECORD */}
          <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-3">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-2">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#D96B43]" />
                <span className="text-xs font-bold text-[#2A2A28]">{t('result.legalOwner', 'LEGAL LIVESTOCK OWNER')}</span>
              </div>
              <button
                onClick={() => setShowTransferModal(true)}
                className="text-[10px] font-bold text-[#D96B43] bg-[#F5EBE1] hover:bg-[#EBDCD0] px-3 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer group"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{t('result.transferOwnership', 'Transfer Ownership')}</span>
                <Sticker variant="accent">🤝</Sticker>
              </button>
            </div>

            <div className="text-xs space-y-1 text-[#2A2A28]">
              <div>{t('result.currentOwner', 'Current Owner:')} <strong className="font-bold">{ownerInfo.name}</strong></div>
              <div>{t('result.contactMobile', 'Contact Mobile:')} <span className="font-semibold text-[#5A5A50]">{ownerInfo.mobile}</span></div>
              <div>{t('result.holdingLocation', 'Holding Location:')} <span className="text-[#5A5A50]">{ownerInfo.location}</span></div>
            </div>
          </div>

        </div>

        {/* RIGHT 7 COLS: 4 Key Executive Vitals & Overview */}
        <div className="lg:col-span-7 space-y-5">

          {/* 5 HIGH-IMPACT KPI STATS INCLUDING ESTIMATED AGE RANGE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* 1. Daily Milk Yield */}
            <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-2 hover:border-[#D96B43] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#D96B43]">
                  <Droplets className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{t('result.dailyMilkProductivity', 'DAILY MILK PRODUCTIVITY')}</span>
                </div>
                <span className="text-[10px] font-bold bg-[#F5EBE1] text-[#D96B43] px-2 py-0.5 rounded-full">
                  Standard
                </span>
              </div>
              <div className="text-2xl font-editorial font-bold text-[#2A2A28]">
                {breed.avg_milk_yield || '14 - 18 L/day'}
              </div>
              <div className="text-xs text-[#7A7A70] flex items-center justify-between pt-1 border-t border-[#EDE7DA]">
                <span>Butterfat: <strong>{isBuffalo ? '7.0% - 8.5%' : '4.5% - 5.2%'}</strong></span>
                <span>SNF: <strong>8.8%+</strong></span>
              </div>
            </div>

            {/* 2. Visual AI Estimated Age Range */}
            <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-2 hover:border-[#D96B43] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#D96B43]">
                  <Hourglass className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{t('result.estimatedAgeRange', 'ESTIMATED AGE RANGE')}</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {ageConfidence}% {t('result.ageConfidence', 'Confidence')}
                </span>
              </div>
              <div className="text-2xl font-editorial font-bold text-[#2A2A28]">
                {estimatedAgeRange}
              </div>
              <div className="text-xs text-[#7A7A70] flex items-center justify-between pt-1 border-t border-[#EDE7DA]">
                <span>{t('result.hornRingAnalysis', 'Horn Rings')}: <strong>2+ Rings</strong></span>
                <span>{t('result.dentitionMuzzle', 'Dentition')}: <strong>Full Adult</strong></span>
              </div>
            </div>

            {/* 3. Market Valuation */}
            <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-2 hover:border-[#324E38] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#324E38]">
                  <IndianRupee className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{t('result.marketValuation', 'MARKET VALUATION')}</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full">
                  {t('result.mandiBenchmark', 'Mandi Benchmark')}
                </span>
              </div>
              <div className="text-2xl font-editorial font-bold text-[#2A2A28]">
                {breed.cost_range || '₹75,000 - ₹1,20,000'}
              </div>
              <div className="text-xs text-[#7A7A70] pt-1 border-t border-[#EDE7DA]">
                {t('result.valuationSubtitle', 'Fair market valuation based on lactation cycle & pure pedigree')}
              </div>
            </div>

            {/* 4. Lactation Period */}
            <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-2 hover:border-purple-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-purple-700">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{t('result.lactationCycle', 'LACTATION CYCLE')}</span>
                </div>
                <span className="text-[10px] font-bold bg-purple-50 text-purple-800 px-2 py-0.5 rounded-full">
                  Annual
                </span>
              </div>
              <div className="text-2xl font-editorial font-bold text-[#2A2A28]">
                {breed.lactation_period || '300 - 325 Days'}
              </div>
              <div className="text-xs text-[#7A7A70] pt-1 border-t border-[#EDE7DA]">
                {t('result.lactationSubtitle', 'Inter-calving interval: ~12-14 months')}
              </div>
            </div>

            {/* 5. Climate Resilience */}
            <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-2 hover:border-amber-600 transition-colors sm:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-600">
                  <SunMedium className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{t('result.climateResilience', 'CLIMATE RESILIENCE')}</span>
                </div>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full">
                  Tropical Zone
                </span>
              </div>
              <div className="text-xl font-editorial font-bold text-[#2A2A28] truncate">
                {breed.ideal_temp_range?.split('(')[0] || '15°C - 46°C'}
              </div>
              <div className="text-xs text-[#7A7A70] pt-1 border-t border-[#EDE7DA]">
                {t('result.climateSubtitle', 'Native tropical heat and pest tolerance: High')}
              </div>
            </div>

          </div>

          {/* VISUAL AGE & MORPHOLOGICAL BIOMETRIC ANALYSIS PANEL */}
          <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EDE7DA] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#F5EBE1] text-[#D96B43] flex items-center justify-center font-bold">
                  <Hourglass className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-editorial font-bold text-sm text-[#2A2A28]">
                    {t('result.visualAgeAnalysis', 'Visual Age & Biometric Analysis')}
                  </h3>
                  <p className="text-[10px] text-[#7A7A70]">
                    {t('result.visualAgeSubtitle', 'Biometric age estimation derived from horn ring ridges, dentition wear, dewlap fold development, and body maturity in the uploaded image.')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-[#324E38] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  {estimatedAgeRange}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#5A5A50] leading-relaxed bg-white/70 p-3.5 rounded-2xl border border-[#DFD3BF]">
              {ageNarrative}
            </p>

            {/* Visual Markers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {ageIndicators.map((ind, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-[#F7F3EA] p-3 rounded-xl border border-[#DFD3BF] text-xs text-[#2A2A28]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{ind}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Breed Overview & Narrative Description */}
          <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-3">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#7A7A70]">
                {t('result.geneticProfile', 'GENETIC PROFILE & CHARACTERISTICS')}
              </span>
              <span className="text-xs font-bold text-[#324E38] bg-[#F7F3EA] px-3 py-0.5 rounded-full border border-[#DFD3BF]">
                {t('result.icarCertified', 'ICAR Certified Breed Standard')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#5A5A50] leading-relaxed">
              {breed.description || 'Superior indigenous dairy breed exhibiting exemplary milk fat solids, remarkable longevity, and natural tolerance against tropical pests.'}
            </p>
          </div>

        </div>

      </div>

      {/* DEEP-DIVE TABS */}
      <div className="bg-[#F4EDE0] rounded-3xl border border-[#DFD3BF] shadow-soft overflow-hidden">
        
        {/* Tab Navigation */}
        <div className="flex border-b border-[#EDE7DA] overflow-x-auto bg-[#EDE5D6]">
          {[
            { id: 'heritage', label: t('result.tabHeritage', 'Heritage & Fodder Ration'), icon: Utensils, sticker: '🌿' },
            { id: 'health', label: t('result.tabHealth', 'Preventative Health & Vaccines'), icon: HeartPulse, sticker: '🩺' },
            { id: 'insurance', label: t('result.tabInsurance', 'Livestock Insurance Plans'), icon: ShieldCheck, sticker: '🛡️' },
            { id: 'schemes', label: t('result.tabSchemes', 'Government Subsidies & Loans'), icon: Building2, sticker: '🏛️' },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer group ${
                  isActive
                    ? 'border-[#D96B43] text-[#D96B43] bg-[#F4EDE0]'
                    : 'border-transparent text-[#7A7A70] hover:text-[#2A2A28] hover:bg-[#F7F3EA]'
                }`}
              >
                <IconComp className="w-4 h-4" />
                <span>{tab.label}</span>
                <Sticker variant={isActive ? 'accent' : 'dark'}>{tab.sticker}</Sticker>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div className="p-6 md:p-8">

          {/* TAB 1: HERITAGE & FEEDING */}
          {activeTab === 'heritage' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-editorial font-bold text-lg text-[#2A2A28]">
                    Scientific Fodder & Feed Ration for {breed.name}
                  </h3>
                  <p className="text-xs text-[#7A7A70]">Standardized nutrition balancing by ICAR Dairy Research Institute</p>
                </div>
              </div>

              <div className="bg-[#F4EDE0] p-5 rounded-2xl border border-[#DFD3BF] space-y-3">
                <div className="flex items-center gap-2 text-[#324E38] font-bold text-xs">
                  <Utensils className="w-4 h-4 text-[#D96B43]" />
                  <span>Daily Feed Distribution (Body Weight ~450–550 kg):</span>
                </div>
                <p className="text-xs text-[#2A2A28] leading-relaxed bg-white p-3.5 rounded-xl border border-[#DFD3BF]">
                  {breed.feeding_notes || 'Green fodder (Berseem, Napier) 20-25 kg/day, dry fodder 4-5 kg/day, concentrate 3-4 kg/day with 50g mineral mixture.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: HEALTH & VACCINES */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-editorial font-bold text-lg text-[#2A2A28]">
                    Disease Susceptibility & Vaccination Timeline
                  </h3>
                  <p className="text-xs text-[#7A7A70]">Preventative veterinary care schedule for {breed.name}</p>
                </div>
                <Link
                  to="/health"
                  className="px-4 py-2 rounded-full bg-[#324E38] hover:bg-[#253D2A] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm group"
                >
                  <HeartPulse className="w-3.5 h-3.5 text-[#D96B43]" />
                  <span>Run Symptom Checker</span>
                  <Sticker>🩺⚡</Sticker>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {[
                  { name: 'FMD (Foot & Mouth)', schedule: 'Bi-annually (May & Nov)', target: 'All Cattle & Buffaloes', status: 'Due Soon (Nov 2026)', color: 'bg-amber-100 text-amber-800' },
                  { name: 'HS (Haemorrhagic Septicaemia)', schedule: 'Annually (May pre-monsoon)', target: 'Critical for Buffaloes', status: 'Up to Date', color: 'bg-emerald-100 text-emerald-800' },
                  { name: 'BQ (Black Quarter)', schedule: 'Annually (April/May)', target: 'Calves >6 months', status: 'Recommended', color: 'bg-emerald-100 text-emerald-800' }
                ].map((vac, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2A2A28]">{vac.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${vac.color}`}>
                        {vac.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5A5A50]">Schedule: {vac.schedule}</p>
                    <p className="text-[10px] text-[#7A7A70]">Target: {vac.target}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: INSURANCE COVERAGE */}
          {activeTab === 'insurance' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-editorial font-bold text-lg text-[#2A2A28]">
                  Subsidized Livestock Insurance Plans for {breed.name}
                </h3>
                <p className="text-xs text-[#7A7A70]">Protect against accidental mortality, epidemic outbreaks, and transit risks</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(resolvedScanData.insurance_providers || []).map((ins) => (
                  <div key={ins.id} className="p-5 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-[#D96B43] bg-[#F5EBE1] px-2 py-0.5 rounded-full">
                          {ins.premium_rate}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Max Cover: {ins.coverage_amount}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#2A2A28]">{ins.name}</h4>
                      <p className="text-[11px] text-[#7A7A70] leading-relaxed">{ins.terms}</p>
                    </div>

                    <button
                      onClick={() => handleOpenInsuranceModal(ins)}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-[#324E38] hover:bg-[#253D2A] text-white text-xs font-bold flex items-center justify-between shadow-xs transition-transform active:scale-98 cursor-pointer group"
                    >
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Apply for Insurance
                      </span>
                      <Sticker>🛡️📝</Sticker>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LOANS & SUBSIDIES */}
          {activeTab === 'schemes' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-editorial font-bold text-lg text-[#2A2A28]">
                  Central & State Government Subsidies for {breed.name}
                </h3>
                <p className="text-xs text-[#7A7A70]">Pre-filled application using this AI Biometric Passport</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(resolvedScanData.schemes || []).map((sch) => (
                  <div key={sch.id} className="p-5 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-[#324E38] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block">
                          {sch.type}
                        </span>
                        <span className="text-[10px] font-bold text-[#D96B43] bg-[#F5EBE1] px-2 py-0.5 rounded-full">
                          Support: {sch.amount_range}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#2A2A28]">{sch.name}</h4>
                      <p className="text-[11px] text-[#7A7A70] leading-relaxed">{sch.eligibility}</p>
                    </div>

                    <button
                      onClick={() => handleOpenSchemeModal(sch)}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white text-xs font-bold flex items-center justify-between shadow-xs transition-transform active:scale-98 cursor-pointer group"
                    >
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-white" />
                        Claim Subsidy / Apply
                      </span>
                      <Sticker>🏛️💰</Sticker>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* BREEDIFY AI LIVESTOCK AGENT INTERACTIVE CARD */}
      <div id="breedify-ai-agent-section" className="bg-[#F4EDE0] p-6 sm:p-8 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-5 scroll-mt-6">
        
        {/* Agent Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EDE7DA] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#324E38] text-white flex items-center justify-center shadow-md shrink-0">
              <Bot className="w-5 h-5 text-[#E8A97D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-editorial font-bold text-lg sm:text-xl text-[#2A2A28]">
                  BREEDIFY AI Agent
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Expert
                </span>
              </div>
              <p className="text-xs text-[#7A7A70]">
                Ask any clinical, feeding, breeding, or government scheme question for this <strong className="text-[#324E38]">{breed.name}</strong>
              </p>
            </div>
          </div>

          <Link
            to="/assistant"
            state={{ breedName: breed.name }}
            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-50 text-[#324E38] border border-[#DFD3BF] text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-center shadow-2xs"
          >
            <span>Full Agent Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#D96B43]" />
          </Link>
        </div>

        {/* 1-Click Prompt Pills */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A7A70]">
            ⚡ Tap to ask instant questions:
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              `🥛 How to maximize milk yield & fat in ${breed.name}?`,
              `🌿 Balanced daily green and dry fodder ration?`,
              `🩺 How to detect and prevent mastitis early?`,
              `🐄 When is the exact right time for AI (am-pm rule)?`,
              `⚠️ What to do immediately if animal shows bloat?`,
              `💰 How to get Pashu KCC loan for ${breed.name}?`
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleAskAgent(p)}
                disabled={agentLoading}
                className="px-3.5 py-2 rounded-2xl bg-white/90 hover:bg-white text-[#2A2A28] hover:text-[#D96B43] border border-[#DFD3BF] text-xs font-medium transition-all shadow-2xs cursor-pointer text-left hover:-translate-y-0.5 active:scale-98 disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Live Question & Answer Display */}
        {agentLoading && (
          <div className="bg-white/80 p-5 rounded-2xl border border-[#DFD3BF] flex items-center gap-3 text-xs text-[#7A7A70] animate-pulse">
            <Loader2 className="w-5 h-5 text-[#D96B43] animate-spin shrink-0" />
            <span>Consulting BREEDIFY veterinary knowledge base & Gemini neural engine for {breed.name}...</span>
          </div>
        )}

        {agentAnswer && !agentLoading && (
          <div className="bg-white p-5 rounded-2xl border border-[#DFD3BF] shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#D96B43]">Farmer's Question:</span>
                <span className="text-xs font-semibold text-[#2A2A28]">"{agentAnswer.q}"</span>
              </div>
              <span className="text-[10px] text-[#7A7A70]">{agentAnswer.time}</span>
            </div>
            <div className="text-xs text-[#2A2A28] leading-relaxed whitespace-pre-line prose prose-sm max-w-none">
              {agentAnswer.a}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskAgent();
          }}
          className="flex items-center gap-2 pt-2"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={agentQuery}
              onChange={(e) => setAgentQuery(e.target.value)}
              placeholder={`Ask BREEDIFY AI Agent anything about ${breed.name} care, diet, diseases, prices...`}
              disabled={agentLoading}
              className="w-full bg-white border border-[#DFD3BF] rounded-2xl pl-4 pr-10 py-3 text-xs text-[#2A2A28] placeholder-[#A0A090] focus:outline-none focus:border-[#324E38] shadow-2xs"
            />
            {agentQuery && (
              <button
                type="button"
                onClick={() => setAgentQuery('')}
                className="absolute right-3.5 top-3 text-[#A0A090] hover:text-[#2A2A28]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!agentQuery.trim() || agentLoading}
            className="px-5 py-3 rounded-2xl bg-[#324E38] hover:bg-[#253D2A] disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer"
          >
            {agentLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Ask Agent</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

      </div>

      {/* HUMAN-IN-THE-LOOP (HITL) FARMER VERIFICATION CARD */}
      <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#D96B43]" />
            <div>
              <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                {t('result.farmerVerification', 'Farmer Verification & AI Quality Assurance')}
              </h3>
              <p className="text-xs text-[#7A7A70]">Help continuous machine learning calibration for Indian cattle and buffalo breeds</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#7A7A70]">HITL Protocol v1.4</span>
        </div>

        {feedbackSubmitted ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Thank you! Your verification feedback has been logged in the veterinary queue for model refinement.</span>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFeedbackVerdict('correct')}
                className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer group ${
                  feedbackVerdict === 'correct'
                    ? 'bg-[#324E38] text-white border-[#324E38] shadow-sm'
                    : 'bg-[#F4EDE0] text-[#2A2A28] border-[#DFD3BF] hover:bg-[#F7F3EA]'
                }`}
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Yes, Identified Breed ({breed.name}) is Correct</span>
                <Sticker variant={feedbackVerdict === 'correct' ? 'light' : 'dark'}>👍🌾</Sticker>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackVerdict('incorrect')}
                className={`py-3 px-4 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer group ${
                  feedbackVerdict === 'incorrect'
                    ? 'bg-red-700 text-white border-red-700 shadow-sm'
                    : 'bg-[#F4EDE0] text-[#2A2A28] border-[#DFD3BF] hover:bg-[#F7F3EA]'
                }`}
              >
                <X className="w-4 h-4 text-red-300" />
                <span>No, Different Breed / Mixed Crossbreed</span>
                <Sticker variant={feedbackVerdict === 'incorrect' ? 'light' : 'dark'}>👎❓</Sticker>
              </button>
            </div>

            {feedbackVerdict === 'incorrect' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={suggestedBreed}
                  onChange={(e) => setSuggestedBreed(e.target.value)}
                  className="bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2.5 text-xs text-[#2A2A28]"
                >
                  <option value="">Select Actual Indian Breed...</option>
                  <option value="Murrah Buffalo">Murrah Buffalo</option>
                  <option value="Gir Cow">Gir Cow</option>
                  <option value="Sahiwal Cow">Sahiwal Cow</option>
                  <option value="Jaffarabadi Buffalo">Jaffarabadi Buffalo</option>
                  <option value="Red Sindhi">Red Sindhi</option>
                  <option value="Tharparkar">Tharparkar</option>
                  <option value="Kankrej">Kankrej</option>
                  <option value="Mehsana Buffalo">Mehsana Buffalo</option>
                </select>

                <input
                  type="text"
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="Optional notes (horn curve, coat color)..."
                  className="bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2.5 text-xs text-[#2A2A28]"
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!feedbackVerdict}
                className="bg-[#D96B43] hover:bg-[#C25832] disabled:opacity-40 text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center group"
              >
                <span>Submit Verification</span>
                <Sticker>🚀</Sticker>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* CREATE DIGITAL PASSPORT MODAL (Connected directly to passportStorage) */}
      {showCreatePassportModal && passportForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F8F3EA] rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#DFD3BF] shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2 text-[#D96B43]">
                <FileText className="w-5 h-5" />
                <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                  {t('passport.createPassportModalTitle', 'Create Digital Animal Passport')}
                </h3>
              </div>
              <button
                onClick={() => setShowCreatePassportModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F3EA] hover:bg-[#EDE7DA] flex items-center justify-center text-[#7A7A70]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Confirmation Notice */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-3 text-xs">
              <img src={passportForm.photo} alt="Thumbnail" className="w-14 h-12 rounded-xl object-cover border border-emerald-300 shrink-0" />
              <div>
                <span className="font-bold text-emerald-900 block">
                  ✓ AI Detected: {passportForm.species} · {passportForm.breed}
                </span>
                <span className="text-[11px] text-emerald-700">
                  Confidence: {passportForm.confidence}% match · Photo automatically attached
                </span>
              </div>
            </div>

            <form onSubmit={handleSavePassport} className="space-y-3 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Passport ID</label>
                  <input
                    type="text"
                    readOnly
                    value={passportForm.id}
                    className="w-full bg-[#F7F3EA] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#5A5A50] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">INAPH Ear Tag</label>
                  <input
                    type="text"
                    required
                    value={passportForm.tagNumber}
                    onChange={(e) => setPassportForm(prev => ({ ...prev, tagNumber: e.target.value }))}
                    className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28] font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Gender</label>
                  <select
                    value={passportForm.gender}
                    onChange={(e) => setPassportForm(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28]"
                  >
                    <option value="Female">♀ Female</option>
                    <option value="Male">♂ Male</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Estimated Age</label>
                  <input
                    type="text"
                    value={passportForm.age}
                    onChange={(e) => setPassportForm(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={passportForm.ownerName}
                    onChange={(e) => setPassportForm(prev => ({ ...prev, ownerName: e.target.value }))}
                    className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Owner Mobile</label>
                  <input
                    type="text"
                    required
                    value={passportForm.ownerMobile}
                    onChange={(e) => setPassportForm(prev => ({ ...prev, ownerMobile: e.target.value }))}
                    className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Holding Location (Village / Mandi)</label>
                <input
                  type="text"
                  value={passportForm.location}
                  onChange={(e) => setPassportForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28]"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePassportModal(false)}
                  className="flex-1 bg-[#F4EDE0] border border-[#DFD3BF] py-2.5 rounded-xl font-bold text-xs text-[#7A7A70] flex items-center justify-center group cursor-pointer"
                >
                  <span>Cancel</span>
                  <Sticker variant="dark">❌</Sticker>
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#D96B43] hover:bg-[#C25832] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center group"
                >
                  <span>{t('passport.confirmCreate', 'Save & Generate Passport')}</span>
                  <Sticker>💾🎉</Sticker>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* TRANSFER OWNERSHIP MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F8F3EA] rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#DFD3BF] shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2 text-[#D96B43]">
                <RefreshCw className="w-5 h-5" />
                <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                  Transfer Legal Ownership
                </h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F3EA] hover:bg-[#EDE7DA] flex items-center justify-center text-[#7A7A70] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7A7A70] leading-relaxed">
              Transfer legal title and biometric registry of this animal to a new owner (sale, cooperative, or inheritance).
            </p>

            <form onSubmit={handleSaveTransfer} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">New Owner Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suresh Bhai Patel"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28] font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">New Owner Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98234 56789"
                  value={newOwnerMobile}
                  onChange={(e) => setNewOwnerMobile(e.target.value)}
                  className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28]"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">New Mandi / Holding Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mehsana Mandi, Gujarat"
                  value={newOwnerLocation}
                  onChange={(e) => setNewOwnerLocation(e.target.value)}
                  className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28]"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Transfer Reason</label>
                <select
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28]"
                >
                  <option value="Sale / Purchase">Commercial Sale / Purchase</option>
                  <option value="Mandi Auction">Mandi Livestock Auction</option>
                  <option value="Dairy Co-op Transfer">Dairy Cooperative Transfer</option>
                  <option value="Inheritance">Family Inheritance</option>
                  <option value="Gift">Gift / Donation</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 bg-[#F4EDE0] border border-[#DFD3BF] py-2.5 rounded-xl font-bold text-xs text-[#7A7A70] flex items-center justify-center group cursor-pointer"
                >
                  <span>Cancel</span>
                  <Sticker variant="dark">❌</Sticker>
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#D96B43] hover:bg-[#C25832] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center group"
                >
                  <span>Confirm Legal Transfer</span>
                  <Sticker>🤝✅</Sticker>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GEOTAG MODAL */}
      {showGeotagModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F8F3EA] rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#DFD3BF] shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2 text-[#D96B43]">
                <MapPin className="w-5 h-5" />
                <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                  Update GPS Geotag Record
                </h3>
              </div>
              <button
                onClick={() => setShowGeotagModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F3EA] hover:bg-[#EDE7DA] flex items-center justify-center text-[#7A7A70] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#7A7A70] leading-relaxed">
              Bind verified geographical coordinates for legal livestock census, animal traceability, and mandi subsidy verification.
            </p>

            <form onSubmit={handleSaveGeotag} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Village / Mandi / District Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand, Gujarat, India"
                  value={customLocTag}
                  onChange={(e) => setCustomLocTag(e.target.value)}
                  className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28] font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Latitude (° N)</label>
                  <input
                    type="text"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28] font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Longitude (° E)</label>
                  <input
                    type="text"
                    value={customLon}
                    onChange={(e) => setCustomLon(e.target.value)}
                    className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28] font-mono"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleUseLiveGPS}
                className="w-full py-2 rounded-xl bg-[#EDE5D6] hover:bg-[#E3D8C4] text-[#324E38] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer group"
              >
                <span>Detect Live GPS Coordinates</span>
                <Sticker variant="accent">🛰️📍</Sticker>
              </button>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowGeotagModal(false)}
                  className="flex-1 bg-[#F4EDE0] border border-[#DFD3BF] py-2.5 rounded-xl font-bold text-xs text-[#7A7A70] flex items-center justify-center group cursor-pointer"
                >
                  <span>Cancel</span>
                  <Sticker variant="dark">❌</Sticker>
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#D96B43] hover:bg-[#C25832] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center group"
                >
                  <span>Save Geotag</span>
                  <Sticker>📍💾</Sticker>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSURANCE / SCHEME APPLICATION MODAL */}
      {applyingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F8F3EA] rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#DFD3BF] shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2 text-[#D96B43]">
                {applyType === 'insurance' ? <ShieldCheck className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                  {applyType === 'insurance' ? 'Apply for Livestock Insurance' : 'Enroll in Government Scheme'}
                </h3>
              </div>
              <button
                onClick={() => setApplyingItem(null)}
                className="w-8 h-8 rounded-full bg-[#F7F3EA] hover:bg-[#EDE7DA] flex items-center justify-center text-[#7A7A70] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-[#2A2A28] space-y-1">
              <div className="font-bold text-emerald-900 text-sm">{applyingItem.name}</div>
              <div className="text-emerald-800">
                {applyType === 'insurance'
                  ? `Max Sum Insured: ${applyingItem.coverage_amount} · Rate: ${applyingItem.premium_rate}`
                  : `Subsidy Benefit: ${applyingItem.amount_range}`}
              </div>
            </div>

            <form
              onSubmit={applyType === 'insurance' ? handleSubmitInsurance : handleSubmitScheme}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Applicant Name</label>
                <input
                  type="text"
                  readOnly
                  value={ownerInfo.name}
                  className="w-full bg-[#F7F3EA] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#5A5A50] font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Registered Breed</label>
                  <input
                    type="text"
                    readOnly
                    value={activeBreedName || breed.name}
                    className="w-full bg-[#F7F3EA] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#5A5A50]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Biometric Tag ID</label>
                  <input
                    type="text"
                    readOnly
                    value={resolvedScanData.scan_id}
                    className="w-full bg-[#F7F3EA] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#5A5A50] font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#DFD3BF] text-[11px] text-[#5A5A50] flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  By submitting, your AI biometric passport, GPS geotag, and health history are automatically attached for priority digital verification.
                </span>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setApplyingItem(null)}
                  className="flex-1 bg-[#F4EDE0] border border-[#DFD3BF] py-2.5 rounded-xl font-bold text-xs text-[#7A7A70] flex items-center justify-center group cursor-pointer"
                >
                  <span>Cancel</span>
                  <Sticker variant="dark">❌</Sticker>
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#D96B43] hover:bg-[#C25832] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center group"
                >
                  <span>{applyType === 'insurance' ? 'Submit Insurance Claim' : 'Enroll in Scheme'}</span>
                  <Sticker>{applyType === 'insurance' ? '🛡️✨' : '🏛️💰'}</Sticker>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
