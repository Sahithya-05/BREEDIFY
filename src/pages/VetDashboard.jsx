import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Stethoscope,
  AlertTriangle,
  HeartPulse,
  Calendar,
  CheckCircle2,
  FileText,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  MapPin,
  Clock,
  Sparkles,
  Phone,
  Activity,
  Send,
  X,
  QrCode
} from 'lucide-react';
import { getPassports } from '../utils/passportStorage';
import {
  getClinicalCases,
  saveClinicalCase,
  getEmergencyRequests,
  resolveEmergencyRequest
} from '../utils/ecosystemStorage';

export default function VetDashboard({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const currentUser = user || JSON.parse(localStorage.getItem('bovine_user') || '{}') || {
    name: 'Dr. Anita Joshi, B.V.Sc',
    role: 'vet',
    location: 'District Veterinary Polyclinic, Anand'
  };

  const [cases, setCases] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [passports, setPassports] = useState([]);
  const [searchAnimalId, setSearchAnimalId] = useState('');

  // New Clinical Case Modal State
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [caseForm, setCaseForm] = useState({
    animalId: '',
    tagNumber: '',
    breed: 'Gir Cow',
    farmerName: 'Ramesh Patel',
    farmerMobile: '+91 98765 43210',
    symptoms: '',
    diagnosis: '',
    treatmentGiven: '',
    vaccinationGiven: '',
    vaccineBatch: 'FMD-IND-2026-90',
    healthStatus: 'Healthy',
    urgency: 'Routine'
  });
  const [caseSuccessToast, setCaseSuccessToast] = useState(false);

  useEffect(() => {
    setCases(getClinicalCases());
    setEmergencies(getEmergencyRequests());
    const loadedPassports = getPassports();
    setPassports(loadedPassports);
    if (loadedPassports.length > 0) {
      setCaseForm(prev => ({
        ...prev,
        animalId: loadedPassports[0].id,
        tagNumber: loadedPassports[0].tagNumber,
        breed: loadedPassports[0].breed
      }));
    }
  }, []);

  const handleDispatchEmergency = (emgId) => {
    const updated = resolveEmergencyRequest(emgId, 'vet');
    setEmergencies([...updated]);
  };

  const handleSaveCase = (e) => {
    e.preventDefault();
    saveClinicalCase({
      ...caseForm,
      vetName: currentUser.name || 'Dr. Anita Joshi, B.V.Sc'
    }, 'vet');

    setCases(getClinicalCases());
    setShowCaseModal(false);
    setCaseSuccessToast(true);
    setTimeout(() => setCaseSuccessToast(false), 3500);
  };

  const handleLookupAnimal = (e) => {
    e.preventDefault();
    if (searchAnimalId.trim()) {
      navigate(`/digital-passport/${searchAnimalId.trim()}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-[#2A2A28]">

      {/* TOAST CONFIRMATION */}
      {caseSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#324E38] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <strong className="text-xs block">Clinical Case & Treatment Logged!</strong>
            <span className="text-[11px] text-[#C2D6C3]">Animal passport & farmer health dashboard synced.</span>
          </div>
        </div>
      )}

      {/* HERO COMMAND CENTER BANNER */}
      <div className="bg-[#324E38] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-card border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                VETERINARY COMMAND CENTER · ICAR RECOGNIZED
              </span>
              <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-white">
                Officer ID: VET-GJ-8842
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-editorial font-bold text-white leading-tight">
              {currentUser.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#C2D6C3] leading-relaxed">
              District surveillance, clinical triage, emergency tele-vet dispatch, and animal biometric passport verification.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowCaseModal(true)}
              className="bg-[#D96B43] hover:bg-[#C25832] text-white px-5 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Clinical Treatment</span>
            </button>

            <Link
              to="/digital-passport"
              className="bg-white/15 hover:bg-white/20 text-white px-5 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider border border-white/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-300" />
              <span>Animal 360° Lookup</span>
            </Link>
          </div>
        </div>
      </div>

      {/* VET KEY PERFORMANCE INDICATORS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Emergency Requests */}
        <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-1.5 hover:border-red-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-red-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              EMERGENCY REQUESTS
            </span>
            <span className="text-[9px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full animate-pulse">
              1962 Live
            </span>
          </div>
          <div className="text-2xl font-editorial font-bold text-red-700">
            {emergencies.filter(e => e.status !== 'Veterinarian Dispatched').length} Active
          </div>
          <p className="text-[11px] text-[#7A7A70]">Requires immediate clinical triage</p>
        </div>

        {/* KPI 2: Active Clinical Cases */}
        <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-1.5 hover:border-blue-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-blue-700 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              ACTIVE CASES
            </span>
            <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              In Treatment
            </span>
          </div>
          <div className="text-2xl font-editorial font-bold text-[#2A2A28]">
            {cases.length} Open Cases
          </div>
          <p className="text-[11px] text-[#7A7A70]">Prescriptions & antibiotic follow-ups</p>
        </div>

        {/* KPI 3: Vaccinations Due This Month */}
        <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-1.5 hover:border-emerald-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              VACCINATIONS DUE
            </span>
            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              FMD Phase 3
            </span>
          </div>
          <div className="text-2xl font-editorial font-bold text-emerald-800">
            18 Bovines
          </div>
          <p className="text-[11px] text-[#7A7A70]">Mogri & Vadtal cluster scheduled</p>
        </div>

        {/* KPI 4: Herd Health Index */}
        <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-1.5 hover:border-[#D96B43] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#324E38] flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-[#D96B43]" />
              HERD HEALTH SCORE
            </span>
            <span className="text-[9px] font-bold bg-[#F5EBE1] text-[#D96B43] px-2 py-0.5 rounded-full">
              Optimal
            </span>
          </div>
          <div className="text-2xl font-editorial font-bold text-[#2A2A28]">
            94.2%
          </div>
          <p className="text-[11px] text-[#7A7A70]">Zero Anthrax or BQ outbreaks reported</p>
        </div>

      </div>

      {/* QUICK ANIMAL 360° SEARCH BAR */}
      <div className="bg-[#F4EDE0] p-4 sm:p-5 rounded-3xl border border-[#DFD3BF] shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <QrCode className="w-5 h-5 text-[#D96B43]" />
          <div>
            <strong className="text-[#2A2A28] block">Animal 360° Comprehensive Medical Lookup</strong>
            <span className="text-[11px] text-[#7A7A70]">Instant search by INAPH Ear Tag, Passport ID, or Owner Name</span>
          </div>
        </div>

        <form onSubmit={handleLookupAnimal} className="flex items-center gap-2 max-w-md w-full">
          <input
            type="text"
            value={searchAnimalId}
            onChange={(e) => setSearchAnimalId(e.target.value)}
            placeholder="e.g. BOV-IN-008891 or TAG-IN-8891..."
            className="flex-1 bg-[#F4EDE0] border border-[#DFD3BF] rounded-2xl px-4 py-2 text-xs text-[#2A2A28] focus:outline-none focus:border-[#D96B43]"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-2xl bg-[#324E38] hover:bg-[#253D2A] text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs"
          >
            Lookup 360°
          </button>
        </form>
      </div>

      {/* MAIN TWO-COLUMN SPLIT: EMERGENCY QUEUE (5 Cols) + ACTIVE CASE SHEETS (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT 5 COLS: EMERGENCY FARMER DISPATCH QUEUE */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2 text-red-700 font-bold">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-editorial text-base text-[#2A2A28]">Emergency Distress Queue (1962)</h3>
              </div>
              <span className="text-[10px] font-mono text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 font-bold">
                {emergencies.length} Incoming
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {emergencies.map((emg) => (
                <div key={emg.id} className="p-4 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-red-800 text-sm block">{emg.emergencyType}</strong>
                      <span className="text-[10px] text-[#7A7A70]">{emg.farmerName} · {emg.village}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      emg.status === 'Veterinarian Dispatched'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800 animate-pulse'
                    }`}>
                      {emg.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#5A5A50] bg-[#F4EDE0] p-2.5 rounded-xl border border-[#EDE7DA] leading-relaxed">
                    "{emg.description}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="font-mono text-[#7A7A70] flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#D96B43]" /> {emg.mobile}
                    </span>

                    {emg.status !== 'Veterinarian Dispatched' ? (
                      <button
                        onClick={() => handleDispatchEmergency(emg.id)}
                        className="bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                      >
                        Dispatch Vet Unit &rarr;
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        ✓ Officer En Route
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT 7 COLS: CLINICAL CASE SHEETS & E-PRESCRIPTIONS */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#D96B43]" />
                <div>
                  <h2 className="text-lg font-editorial font-bold text-[#2A2A28]">
                    Clinical Case Sheets & E-Prescriptions
                  </h2>
                  <span className="text-[10px] text-[#7A7A70]">Synchronized with National Livestock Health Database</span>
                </div>
              </div>

              <button
                onClick={() => setShowCaseModal(true)}
                className="text-xs font-bold text-[#D96B43] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>+ Log New Case</span>
              </button>
            </div>

            {/* Cases list */}
            <div className="space-y-3.5 text-xs">
              {cases.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] space-y-2.5 hover:border-[#D96B43] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-[#2A2A28]">{c.diagnosis}</strong>
                        <span className="text-[10px] font-mono text-[#7A7A70]">{c.id}</span>
                      </div>
                      <span className="text-[11px] text-[#5A5A50]">
                        Patient: <strong>{c.breed}</strong> ({c.tagNumber}) · Owner: <strong>{c.farmerName}</strong> ({c.village})
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {c.status}
                    </span>
                  </div>

                  {/* Symptoms & Treatment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#F4EDE0] p-2.5 rounded-xl border border-[#EDE7DA]">
                      <span className="text-[9px] font-extrabold uppercase text-[#7A7A70] block">Presenting Symptoms</span>
                      <p className="text-[#5A5A50] mt-0.5">{c.symptoms}</p>
                    </div>
                    <div className="bg-[#F4EDE0] p-2.5 rounded-xl border border-[#EDE7DA]">
                      <span className="text-[9px] font-extrabold uppercase text-[#7A7A70] block">Rx Treatment Administered</span>
                      <p className="text-[#2A2A28] font-semibold mt-0.5">{c.treatmentGiven}</p>
                    </div>
                  </div>

                  {/* Vaccination details if provided */}
                  {c.vaccinationGiven && (
                    <div className="bg-emerald-50 text-emerald-900 p-2 rounded-xl border border-emerald-200 flex items-center justify-between text-[11px]">
                      <span>✓ Immunization Added: <strong>{c.vaccinationGiven}</strong></span>
                      <span className="font-mono text-[10px]">Synced to Passport</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[#7A7A70] pt-1 border-t border-[#EDE7DA]">
                    <span>Attending Vet: <strong>{c.vetName}</strong></span>
                    <Link
                      to={`/digital-passport/${c.animalId || c.tagNumber}`}
                      className="text-xs font-bold text-[#D96B43] hover:underline"
                    >
                      View Animal 360° &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* MODAL: LOG CLINICAL TREATMENT & VACCINATION */}
      {showCaseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F8F3EA] rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#DFD3BF] shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2 text-[#D96B43]">
                <Stethoscope className="w-5 h-5" />
                <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                  Log Clinical Treatment & Update Digital Passport
                </h3>
              </div>
              <button
                onClick={() => setShowCaseModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F3EA] hover:bg-[#EDE7DA] flex items-center justify-center text-[#7A7A70]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCase} className="space-y-3 text-xs">
              
              {/* Select Patient Animal */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Select Patient Animal (From Passports)</label>
                <select
                  value={caseForm.animalId}
                  onChange={(e) => {
                    const selected = passports.find(p => p.id === e.target.value);
                    if (selected) {
                      setCaseForm(prev => ({
                        ...prev,
                        animalId: selected.id,
                        tagNumber: selected.tagNumber,
                        breed: selected.breed,
                        farmerName: selected.owner?.name || 'Ramesh Patel',
                        farmerMobile: selected.owner?.mobile || '+91 98765 43210'
                      }));
                    }
                  }}
                  className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2.5 text-xs text-[#2A2A28]"
                >
                  {passports.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.breed} — {p.tagNumber} ({p.owner?.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Clinical Diagnosis */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Veterinary Diagnosis</label>
                <input
                  type="text"
                  required
                  value={caseForm.diagnosis}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="e.g. Acute Mastitis / Foot Rot / Normal Gestation"
                  className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28]"
                />
              </div>

              {/* Symptoms */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Observed Symptoms & Vitals</label>
                <textarea
                  rows={2}
                  required
                  value={caseForm.symptoms}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="Body temp 102.5°F, swelling in teat, reduced cud chewing..."
                  className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl p-3 text-xs text-[#2A2A28]"
                />
              </div>

              {/* Treatment Given */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Rx Treatment & Prescription</label>
                <textarea
                  rows={2}
                  required
                  value={caseForm.treatmentGiven}
                  onChange={(e) => setCaseForm(prev => ({ ...prev, treatmentGiven: e.target.value }))}
                  placeholder="Intramammary Cloxacillin 300mg + Meloxicam 15ml + warm antiseptic compression..."
                  className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl p-3 text-xs text-[#2A2A28]"
                />
              </div>

              {/* Vaccination and Health Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Administer Vaccine (Optional)</label>
                  <select
                    value={caseForm.vaccinationGiven}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, vaccinationGiven: e.target.value }))}
                    className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28]"
                  >
                    <option value="">No Vaccine Today</option>
                    <option value="FMD (Foot & Mouth) Booster">FMD Booster</option>
                    <option value="HS (Haemorrhagic Septicaemia)">HS Vaccine</option>
                    <option value="BQ (Black Quarter)">BQ Vaccine</option>
                    <option value="LSD (Lumpy Skin Disease)">LSD Vaccine</option>
                    <option value="Brucellosis S19">Brucellosis S19</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Update Patient Health Status</label>
                  <select
                    value={caseForm.healthStatus}
                    onChange={(e) => setCaseForm(prev => ({ ...prev, healthStatus: e.target.value }))}
                    className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28]"
                  >
                    <option value="Healthy">✓ Healthy</option>
                    <option value="Under Treatment">⚠️ Under Treatment</option>
                    <option value="Pregnant">🤰 Pregnant</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-950 rounded-2xl border border-emerald-200 text-[11px]">
                ✓ Saving this case sheet will automatically update <strong>{caseForm.breed} ({caseForm.tagNumber})'s</strong> Digital Passport and reflect on the Farmer's dashboard.
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCaseModal(false)}
                  className="flex-1 bg-[#F4EDE0] border border-[#DFD3BF] py-2.5 rounded-xl font-bold text-[#7A7A70]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#324E38] hover:bg-[#253D2A] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Save & Sync to Passport
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
