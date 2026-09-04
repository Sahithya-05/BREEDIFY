import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Plus,
  Scan,
  ShieldCheck,
  HeartPulse,
  Droplets,
  Calendar,
  Sparkles,
  QrCode,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
  Tag,
  Camera,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { getPassports, savePassport } from '../utils/passportStorage';

export default function DigitalPassport() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Authentication & Role Detection (Restricted to Registered Veterinary Doctors)
  const currentUser = (() => {
    try {
      const saved = localStorage.getItem('bovine_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  })();
  const userRole = (currentUser?.role || 'farmer').toLowerCase();
  const isVet = userRole === 'vet' || userRole === 'veterinarian';
  const [deniedToast, setDeniedToast] = useState(false);

  const [passports, setPassports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all'); // 'all' | 'Cattle' | 'Buffalo'
  const [selectedHealth, setSelectedHealth] = useState('all'); // 'all' | 'Healthy' | 'Under Treatment' | 'Pregnant'

  // Modal for manual registration
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnimal, setNewAnimal] = useState({
    species: 'Cattle',
    breed: 'Gir Cow',
    tagNumber: '',
    gender: 'Female',
    age: '4 Years',
    color: 'Reddish Brown',
    identificationMarks: '',
    photo: 'https://images.unsplash.com/photo-1546445317-29f4545f9d52?auto=format&fit=crop&w=800&q=80',
    ownerName: 'Ramesh Patel',
    ownerMobile: '+91 98765 43210',
    village: 'Mogri, Anand, Gujarat',
    milkYield: '14 L/day',
    healthStatus: 'Healthy'
  });
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    setPassports(getPassports());
  }, []);

  const filteredPassports = passports.filter((animal) => {
    // Search query matches ID, Tag, Breed, Owner name
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      animal.id.toLowerCase().includes(q) ||
      animal.tagNumber.toLowerCase().includes(q) ||
      animal.breed.toLowerCase().includes(q) ||
      animal.owner?.name?.toLowerCase().includes(q);

    // Filter by species
    const matchesSpecies =
      selectedSpecies === 'all' ||
      animal.species.toLowerCase() === selectedSpecies.toLowerCase();

    // Filter by health
    const matchesHealth =
      selectedHealth === 'all' ||
      (selectedHealth === 'Healthy' && animal.health?.status === 'Healthy') ||
      (selectedHealth === 'Under Treatment' && animal.health?.status === 'Under Treatment') ||
      (selectedHealth === 'Pregnant' && animal.health?.pregnancyStatus?.toLowerCase().includes('pregnant'));

    return matchesSearch && matchesSpecies && matchesHealth;
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewAnimal(prev => ({ ...prev, photo: URL.createObjectURL(file) }));
    }
  };

  const handleCreateAnimal = (e) => {
    e.preventDefault();
    if (!isVet) {
      setDeniedToast(true);
      setTimeout(() => setDeniedToast(false), 4000);
      setShowAddModal(false);
      return;
    }
    const tagNum = newAnimal.tagNumber || `TAG-IN-${Math.floor(1000 + Math.random() * 9000)}`;
    const passId = `BOV-IN-${Math.floor(100000 + Math.random() * 900000)}`;

    const createdRecord = {
      id: passId,
      tagNumber: tagNum,
      inaphTag: `1209 ${tagNum.replace('TAG-IN-', '')} 0001`,
      species: newAnimal.species,
      breed: newAnimal.breed,
      hindiName: newAnimal.species === 'Cattle' ? 'देसी गाय' : 'देसी भैंस',
      scientificName: newAnimal.species === 'Cattle' ? 'Bos indicus' : 'Bubalus bubalis',
      breedConfidence: 0.95,
      gender: newAnimal.gender,
      age: newAnimal.age,
      color: newAnimal.color,
      identificationMarks: newAnimal.identificationMarks || 'Clean standard morphology',
      photo: newAnimal.photo,
      owner: {
        name: newAnimal.ownerName,
        mobile: newAnimal.ownerMobile,
        farmName: 'Registered Dairy Unit',
        village: newAnimal.village.split(',')[0] || 'Anand',
        district: 'Anand',
        state: 'Gujarat',
        registrationDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      },
      health: {
        status: newAnimal.healthStatus,
        pregnancyStatus: newAnimal.healthStatus === 'Pregnant' ? 'Pregnant (Est. 4th Month)' : 'Milking · Non-Pregnant',
        lastCheckup: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        bodyTemperature: '101.5°F',
        dewormingDate: 'Recent',
        vaccinations: [
          { name: 'FMD (Foot & Mouth)', date: '10 May 2026', batch: 'FMD-IN-882', status: 'Vaccinated' },
          { name: 'HS (Haemorrhagic Septicaemia)', date: '05 May 2026', batch: 'HS-IND-410', status: 'Vaccinated' }
        ]
      },
      milk: {
        dailyYield: newAnimal.milkYield,
        fatPercentage: newAnimal.species === 'Buffalo' ? '7.5%' : '4.8%',
        snfPercentage: '8.8%',
        lactationCycle: '305 Days',
        milkingSchedule: 'Twice daily'
      },
      feeding: {
        greenFodder: '25 kg Napier & Berseem',
        dryFodder: '4.5 kg Wheat Straw',
        concentrate: '3.5 kg Balanced Dairy Mash',
        mineralMix: '50g Chelated Mineral Mixture'
      },
      documents: {
        inaphVerified: true,
        insurancePolicy: 'PM Pashu Bima (NIC-2026-REG)',
        insuranceCoverage: '₹1,00,000',
        pkccSanctioned: '₹44,000'
      },
      timeline: [
        { date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), title: 'Passport Registered', note: 'Created via Digital Passport Portal' }
      ]
    };

    const updated = savePassport(createdRecord);
    setPassports(updated);
    setShowAddModal(false);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 text-[#2A2A28]">

      {/* TOAST CONFIRMATION */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#324E38] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{t('passport.successToast', 'Animal Passport generated successfully!')}</span>
        </div>
      )}

      {/* ACCESS DENIED TOAST FOR NON-VETS */}
      {deniedToast && (
        <div className="fixed top-6 right-6 z-50 bg-red-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 animate-in fade-in slide-in-from-top-4">
          <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0" />
          <span className="text-xs font-bold">{t('passport.vetOnlyNotice', '🔒 Official Passport creation is restricted to registered Veterinary Doctors.')}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-[#F4EDE0] p-6 sm:p-8 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#D96B43] flex items-center justify-center text-white shadow-xs">
                📋
              </span>
              <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-[#2A2A28]">
                {t('passport.pageTitle', 'Digital Animal Passport')}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#7A7A70] max-w-xl">
              {t('passport.pageSubtitle', "Your livestock's complete digital identity, health records, and ownership passport.")}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isVet ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-full bg-[#FAF5EB] hover:bg-[#F7F3EA] text-[#2A2A28] border border-[#DFD3BF] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#D96B43]" />
                <span>{t('passport.addNewAnimal', '+ Register Animal (Vet)')}</span>
              </button>
            ) : (
              <div 
                className="px-3.5 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                title={t('passport.vetOnlyExplanation', 'Official Animal Passports can only be registered by licensed Veterinary Officers.')}
              >
                <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="font-bold text-[11px]">{t('passport.vetOnlyBadge', 'Passport Registration: Registered Vets Only')}</span>
              </div>
            )}

            <Link
              to="/scanner"
              className="px-5 py-2.5 rounded-full bg-[#D96B43] hover:bg-[#C25832] text-white text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-md"
            >
              <Scan className="w-3.5 h-3.5" />
              <span>{t('passport.scanAnimal', 'Scan with AI')}</span>
            </Link>
          </div>
        </div>

        {/* VET AUTHORITY BANNER */}
        {!isVet && (
          <div className="bg-amber-50/90 border border-amber-200/80 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            <p className="leading-relaxed">
              <span className="font-bold text-amber-950">Official INAPH Veterinary Regulation: </span>
              {t('passport.vetOnlyExplanation', 'Official Digital Animal Passports (INAPH compliant) can only be registered and certified by licensed Veterinary Officers. Farmers can view, download, and share passports for their animals.')}
            </p>
          </div>
        )}

        {/* SEARCH & FILTERS BAR */}
        <div className="pt-2 border-t border-[#EDE7DA] grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Input (5 Cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#A0A090] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('passport.searchPlaceholder', 'Search by Animal ID, Tag, Breed, or Owner...')}
              className="w-full bg-[#FAF5EB] border border-[#DFD3BF] rounded-2xl pl-10 pr-4 py-2 text-xs text-[#2A2A28] placeholder-[#A0A090] focus:outline-none focus:border-[#D96B43]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[#A0A090] hover:text-[#2A2A28]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Species Filter Pills (4 Cols) */}
          <div className="md:col-span-4 flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: t('passport.filterAllSpecies', 'All Species') },
              { id: 'Cattle', label: `🐄 ${t('passport.filterCattle', 'Cattle')}` },
              { id: 'Buffalo', label: `🐃 ${t('passport.filterBuffalo', 'Buffalo')}` },
            ].map((sp) => (
              <button
                key={sp.id}
                onClick={() => setSelectedSpecies(sp.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSpecies === sp.id
                    ? 'bg-[#324E38] text-white shadow-xs'
                    : 'bg-[#FAF5EB] border border-[#DFD3BF] text-[#7A7A70] hover:text-[#2A2A28]'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          {/* Health Filter Dropdown (3 Cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedHealth}
              onChange={(e) => setSelectedHealth(e.target.value)}
              className="w-full bg-[#FAF5EB] border border-[#DFD3BF] rounded-2xl px-3 py-2 text-xs font-semibold text-[#2A2A28] focus:outline-none focus:border-[#D96B43] cursor-pointer"
            >
              <option value="all">{t('passport.filterAllHealth', 'All Health Status')}</option>
              <option value="Healthy">✓ {t('passport.filterHealthy', 'Healthy')}</option>
              <option value="Pregnant">🤰 {t('passport.filterPregnant', 'Pregnant')}</option>
              <option value="Under Treatment">⚠️ {t('passport.filterTreatment', 'Under Treatment')}</option>
            </select>
          </div>

        </div>
      </div>

      {/* ANIMAL CARDS GRID */}
      {filteredPassports.length === 0 ? (
        <div className="bg-[#F4EDE0] rounded-3xl border border-[#DFD3BF] p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F7F3EA] text-[#D96B43] mx-auto flex items-center justify-center text-2xl">
            🐄
          </div>
          <h3 className="font-editorial font-bold text-lg text-[#2A2A28]">
            {t('passport.noAnimalsFound', 'No livestock passports match your search criteria.')}
          </h3>
          <p className="text-xs text-[#7A7A70] max-w-sm mx-auto">
            Try adjusting your search keywords or clear filters to view all registered animals.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedSpecies('all'); setSelectedHealth('all'); }}
            className="px-4 py-2 bg-[#FAF5EB] border border-[#DFD3BF] rounded-full text-xs font-bold text-[#D96B43] hover:bg-[#F4EDE0]"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPassports.map((animal) => {
            const isBuffalo = animal.species?.toLowerCase() === 'buffalo';
            const isHealthy = animal.health?.status === 'Healthy';
            const isPregnant = animal.health?.pregnancyStatus?.toLowerCase().includes('pregnant');

            return (
              <div
                key={animal.id}
                className="bg-[#F4EDE0] rounded-3xl border border-[#DFD3BF] shadow-soft overflow-hidden flex flex-col justify-between hover:border-[#D96B43] hover:shadow-card transition-all group"
              >
                {/* Top Photo & Identity Badges */}
                <div className="relative aspect-[16/10] bg-black/5 overflow-hidden">
                  <img
                    src={animal.photo}
                    alt={animal.breed}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = isBuffalo ? '/breeds/murrah.jpg' : '/breeds/gir.jpg';
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient shade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                  {/* Top Left: Passport ID Badge */}
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-white/20">
                    {animal.id}
                  </div>

                  {/* Top Right: Species Badge with Photo */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-[#2A2A28] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    <img
                      src={isBuffalo ? '/breeds/murrah.jpg' : '/breeds/gir.jpg'}
                      alt=""
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span>{isBuffalo ? 'Buffalo' : 'Cattle'}</span>
                  </div>

                  {/* Bottom Left: Breed Name & Tag */}
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-editorial font-bold text-lg leading-tight drop-shadow-sm">
                      {animal.breed}
                    </h3>
                    <span className="text-[10px] text-[#E3DDCF] font-mono">
                      {animal.tagNumber} · {animal.gender} ({animal.age})
                    </span>
                  </div>
                </div>

                {/* Card Body Details */}
                <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  
                  {/* Status & Milk Yield Row */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#F4EDE0] p-2.5 rounded-2xl border border-[#DFD3BF]">
                      <span className="text-[10px] font-extrabold uppercase text-[#7A7A70] block">
                        {t('passport.healthStatus', 'Health Status')}
                      </span>
                      <span className={`text-xs font-bold inline-flex items-center gap-1 mt-0.5 ${
                        isPregnant
                          ? 'text-purple-700'
                          : isHealthy
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}>
                        {isPregnant ? '🤰 Pregnant' : isHealthy ? '✓ Healthy' : '⚠️ Treatment'}
                      </span>
                    </div>

                    <div className="bg-[#F4EDE0] p-2.5 rounded-2xl border border-[#DFD3BF]">
                      <span className="text-[10px] font-extrabold uppercase text-[#7A7A70] block">
                        {t('passport.milkYield', 'Daily Yield')}
                      </span>
                      <span className="text-xs font-bold text-[#D96B43] mt-0.5 block">
                        {animal.milk?.dailyYield || '14 L/day'}
                      </span>
                    </div>
                  </div>

                  {/* Owner & Location Info */}
                  <div className="text-[11px] text-[#7A7A70] space-y-1 border-t border-[#EDE7DA] pt-2.5">
                    <div className="flex items-center justify-between">
                      <span>Owner: <strong className="text-[#2A2A28]">{animal.owner?.name}</strong></span>
                      <span className="font-mono text-[10px]">{animal.owner?.district}, {animal.owner?.state}</span>
                    </div>
                    <div>
                      Last Checkup: <span className="font-semibold text-[#5A5A50]">{animal.health?.lastCheckup}</span>
                    </div>
                  </div>

                  {/* Action Button: View Passport */}
                  <Link
                    to={`/digital-passport/${animal.id}`}
                    className="w-full mt-2 bg-[#324E38] hover:bg-[#253D2A] text-white py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <span>{t('passport.viewPassport', 'View Digital Passport')}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D96B43]" />
                  </Link>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: MANUAL REGISTER LIVESTOCK */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4EDE0] rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#DFD3BF] shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2 text-[#D96B43]">
                <Tag className="w-5 h-5" />
                <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                  {t('passport.createPassportModalTitle', 'Create Digital Animal Passport')}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F3EA] hover:bg-[#EDE7DA] flex items-center justify-center text-[#7A7A70]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnimal} className="space-y-3.5 text-xs">
              
              {/* Species & Breed */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Species</label>
                  <select
                    value={newAnimal.species}
                    onChange={(e) => {
                      const sp = e.target.value;
                      setNewAnimal(prev => ({
                        ...prev,
                        species: sp,
                        breed: sp === 'Buffalo' ? 'Murrah Buffalo' : 'Gir Cow'
                      }));
                    }}
                    className="w-full bg-[#FAF5EB] border border-[#DFD3BF] rounded-xl px-3 py-2 text-xs text-[#2A2A28]"
                  >
                    <option value="Cattle">🐄 Cattle (Cow)</option>
                    <option value="Buffalo">🐃 Buffalo</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Indian Breed</label>
                  <select
                    value={newAnimal.breed}
                    onChange={(e) => setNewAnimal(prev => ({ ...prev, breed: e.target.value }))}
                    className="w-full bg-[#FAF5EB] border border-[#DFD3BF] rounded-xl px-3 py-2 text-xs text-[#2A2A28]"
                  >
                    {newAnimal.species === 'Buffalo' ? (
                      <>
                        <option value="Murrah Buffalo">Murrah Buffalo</option>
                        <option value="Jaffarabadi Buffalo">Jaffarabadi Buffalo</option>
                        <option value="Mehsana Buffalo">Mehsana Buffalo</option>
                        <option value="Nili-Ravi Buffalo">Nili-Ravi Buffalo</option>
                        <option value="Surti Buffalo">Surti Buffalo</option>
                      </>
                    ) : (
                      <>
                        <option value="Gir Cow">Gir Cow</option>
                        <option value="Sahiwal Cow">Sahiwal Cow</option>
                        <option value="Red Sindhi">Red Sindhi</option>
                        <option value="Tharparkar">Tharparkar</option>
                        <option value="Kankrej">Kankrej</option>
                        <option value="Rathi">Rathi</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Tag & Age */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">INAPH Ear Tag Number</label>
                  <input
                    type="text"
                    value={newAnimal.tagNumber}
                    onChange={(e) => setNewAnimal(prev => ({ ...prev, tagNumber: e.target.value }))}
                    placeholder="TAG-IN-XXXX (or 12 digit tag)"
                    className="w-full bg-[#FAF5EB] border border-[#DFD3BF] rounded-xl px-3 py-2 text-xs text-[#2A2A28]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Estimated Age</label>
                  <input
                    type="text"
                    value={newAnimal.age}
                    onChange={(e) => setNewAnimal(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="e.g. 4 Years"
                    className="w-full bg-[#FAF5EB] border border-[#DFD3BF] rounded-xl px-3 py-2 text-xs text-[#2A2A28]"
                  />
                </div>
              </div>

              {/* Gender & Daily Yield */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Gender</label>
                  <select
                    value={newAnimal.gender}
                    onChange={(e) => setNewAnimal(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full bg-[#FAF5EB] border border-[#DFD3BF] rounded-xl px-3 py-2 text-xs text-[#2A2A28]"
                  >
                    <option value="Female">♀ Female</option>
                    <option value="Male">♂ Male</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Daily Milk Yield</label>
                  <input
                    type="text"
                    value={newAnimal.milkYield}
                    onChange={(e) => setNewAnimal(prev => ({ ...prev, milkYield: e.target.value }))}
                    placeholder="e.g. 16 L/day"
                    className="w-full bg-[#FAF5EB] border border-[#DFD3BF] rounded-xl px-3 py-2 text-xs text-[#2A2A28]"
                  />
                </div>
              </div>

              {/* Owner Name & Mobile */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={newAnimal.ownerName}
                    onChange={(e) => setNewAnimal(prev => ({ ...prev, ownerName: e.target.value }))}
                    className="w-full bg-[#FAF5EB] border border-[#DFD3BF] rounded-xl px-3 py-2 text-xs text-[#2A2A28]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Owner Mobile</label>
                  <input
                    type="text"
                    required
                    value={newAnimal.ownerMobile}
                    onChange={(e) => setNewAnimal(prev => ({ ...prev, ownerMobile: e.target.value }))}
                    className="w-full bg-[#FAF5EB] border border-[#DFD3BF] rounded-xl px-3 py-2 text-xs text-[#2A2A28]"
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Animal Photograph</label>
                <div className="flex items-center gap-3">
                  <img src={newAnimal.photo} alt="Preview" className="w-14 h-12 rounded-xl object-cover border border-[#DFD3BF]" />
                  <label className="bg-[#FAF5EB] hover:bg-[#F7F3EA] border border-[#DFD3BF] text-[#2A2A28] px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#D96B43]" />
                    <span>Upload Picture</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-[#FAF5EB] border border-[#DFD3BF] py-2.5 rounded-xl font-bold text-xs text-[#7A7A70]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#D96B43] hover:bg-[#C25832] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Confirm & Save
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
