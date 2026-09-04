import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  Camera,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
  Info,
  Sparkles,
  History,
  FileText,
  BadgeAlert,
  HelpCircle,
  RefreshCw,
  Plus
} from 'lucide-react';
import EyeCaptureModal from '../components/EyeCaptureModal';

export default function Identity({ user }) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'verify' | 'update'
  const [demoAnimals, setDemoAnimals] = useState([]);
  const [selectedDemoTag, setSelectedDemoTag] = useState('');

  // Register state
  const [regTagId, setRegTagId] = useState('123456789012');
  const [regAnimalType, setRegAnimalType] = useState('Cattle');
  const [regBreed, setRegBreed] = useState('Gir Cow');
  const [regAgeMonths, setRegAgeMonths] = useState(3);
  const [regGrowthStage, setRegGrowthStage] = useState('Calf');
  const [regEyeFile, setRegEyeFile] = useState(null);
  const [regEyePreview, setRegEyePreview] = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regResult, setRegResult] = useState(null);
  const [regError, setRegError] = useState(null);

  // Verify state
  const [verTagId, setVerTagId] = useState('123456789012');
  const [verEyeFile, setVerEyeFile] = useState(null);
  const [verEyePreview, setVerEyePreview] = useState(null);
  const [verLoading, setVerLoading] = useState(false);
  const [verResult, setVerResult] = useState(null);
  const [verError, setVerError] = useState(null);

  // Update Biometric state
  const [updTagId, setUpdTagId] = useState('123456789012');
  const [updCurrentAge, setUpdCurrentAge] = useState(24);
  const [updGrowthStage, setUpdGrowthStage] = useState('Adult');
  const [updEyeFile, setUpdEyeFile] = useState(null);
  const [updEyePreview, setUpdEyePreview] = useState(null);
  const [updLoading, setUpdLoading] = useState(false);
  const [updResult, setUpdResult] = useState(null);
  const [updError, setUpdError] = useState(null);
  const [selectedAnimalRecord, setSelectedAnimalRecord] = useState(null);

  // Modal capture state
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [captureTarget, setCaptureTarget] = useState('reg'); // 'reg' | 'ver' | 'upd'

  // Fetch demo animals on mount
  useEffect(() => {
    fetch('/api/identity/demo/animals')
      .then((res) => res.json())
      .then((data) => setDemoAnimals(data))
      .catch(() => {});
  }, []);

  // Fetch animal record when update tag changes
  useEffect(() => {
    if (updTagId && updTagId.length === 12) {
      fetch(`/api/identity/${updTagId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.found) {
            setSelectedAnimalRecord(data);
          } else {
            setSelectedAnimalRecord(null);
          }
        })
        .catch(() => setSelectedAnimalRecord(null));
    }
  }, [updTagId]);

  const openCapture = (target) => {
    setCaptureTarget(target);
    setIsCaptureModalOpen(true);
  };

  const handleImageCaptured = (file, previewUrl) => {
    if (captureTarget === 'reg') {
      setRegEyeFile(file);
      setRegEyePreview(previewUrl);
    } else if (captureTarget === 'ver') {
      setVerEyeFile(file);
      setVerEyePreview(previewUrl);
    } else if (captureTarget === 'upd') {
      setUpdEyeFile(file);
      setUpdEyePreview(previewUrl);
    }
  };

  // 1. REGISTER SUBMISSION
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regEyeFile) {
      setRegError('Please capture or upload an eye biometric photo.');
      return;
    }

    setRegLoading(true);
    setRegError(null);
    setRegResult(null);

    const formData = new FormData();
    formData.append('bpaTagId', regTagId);
    formData.append('animalType', regAnimalType);
    formData.append('breed', regBreed);
    formData.append('ageMonths', regAgeMonths);
    formData.append('growthStage', regGrowthStage);
    formData.append('eyeSide', 'right');
    formData.append('eyeImage', regEyeFile);

    try {
      const res = await fetch('/api/identity/register', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setRegError(data.detail || data.message || 'Registration failed.');
      } else {
        setRegResult(data);
      }
    } catch (err) {
      setRegError('Network error connecting to biometric server.');
    } finally {
      setRegLoading(false);
    }
  };

  // 2. VERIFY SUBMISSION
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verEyeFile) {
      setVerError('Please capture or upload an eye biometric photo.');
      return;
    }

    setVerLoading(true);
    setVerError(null);
    setVerResult(null);

    const formData = new FormData();
    formData.append('bpaTagId', verTagId);
    formData.append('eyeImage', verEyeFile);

    try {
      const res = await fetch('/api/identity/verify', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setVerResult(data);
    } catch (err) {
      setVerError('Network error connecting to biometric verification server.');
    } finally {
      setVerLoading(false);
    }
  };

  // 3. UPDATE BIOMETRIC SUBMISSION (CALF LIFECYCLE)
  const handleUpdateBiometric = async (e) => {
    e.preventDefault();
    if (!updEyeFile) {
      setUpdError('Please capture or upload a new eye biometric photo for re-enrollment.');
      return;
    }

    setUpdLoading(true);
    setUpdError(null);
    setUpdResult(null);

    const formData = new FormData();
    formData.append('bpaTagId', updTagId);
    formData.append('currentAgeMonths', updCurrentAge);
    formData.append('newGrowthStage', updGrowthStage);
    formData.append('forceUpdate', 'true');
    formData.append('eyeImage', updEyeFile);

    try {
      const res = await fetch('/api/identity/update-biometric', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setUpdError(data.detail || data.message || 'Biometric update rejected.');
      } else {
        setUpdResult(data);
        // Refresh animal record
        fetch(`/api/identity/${updTagId}`)
          .then((r) => r.json())
          .then((d) => d.found && setSelectedAnimalRecord(d))
          .catch(() => {});
      }
    } catch (err) {
      setUpdError('Network error connecting to biometric service.');
    } finally {
      setUpdLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* PAGE HEADER */}
      <div className="bg-[#F5EBE1] border border-[#EADBD0] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-soft">
        
        {/* Decorative floating photos */}
        <img src="/breeds/gir.jpg" alt="" className="absolute right-4 top-3 w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-2xl opacity-15 rotate-6 pointer-events-none select-none" />
        <img src="/breeds/murrah.jpg" alt="" className="absolute right-28 sm:right-36 bottom-2 w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl opacity-15 -rotate-6 pointer-events-none select-none" />
        <img src="/breeds/calf.jpg" alt="" className="absolute right-2 bottom-1 w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-2xl opacity-15 rotate-3 pointer-events-none select-none" />

        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF8] text-[#D96B43] text-xs font-bold shadow-xs">
            <img src="/stickers/iris_scan.jpg" alt="" className="w-4 h-4 rounded-sm object-cover" />
            <span>Iris-Based Biometric Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-[#2A2A28]">
            Animal Identity & Verification
          </h1>
          <p className="text-xs sm:text-sm text-[#5A5A50] leading-relaxed">
            Individual bovine physical identity verification via high-resolution iris biometric templates.
            Coupled with official 12-digit Bharat Pashudhan (BPA) / Pashu Aadhaar ear-tag records,
            enabling seamless <strong>Calf-to-Adult biometric lifecycle management</strong>.
          </p>
        </div>

        {/* PROPOSED FUTURE INTEGRATION NOTICE (Specification #2) */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#FFFDF8]/90 border border-[#DFD3BF] flex items-start gap-2.5 text-xs text-[#5A5A50] relative z-10">
          <Info className="w-4 h-4 text-[#D96B43] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#2A2A28] block">
              Proposed Future Integration · Mock BPA Repository Active
            </span>
            <span>
              Official 12-digit animal identity is maintained by the national Bharat Pashudhan (BPA/INAPH) ear-tag database.
              Breedify introduces iris biometrics as an additional physical verification layer.
              Demonstration records are simulated using mock tag IDs.
            </span>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex bg-[#F4EDE0] p-1.5 rounded-2xl border border-[#DFD3BF] shadow-xs gap-1.5">
        {[
          { id: 'register', label: '1. Register Animal', icon: Plus, desc: 'Initial biometric enrollment (V1)' },
          { id: 'verify', label: '2. Verify Animal', icon: ShieldCheck, desc: 'Multi-template identity check' },
          { id: 'update', label: '3. Update Biometric', icon: History, desc: 'Calf-to-adult re-enrollment' }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setRegResult(null);
                setVerResult(null);
                setUpdResult(null);
                setRegError(null);
                setVerError(null);
                setUpdError(null);
              }}
              className={`flex-1 py-3 px-3 rounded-xl text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#324E38] text-white shadow-sm'
                  : 'text-[#5A5A50] hover:bg-[#FDFBF7]'
              }`}
            >
              <div className="flex items-center gap-2">
                <IconComp className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-[#7A7A70]'}`} />
                <span className="text-xs font-bold block truncate">{tab.label}</span>
              </div>
              <span className={`text-[10px] block mt-0.5 truncate ${isActive ? 'text-neutral-300' : 'text-[#8A8A80]'}`}>
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: REGISTER ANIMAL */}
      {/* ============================================================ */}
      {activeTab === 'register' && (
        <div className="bg-[#F4EDE0] rounded-3xl border border-[#DFD3BF] p-6 sm:p-8 shadow-soft space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#2A2A28]">Register New Animal Biometric</h2>
            <p className="text-xs text-[#7A7A70]">
              Enroll an animal with its official 12-digit BPA Tag ID and generate Template V1.
            </p>
          </div>

          {/* QUICK DEMO TAG SELECTOR */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase text-[#7A7A70]">Quick-Fill Demo BPA Tag IDs:</span>
            <div className="flex flex-wrap gap-2">
              {demoAnimals.map((d) => (
                <button
                  key={d.bpa_tag_id}
                  type="button"
                  onClick={() => {
                    setRegTagId(d.bpa_tag_id);
                    setRegAnimalType(d.animal_type);
                    setRegBreed(d.breed);
                    setRegAgeMonths(d.initial_age_months || 3);
                    setRegGrowthStage(d.initial_registration_stage || 'Calf');
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FDFBF7] border border-[#DFD3BF] hover:border-[#D96B43] hover:text-[#D96B43] transition-colors cursor-pointer"
                >
                  {d.bpa_tag_id} ({d.breed} · {d.initial_registration_stage})
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Step 1: BPA Tag ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2A2A28]">
                  Step 1: BPA Tag ID (12-Digit Pashu Aadhaar)
                </label>
                <input
                  type="text"
                  value={regTagId}
                  onChange={(e) => setRegTagId(e.target.value)}
                  placeholder="e.g. 123456789012"
                  maxLength={12}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD3BF] text-xs font-mono font-bold text-[#2A2A28] focus:outline-hidden focus:border-[#D96B43]"
                  required
                />
                <span className="text-[10px] text-[#7A7A70] block">Official physical ear-tag number</span>
              </div>

              {/* Step 2: Animal Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2A2A28]">Step 2: Animal Type</label>
                <div className="flex gap-2">
                  {['Cattle', 'Buffalo'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setRegAnimalType(type)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        regAnimalType === type
                          ? 'bg-[#324E38] text-white border-[#324E38]'
                          : 'bg-[#FFFDF8] text-[#4A4A40] border-[#DFD3BF] hover:border-[#324E38]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breed */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2A2A28]">Breed Name</label>
                <input
                  type="text"
                  value={regBreed}
                  onChange={(e) => setRegBreed(e.target.value)}
                  placeholder="e.g. Gir Cow, Murrah Buffalo"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD3BF] text-xs text-[#2A2A28] focus:outline-hidden focus:border-[#D96B43]"
                  required
                />
              </div>

              {/* Step 3 & 4: Age & Growth Stage */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2A2A28]">Step 3: Age (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={regAgeMonths}
                    onChange={(e) => setRegAgeMonths(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD3BF] text-xs font-bold text-[#2A2A28]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2A2A28]">Step 4: Stage</label>
                  <select
                    value={regGrowthStage}
                    onChange={(e) => setRegGrowthStage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD3BF] text-xs font-bold text-[#2A2A28]"
                  >
                    <option value="Calf">Calf (0-6 mo)</option>
                    <option value="Juvenile">Juvenile (6-18 mo)</option>
                    <option value="Adult">Adult (18+ mo)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Step 5: Biometric Capture (REQUIRED: [ 📷 Capture with Camera ] OR [ 📁 Upload Image ]) */}
            <div className="space-y-2 pt-2 border-t border-[#EDE7DA]">
              <label className="text-xs font-bold text-[#2A2A28] block">
                Step 5: Biometric Eye Capture
              </label>

              <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#DFD3BF] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {regEyePreview ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500 bg-black shrink-0">
                      <img src={regEyePreview} alt="Eye" className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                        ✓
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#FFFDF8] border border-dashed border-[#DFD3BF] flex items-center justify-center text-[#A0B5A2] shrink-0">
                      <Eye className="w-8 h-8 opacity-50" />
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#2A2A28] block">
                      {regEyeFile ? 'Eye Image Ready for Processing' : 'No Eye Image Selected'}
                    </span>
                    <span className="text-[10px] text-[#7A7A70] block">
                      Both camera capture and image upload enter the same 6-stage iris pipeline.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => openCapture('reg')}
                    className="flex-1 sm:flex-initial bg-[#D96B43] hover:bg-[#C25832] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>📷 Capture with Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openCapture('reg')}
                    className="flex-1 sm:flex-initial bg-[#FFFDF8] border border-[#DFD3BF] hover:border-[#324E38] text-[#4A4A40] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>📁 Upload Image</span>
                  </button>
                </div>
              </div>
            </div>

            {regError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={regLoading}
              className="w-full py-3 rounded-xl bg-[#324E38] hover:bg-[#253D2A] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {regLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Iris Segmentation & Quality Checks...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Register Biometric Template (V1)</span>
                </>
              )}
            </button>
          </form>

          {/* REGISTRATION SUCCESS RESULT */}
          {regResult && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Animal Biometric Enrolled Successfully</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF5EB] p-3.5 rounded-xl border border-emerald-100 text-xs">
                <div>
                  <span className="text-[10px] text-[#7A7A70] block">BPA Tag ID</span>
                  <span className="font-mono font-bold text-[#2A2A28]">{regResult.bpa_tag_id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A7A70] block">Initial Version</span>
                  <span className="font-bold text-emerald-700">{regResult.template_version}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A7A70] block">Registration Stage</span>
                  <span className="font-bold text-[#2A2A28]">{regResult.registration_stage}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7A7A70] block">Quality Score</span>
                  <span className="font-bold text-[#2A2A28]">{(regResult.quality_score * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* SCIENTIFIC DISCLAIMER (Specification #3) */}
              <div className="text-[11px] text-emerald-900 bg-emerald-100/60 p-3 rounded-xl leading-relaxed">
                <strong>Scientific Lifecycle Note:</strong> {regResult.scientific_note}
              </div>

              {regResult.potential_duplicate_warning && (
                <div className="p-3 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Potential Duplicate Screening Alert</span>
                  </div>
                  <p>{regResult.potential_duplicate_warning.message}</p>
                  <p className="text-[10px] font-mono">
                    Existing BPA Tag ID: {regResult.potential_duplicate_warning.details.matched_bpa_tag_id}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: VERIFY ANIMAL */}
      {/* ============================================================ */}
      {activeTab === 'verify' && (
        <div className="bg-[#F4EDE0] rounded-3xl border border-[#DFD3BF] p-6 sm:p-8 shadow-soft space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#2A2A28]">Physical Animal Biometric Verification</h2>
            <p className="text-xs text-[#7A7A70]">
              Capture or upload an animal eye image to verify physical identity against all enrolled lifecycle templates.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2A2A28]">BPA Tag ID to Verify</label>
                <input
                  type="text"
                  value={verTagId}
                  onChange={(e) => setVerTagId(e.target.value)}
                  placeholder="e.g. 123456789012"
                  maxLength={12}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD3BF] text-xs font-mono font-bold text-[#2A2A28] focus:outline-hidden focus:border-[#D96B43]"
                  required
                />
              </div>

              {/* Demo quick selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#7A7A70]">Quick Select Demo Tag</label>
                <select
                  value={verTagId}
                  onChange={(e) => setVerTagId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD3BF] text-xs text-[#2A2A28]"
                >
                  {demoAnimals.map((d) => (
                    <option key={d.bpa_tag_id} value={d.bpa_tag_id}>
                      {d.bpa_tag_id} — {d.breed} ({d.initial_registration_stage})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Eye Capture */}
            <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#DFD3BF] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {verEyePreview ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500 bg-black shrink-0">
                    <img src={verEyePreview} alt="Eye" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#FFFDF8] border border-dashed border-[#DFD3BF] flex items-center justify-center text-[#A0B5A2] shrink-0">
                    <Eye className="w-8 h-8 opacity-50" />
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-[#2A2A28] block">
                    {verEyeFile ? 'Query Eye Image Ready' : 'Capture Query Eye Image'}
                  </span>
                  <span className="text-[10px] text-[#7A7A70] block">
                    Evaluated against all enrolled biometric templates across lifecycle.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => openCapture('ver')}
                  className="flex-1 sm:flex-initial bg-[#D96B43] hover:bg-[#C25832] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>📷 Capture with Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => openCapture('ver')}
                  className="flex-1 sm:flex-initial bg-[#FFFDF8] border border-[#DFD3BF] hover:border-[#324E38] text-[#4A4A40] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>📁 Upload Image</span>
                </button>
              </div>
            </div>

            {verError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{verError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={verLoading}
              className="w-full py-3 rounded-xl bg-[#324E38] hover:bg-[#253D2A] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {verLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Running Multi-Template Biometric Matching...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Verify Physical Identity</span>
                </>
              )}
            </button>
          </form>

          {/* VERIFICATION RESULT DECISION CARD */}
          {verResult && (
            <div className="space-y-4 animate-in fade-in">
              {/* Decision Badge Card */}
              <div
                className={`p-5 rounded-2xl border ${
                  verResult.decision === 'VERIFIED'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : verResult.decision === 'POSSIBLE_MATCH'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : verResult.decision === 'LOW_QUALITY'
                    ? 'bg-orange-50 border-orange-300 text-orange-950'
                    : 'bg-red-50 border-red-300 text-red-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {verResult.decision === 'VERIFIED' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                    {verResult.decision === 'POSSIBLE_MATCH' && <AlertTriangle className="w-6 h-6 text-amber-600" />}
                    {verResult.decision === 'LOW_QUALITY' && <AlertTriangle className="w-6 h-6 text-orange-600" />}
                    {verResult.decision === 'NO_MATCH' && <XCircle className="w-6 h-6 text-red-600" />}

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider block opacity-70">
                        Identity Verification Verdict
                      </span>
                      <span className="text-lg font-editorial font-bold">
                        {verResult.decision}
                      </span>
                    </div>
                  </div>

                  {verResult.best_match && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold opacity-70 block">Best Matching Version</span>
                      <span className="text-xs font-bold font-mono">
                        {verResult.best_match.template_version} ({verResult.best_match.growth_stage})
                      </span>
                    </div>
                  )}
                </div>

                {verResult.message && (
                  <p className="text-xs mt-2 opacity-90">{verResult.message}</p>
                )}
              </div>

              {/* Version Comparison Breakdown (Specification #17) */}
              {verResult.version_breakdown && verResult.version_breakdown.length > 0 && (
                <div className="bg-[#FAF5EB] p-4 rounded-2xl border border-[#DFD3BF] space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#2A2A28]">
                    <span>Multi-Template Lifecycle Comparison</span>
                    <span className="text-[10px] text-[#7A7A70]">
                      Total Enrolled Versions: {verResult.version_breakdown.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {verResult.version_breakdown.map((vb, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs space-y-1 ${
                          vb.status === 'VERIFIED'
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                            : vb.status === 'POSSIBLE_MATCH'
                            ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                            : 'bg-neutral-50 border-[#EDE7DA] text-[#5A5A50]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>Template {vb.template_version}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/80">
                            {vb.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#7A7A70]">
                          Stage: {vb.growth_stage} ({vb.animal_age_months} mo)
                        </div>
                        <div className="text-[11px] font-mono">
                          Similarity: {(vb.similarity_score * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: UPDATE BIOMETRIC (CALF LIFECYCLE RE-ENROLLMENT) */}
      {/* ============================================================ */}
      {activeTab === 'update' && (
        <div className="bg-[#F4EDE0] rounded-3xl border border-[#DFD3BF] p-6 sm:p-8 shadow-soft space-y-6">
          
          {/* CALF ELIGIBILITY BANNER (Specification #11) */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 leading-relaxed">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>Calf-to-Adult Biometric Lifecycle Innovation</span>
            </div>
            <p>
              <strong>Scientific Rule:</strong> Biometric updates are intended for animals originally enrolled during the calf stage.
              As the bovine matures, authorized users re-enroll updated biometric templates, preserving prior templates throughout the animal's lifecycle.
            </p>
          </div>

          {/* Select animal to update */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2A2A28]">Existing BPA Tag ID</label>
              <input
                type="text"
                value={updTagId}
                onChange={(e) => setUpdTagId(e.target.value)}
                placeholder="123456789012"
                maxLength={12}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD3BF] text-xs font-mono font-bold text-[#2A2A28]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#7A7A70]">Quick Select Demo Calf</label>
              <select
                value={updTagId}
                onChange={(e) => setUpdTagId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD3BF] text-xs text-[#2A2A28]"
              >
                <option value="123456789012">123456789012 — Gir Cow (Calf-origin, 24 mo)</option>
                <option value="345678901234">345678901234 — Sahiwal Cow (Calf-origin, 18 mo)</option>
                <option value="234567890123">234567890123 — Murrah Buffalo (Juvenile origin — ineligibility test)</option>
              </select>
            </div>
          </div>

          {/* ANIMAL PROFILE & BIOMETRIC HISTORY PREVIEW */}
          {selectedAnimalRecord && selectedAnimalRecord.found && (
            <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#DFD3BF] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#2A2A28] text-sm block">
                    {selectedAnimalRecord.animal.breed} ({selectedAnimalRecord.animal.animal_type})
                  </span>
                  <span className="text-[11px] text-[#7A7A70]">
                    Original Registration: <strong>{selectedAnimalRecord.animal.registration_stage}</strong> ({selectedAnimalRecord.animal.registration_age_months} months)
                  </span>
                </div>

                <div className="text-right">
                  {selectedAnimalRecord.biometric_update_allowed ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✓ Calf Lifecycle Eligible
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-200 text-neutral-800">
                      Standard Registration
                    </span>
                  )}
                </div>
              </div>

              {/* BIOMETRIC HISTORY TIMELINE (Specification #12) */}
              <div className="pt-2 border-t border-[#EDE7DA] space-y-2">
                <span className="text-[10px] font-black uppercase text-[#7A7A70] block">
                  Enrolled Biometric Templates Lifecycle History:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedAnimalRecord.biometric_templates.map((t, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[#FAF5EB] border border-[#DFD3BF] text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between font-bold text-[#D96B43]">
                        <span>Template {t.template_version_identifier}</span>
                        <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 rounded-sm">
                          Verified
                        </span>
                      </div>
                      <div className="text-[11px] text-[#2A2A28] font-semibold">{t.growth_stage}</div>
                      <div className="text-[10px] text-[#7A7A70]">{t.animal_age_months} months old</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* UPDATE FORM */}
          <form onSubmit={handleUpdateBiometric} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2A2A28]">Updated Current Age (Months)</label>
                <input
                  type="number"
                  min="1"
                  max="240"
                  value={updCurrentAge}
                  onChange={(e) => setUpdCurrentAge(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD3BF] text-xs font-bold text-[#2A2A28]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2A2A28]">Updated Growth Stage</label>
                <select
                  value={updGrowthStage}
                  onChange={(e) => setUpdGrowthStage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD3BF] text-xs font-bold text-[#2A2A28]"
                >
                  <option value="Juvenile">Juvenile (6-18 mo)</option>
                  <option value="Adult">Adult (18+ mo)</option>
                </select>
              </div>
            </div>

            {/* New Biometric Capture */}
            <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#DFD3BF] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {updEyePreview ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500 bg-black shrink-0">
                    <img src={updEyePreview} alt="Eye" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#FFFDF8] border border-dashed border-[#DFD3BF] flex items-center justify-center text-[#A0B5A2] shrink-0">
                    <Eye className="w-8 h-8 opacity-50" />
                  </div>
                )}
                <div>
                  <span className="text-xs font-bold text-[#2A2A28] block">
                    {updEyeFile ? 'New Biometric Captured' : 'Capture Matured Animal Eye'}
                  </span>
                  <span className="text-[10px] text-[#7A7A70] block">
                    Will append next template version (e.g. V3) while retaining previous calf templates.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => openCapture('upd')}
                  className="flex-1 sm:flex-initial bg-[#D96B43] hover:bg-[#C25832] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>📷 Capture with Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => openCapture('upd')}
                  className="flex-1 sm:flex-initial bg-[#FFFDF8] border border-[#DFD3BF] hover:border-[#324E38] text-[#4A4A40] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>📁 Upload Image</span>
                </button>
              </div>
            </div>

            {updError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{updError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={updLoading}
              className="w-full py-3 rounded-xl bg-[#324E38] hover:bg-[#253D2A] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {updLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Identity & Appending Lifecycle Template...</span>
                </>
              ) : (
                <>
                  <History className="w-4 h-4 text-amber-300" />
                  <span>Add New Biometric Template (Retain Previous)</span>
                </>
              )}
            </button>
          </form>

          {/* UPDATE SUCCESS RESULT */}
          {updResult && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Lifecycle Biometric Updated Successfully</span>
              </div>

              <div className="text-xs text-emerald-900 bg-[#FAF5EB] p-3.5 rounded-xl border border-emerald-100 space-y-2">
                <div className="font-bold">
                  New Template {updResult.new_template_version} Enrolled as {updResult.growth_stage} ({updResult.current_age_months} months).
                </div>
                <div className="text-[11px] text-[#5A5A50]">
                  All {updResult.retained_templates_count} lifecycle templates are securely retained in the verification registry.
                </div>
              </div>

              {/* Updated History Table */}
              {updResult.lifecycle_history && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-[#7A7A70] block">
                    Updated Active Biometric Templates:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {updResult.lifecycle_history.map((h, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-[#FAF5EB] border border-[#DFD3BF] text-xs space-y-0.5"
                      >
                        <div className="font-bold text-[#D96B43] flex items-center justify-between">
                          <span>{h.template_version_identifier}</span>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded-sm">
                            Active
                          </span>
                        </div>
                        <div className="text-[11px] text-[#2A2A28]">{h.growth_stage}</div>
                        <div className="text-[10px] text-[#7A7A70]">{h.animal_age_months} months</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* REUSABLE EYE CAPTURE MODAL */}
      <EyeCaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onImageCaptured={handleImageCaptured}
        title={
          captureTarget === 'reg'
            ? 'Register Animal Eye Biometric'
            : captureTarget === 'ver'
            ? 'Verify Animal Eye Biometric'
            : 'Capture Mature Animal Eye Biometric'
        }
      />

    </div>
  );
}
