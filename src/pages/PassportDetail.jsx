import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  HeartPulse,
  Droplets,
  Calendar,
  Sparkles,
  QrCode,
  MapPin,
  UserCheck,
  FileText,
  Utensils,
  Clock,
  ExternalLink,
  Award,
  Check,
  AlertCircle
} from 'lucide-react';
import { getPassportById } from '../utils/passportStorage';

export default function PassportDetail() {
  const { animalId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [animal, setAnimal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const found = getPassportById(animalId);
    if (found) {
      setAnimal(found);
    } else {
      // If not found directly, create a fallback matching the animal ID
      setAnimal({
        id: animalId || 'BOV-IN-008891',
        tagNumber: 'TAG-IN-8891',
        inaphTag: '1209 8891 4401',
        species: 'Cattle',
        breed: 'Gir Cow',
        hindiName: 'गीर गाय',
        scientificName: 'Bos indicus',
        breedConfidence: 0.96,
        gender: 'Female',
        age: '4.5 Years',
        color: 'Reddish Dun with White Patches',
        identificationMarks: 'Convex forehead, pendulous leaf-like ears, curved lyre horns',
        photo: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80',
        owner: {
          name: 'Ramesh Patel',
          mobile: '+91 98765 43210',
          farmName: 'Amul Sharda Dairy Farm',
          village: 'Mogri',
          district: 'Anand',
          state: 'Gujarat',
          registrationDate: '12 Jan 2024'
        },
        health: {
          status: 'Healthy',
          pregnancyStatus: 'Pregnant (Est. 5th Month · Gestation 142 Days)',
          lastCheckup: '12 Aug 2026',
          bodyTemperature: '101.8°F (Normal)',
          dewormingDate: '15 Jul 2026 (Albendazole 100ml)',
          vaccinations: [
            { name: 'FMD (Foot & Mouth)', date: '10 May 2026', batch: 'FMD-IN-882', status: 'Vaccinated' },
            { name: 'HS (Haemorrhagic Septicaemia)', date: '05 May 2026', batch: 'HS-IND-410', status: 'Vaccinated' }
          ]
        },
        milk: {
          dailyYield: '16.5 L/day',
          fatPercentage: '4.8%',
          snfPercentage: '8.8%',
          lactationCycle: '305 Days (2nd Lactation)',
          milkingSchedule: 'Twice daily'
        },
        feeding: {
          greenFodder: '22 kg Hybrid Napier & Berseem',
          dryFodder: '4.5 kg Chopped Wheat Straw',
          concentrate: '3.5 kg Cottonseed & Maize blend',
          mineralMix: '50g Chelated Mineral Mixture + 10g Salt'
        },
        documents: {
          inaphVerified: true,
          insurancePolicy: 'New India Assurance (NLIS-2026-8891)',
          insuranceCoverage: '₹95,000',
          pkccSanctioned: '₹44,000 (Active @ 4%)'
        },
        timeline: [
          { date: '12 Aug 2026', title: 'AI Vision Biometric Scan', note: '96% Gir breed purity confirmed via BREEDIFY' },
          { date: '10 May 2026', title: 'Bi-Annual FMD Vaccination', note: 'Administered by Veterinary Hospital, Anand' }
        ]
      });
    }
  }, [animalId]);

  if (!animal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-[#D96B43] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#7A7A70]">Loading Animal Passport...</p>
      </div>
    );
  }

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    showNotification(t('passportDetail.downloadToast', 'Digital Passport PDF downloaded!'));
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showNotification(t('passportDetail.shareToast', 'Passport link copied to clipboard!'));
    } else {
      showNotification('Passport ID: ' + animal.id);
    }
  };

  const isBuffalo = animal.species?.toLowerCase() === 'buffalo';
  const isHealthy = animal.health?.status === 'Healthy';
  const isPregnant = animal.health?.pregnancyStatus?.toLowerCase().includes('pregnant');

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 text-[#2A2A28]">

      {/* TOAST MESSAGE */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-[#324E38] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* TOP NAVIGATION & ACTIONS TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          to="/digital-passport"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#7A7A70] hover:text-[#2A2A28] bg-[#FFFDF8] border border-[#DFD3BF] px-4 py-2 rounded-full shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('passportDetail.backToList', 'Back to Passports')}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-full bg-[#FFFDF8] border border-[#DFD3BF] text-xs font-bold text-[#2A2A28] hover:bg-[#F7F3EA] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-[#7A7A70]" />
            <span>{t('passportDetail.sharePassport', 'Share')}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-full bg-[#FFFDF8] border border-[#DFD3BF] text-xs font-bold text-[#2A2A28] hover:bg-[#F7F3EA] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#7A7A70]" />
            <span>{t('passportDetail.downloadPdf', 'PDF')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-full bg-[#324E38] hover:bg-[#253D2A] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#D96B43]" />
            <span>{t('passportDetail.printPassport', 'Print Passport')}</span>
          </button>
        </div>
      </div>

      {/* PASSPORT HERO CERTIFICATE HEADER */}
      <div className="bg-[#F4EDE0] rounded-3xl border-2 border-[#DFD3BF] shadow-soft overflow-hidden p-6 sm:p-8 space-y-6 relative">
        
        {/* Certificate Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-[#EDE7DA] pb-6 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇮🇳</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D96B43] bg-[#F5EBE1] px-3 py-1 rounded-full border border-[#EADBD0]">
                GOVT OF INDIA · LIVESTOCK BIOMETRIC PASSPORT
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-[#2A2A28]">
              {animal.breed}
            </h1>
            <p className="text-xs text-[#7A7A70]">
              Passport ID: <strong className="font-mono text-[#2A2A28]">{animal.id}</strong> · Tag: <strong className="font-mono text-[#2A2A28]">{animal.tagNumber}</strong>
            </p>
          </div>

          {/* Species & Status Badges */}
          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F7F3EA] text-[#324E38] border border-[#DFD3BF]">
              {isBuffalo ? '🐃 Water Buffalo' : '🐄 Indian Zebu Cattle'}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isPregnant
                ? 'bg-purple-100 text-purple-800 border-purple-300'
                : isHealthy
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              {isPregnant ? '🤰 Pregnant' : isHealthy ? '✓ Healthy' : '⚠️ Treatment'}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              {Math.round(animal.breedConfidence * 100)}% AI Purity
            </span>
          </div>
        </div>

        {/* IDENTITY & PHOTO SPLIT (HERO DETAILS) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left: Photo Frame (5 Cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-black border border-[#DFD3BF] shadow-sm">
              <img
                src={animal.photo}
                alt={animal.breed}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/75 text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full">
                {animal.tagNumber}
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] p-2 rounded-xl border border-white/10 flex items-center justify-between">
                <span>INAPH: {animal.inaphTag}</span>
                <span className="text-emerald-400 font-bold">✓ Verified</span>
              </div>
            </div>

            {/* Distinguishing Marks */}
            <div className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#DFD3BF] text-xs space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-[#7A7A70] block">
                DISTINGUISHING MARKS:
              </span>
              <p className="text-[#5A5A50] font-medium leading-relaxed">
                {animal.identificationMarks}
              </p>
            </div>
          </div>

          {/* Right: Quick Vitals & Ownership (7 Cols) */}
          <div className="md:col-span-7 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#DFD3BF]">
                <span className="text-[10px] text-[#7A7A70] block font-bold uppercase">GENDER</span>
                <span className="font-bold text-[#2A2A28]">{animal.gender}</span>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#DFD3BF]">
                <span className="text-[10px] text-[#7A7A70] block font-bold uppercase">ESTIMATED AGE</span>
                <span className="font-bold text-[#2A2A28]">{animal.age}</span>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#DFD3BF]">
                <span className="text-[10px] text-[#7A7A70] block font-bold uppercase">DAILY MILK</span>
                <span className="font-bold text-[#D96B43]">{animal.milk?.dailyYield}</span>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#DFD3BF]">
                <span className="text-[10px] text-[#7A7A70] block font-bold uppercase">BUTTERFAT %</span>
                <span className="font-bold text-[#2A2A28]">{animal.milk?.fatPercentage}</span>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#DFD3BF]">
                <span className="text-[10px] text-[#7A7A70] block font-bold uppercase">SNF %</span>
                <span className="font-bold text-[#2A2A28]">{animal.milk?.snfPercentage}</span>
              </div>
              <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#DFD3BF]">
                <span className="text-[10px] text-[#7A7A70] block font-bold uppercase">BODY TEMP</span>
                <span className="font-bold text-emerald-700">{animal.health?.bodyTemperature || '101.5°F'}</span>
              </div>
            </div>

            {/* Ownership Card */}
            <div className="bg-[#F4EDE0] p-4 rounded-2xl border border-[#DFD3BF] space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#324E38] flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#D96B43]" />
                  LEGAL REGISTERED OWNER
                </span>
                <span className="text-[10px] text-[#7A7A70]">Registered: {animal.owner?.registrationDate}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#7A7A70] block">Owner Full Name</span>
                  <strong className="text-[#2A2A28]">{animal.owner?.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A7A70] block">Contact Mobile</span>
                  <span className="font-mono text-[#2A2A28]">{animal.owner?.mobile}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A7A70] block">Dairy Farm</span>
                  <span className="text-[#2A2A28]">{animal.owner?.farmName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A7A70] block">Location</span>
                  <span className="text-[#2A2A28]">{animal.owner?.village}, {animal.owner?.district}, {animal.owner?.state}</span>
                </div>
              </div>
            </div>

            {/* QR Code Verification Widget */}
            <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#DFD3BF] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-[#D96B43] flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5" />
                  BIOMETRIC DIGITAL VERIFICATION QR
                </span>
                <p className="text-[11px] text-[#7A7A70] leading-snug">
                  Scan with any smartphone or dairy cooperative scanner to verify registration & vaccination history.
                </p>
                <span className="font-mono text-[10px] text-[#324E38] font-bold block pt-0.5">
                  https://breedify.ai/passport/{animal.id}
                </span>
              </div>

              {/* Scannable SVG QR Code Representation */}
              <div className="w-20 h-20 bg-[#FFFDF8] p-2 rounded-xl border border-[#DFD3BF] shrink-0 shadow-xs flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect width="100" height="100" fill="white" />
                  {/* Outer corner boxes */}
                  <rect x="5" y="5" width="30" height="30" fill="#2A2A28" />
                  <rect x="10" y="10" width="20" height="20" fill="white" />
                  <rect x="15" y="15" width="10" height="10" fill="#D96B43" />

                  <rect x="65" y="5" width="30" height="30" fill="#2A2A28" />
                  <rect x="70" y="10" width="20" height="20" fill="white" />
                  <rect x="75" y="15" width="10" height="10" fill="#D96B43" />

                  <rect x="5" y="65" width="30" height="30" fill="#2A2A28" />
                  <rect x="10" y="70" width="20" height="20" fill="white" />
                  <rect x="15" y="75" width="10" height="10" fill="#D96B43" />

                  {/* Digital pattern bits */}
                  <rect x="42" y="10" width="8" height="8" fill="#2A2A28" />
                  <rect x="52" y="18" width="8" height="8" fill="#2A2A28" />
                  <rect x="42" y="30" width="8" height="8" fill="#2A2A28" />
                  <rect x="52" y="42" width="8" height="8" fill="#2A2A28" />
                  <rect x="10" y="45" width="8" height="8" fill="#2A2A28" />
                  <rect x="25" y="45" width="8" height="8" fill="#2A2A28" />
                  <rect x="42" y="55" width="8" height="8" fill="#2A2A28" />
                  <rect x="65" y="50" width="8" height="8" fill="#2A2A28" />
                  <rect x="80" y="45" width="8" height="8" fill="#2A2A28" />
                  <rect x="55" y="70" width="8" height="8" fill="#2A2A28" />
                  <rect x="75" y="75" width="8" height="8" fill="#2A2A28" />
                  <rect x="85" y="85" width="8" height="8" fill="#2A2A28" />
                </svg>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* SECTIONS: HEALTH, FEEDING, SCHEMES, TIMELINE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* SECTION D: HEALTH & VACCINATION RECORD */}
        <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
            <div className="flex items-center gap-2 text-[#D96B43]">
              <HeartPulse className="w-5 h-5" />
              <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                D. Health & Immunization Record
              </h3>
            </div>
            <Link to="/health" className="text-xs text-[#D96B43] font-bold hover:underline">
              Symptom Checker &rarr;
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-[#FDFBF7] p-2.5 rounded-xl border border-[#DFD3BF]">
              <span className="text-[#7A7A70]">Pregnancy Status:</span>
              <strong className="text-purple-800">{animal.health?.pregnancyStatus}</strong>
            </div>
            <div className="flex justify-between items-center bg-[#FDFBF7] p-2.5 rounded-xl border border-[#DFD3BF]">
              <span className="text-[#7A7A70]">Deworming Record:</span>
              <span className="font-semibold text-[#2A2A28]">{animal.health?.dewormingDate}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-extrabold uppercase text-[#7A7A70] block">
              VACCINATION LOG:
            </span>
            <div className="divide-y divide-[#EDE7DA] border border-[#EDE7DA] rounded-2xl overflow-hidden text-xs">
              {(animal.health?.vaccinations || []).map((v, i) => (
                <div key={i} className="p-3 bg-[#FAF5EB] flex items-center justify-between">
                  <div>
                    <strong className="text-[#2A2A28] block">{v.name}</strong>
                    <span className="text-[10px] text-[#7A7A70]">Date: {v.date} · Batch: {v.batch}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    ✓ {v.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION F: SCIENTIFIC FEEDING & FODDER RATION */}
        <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
            <div className="flex items-center gap-2 text-[#324E38]">
              <Utensils className="w-5 h-5 text-[#D96B43]" />
              <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                F. Scientific Fodder & Feed Ration
              </h3>
            </div>
            <Link to="/assistant" state={{ breedName: animal.breed }} className="text-xs text-[#D96B43] font-bold hover:underline">
              Ask Copilot &rarr;
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#DFD3BF]">
              <span className="text-[10px] font-extrabold uppercase text-[#D96B43] block">GREEN FODDER</span>
              <p className="font-bold text-[#2A2A28] mt-0.5">{animal.feeding?.greenFodder}</p>
            </div>
            <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#DFD3BF]">
              <span className="text-[10px] font-extrabold uppercase text-[#324E38] block">DRY ROUGHAGE</span>
              <p className="font-bold text-[#2A2A28] mt-0.5">{animal.feeding?.dryFodder}</p>
            </div>
            <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#DFD3BF]">
              <span className="text-[10px] font-extrabold uppercase text-purple-700 block">CONCENTRATE FEED</span>
              <p className="font-bold text-[#2A2A28] mt-0.5">{animal.feeding?.concentrate}</p>
            </div>
            <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#DFD3BF]">
              <span className="text-[10px] font-extrabold uppercase text-amber-700 block">MINERALS & SALTS</span>
              <p className="font-bold text-[#2A2A28] mt-0.5">{animal.feeding?.mineralMix}</p>
            </div>
          </div>
        </div>

        {/* SECTION G: SCHEMES & INSURANCE */}
        <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
            <div className="flex items-center gap-2 text-[#D96B43]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                G. Insurance & Credit Documents
              </h3>
            </div>
            <Link to="/insurance-finance" className="text-xs text-[#D96B43] font-bold hover:underline">
              View Schemes &rarr;
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#DFD3BF] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#7A7A70] block">ACTIVE INSURANCE</span>
                <strong className="text-[#2A2A28]">{animal.documents?.insurancePolicy}</strong>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Cover: {animal.documents?.insuranceCoverage}
              </span>
            </div>

            <div className="bg-[#FDFBF7] p-3 rounded-2xl border border-[#DFD3BF] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#7A7A70] block">PASHU KISAN CREDIT CARD</span>
                <strong className="text-[#2A2A28]">{animal.documents?.pkccSanctioned}</strong>
              </div>
              <span className="text-xs font-bold text-[#D96B43] bg-[#F5EBE1] px-2.5 py-1 rounded-lg border border-[#EADBD0]">
                Collateral-Free
              </span>
            </div>
          </div>
        </div>

        {/* SECTION H: PASSPORT TIMELINE */}
        <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
            <div className="flex items-center gap-2 text-[#324E38]">
              <Clock className="w-5 h-5 text-[#D96B43]" />
              <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                H. Verified Activity Timeline
              </h3>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {(animal.timeline || []).map((t, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#D96B43] mt-1.5 shrink-0" />
                <div className="bg-[#FDFBF7] p-3 rounded-xl border border-[#DFD3BF] flex-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-[#2A2A28]">{t.title}</strong>
                    <span className="text-[10px] text-[#7A7A70] font-mono">{t.date}</span>
                  </div>
                  <p className="text-[11px] text-[#5A5A50] mt-0.5">{t.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
