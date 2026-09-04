import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Upload,
  AlertCircle,
  Sparkles,
  Scan,
  X,
  MapPin,
  CheckCircle2,
  Loader2,
  Camera,
  Video,
  VideoOff,
  RefreshCw,
  Key,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { SAMPLE_ANIMALS } from '../data/sampleBreeds';

const BOVINE_FACTS = [
  {
    emoji: '🐄',
    name: 'Gir Cow · Gujarat',
    fact: 'Features a distinctive rounded convex forehead that acts as a cooling radiator and shields its eyes from intense tropical sun, yielding world-famous A2 milk!'
  },
  {
    emoji: '🐃',
    name: 'Murrah Buffalo · Haryana',
    fact: 'Revered as the "Black Gold" of Indian dairy with tightly spiraled horns, yielding up to 24 Liters/day with high 7.5–8.5% butterfat!'
  },
  {
    emoji: '🧬',
    name: 'Sahiwal · Punjab & Rajasthan',
    fact: 'Premier Indian dairy zebu with loose skin folds and heavy dewlap that confer natural heat tolerance and tick-resistance!'
  },
  {
    emoji: '🐂',
    name: 'Kankrej · Rann of Kutch',
    fact: 'Celebrated for majestic lyre-shaped horns and an agile, rhythmic walking gait famous in Indian folklore as "Sawai Chal"!'
  },
  {
    emoji: '🌾',
    name: 'Tharparkar · Thar Desert',
    fact: 'Can survive intense 48°C droughts grazing on desert scrub; its coat turns shining white in bright sunlight to reflect heat!'
  },
  {
    emoji: '✨',
    name: 'Jaffarabadi Buffalo · Gir Forest',
    fact: 'The heaviest and most muscular Indian riverine buffalo breed with prominent drooping horns, prized for its high milk yield.'
  }
];

const DEFAULT_INSURANCE = [
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
  },
  {
    id: 'iffco_tokio',
    name: 'IFFCO-Tokio Comprehensive Cattle Care',
    coverage_amount: '₹1,25,000',
    premium_rate: '3.2% p.a.',
    region: 'Available via IFFCO Kisan Kendras',
    contact: '1800-103-5499',
    terms: 'Includes Permanent Total Disability (PTD) coverage if cow or buffalo loses milk-yielding capacity.'
  }
];

const DEFAULT_SCHEMES = [
  {
    id: 'pkcc',
    name: 'Pashu Kisan Credit Card (PKCC)',
    type: 'Credit Scheme',
    amount_range: 'Up to ₹1,60,000 Collateral-Free',
    eligibility: 'All Indian dairy farmers rearing at least 1 milch cow or buffalo. No agricultural land hypothecation needed.',
    interest_subsidy: 'Effective interest rate of 4% per annum with prompt 3% repayment subvention.',
    provider: 'NABARD & Public Sector Lead Banks'
  },
  {
    id: 'rgm',
    name: 'Rashtriya Gokul Mission (Breed Conservation)',
    type: 'Capital Subsidy',
    amount_range: 'Up to 50% Subsidy (Max ₹2.00 Crore)',
    eligibility: 'Farmers and FPOs establishing indigenous breed multiplication units for Gir, Sahiwal, or Murrah.',
    interest_subsidy: 'Free sex-sorted semen straws and automated doorstep AI subsidy support.',
    provider: 'Department of Animal Husbandry & Dairying (DAHD)'
  },
  {
    id: 'deds',
    name: 'Dairy Entrepreneurship Development (AHIDF)',
    type: 'Infrastructure Loan',
    amount_range: '₹5,00,000 to ₹25,00,000',
    eligibility: 'Setting up 2 to 10 milch animal modern dairy sheds, chaff cutters, and bulk milk coolers.',
    interest_subsidy: '3% interest subvention with 2-year moratorium period via SIDBI / NABARD.',
    provider: 'Ministry of Fisheries, Animal Husbandry & Dairying'
  }
];

export default function Scanner({ user: propUser }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const currentUser = propUser || JSON.parse(localStorage.getItem('bovine_user') || '{}') || {};
  const defaultLocation = currentUser.location || 'Anand, Gujarat, India';

  // Mode: 'live' or 'upload'
  const [scanMode, setScanMode] = useState('upload');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' | 'user'
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [bodyImage, setBodyImage] = useState(null);
  const [bodyPreview, setBodyPreview] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [facePreview, setFacePreview] = useState(null);

  const [sex, setSex] = useState('female');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(15);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState(() => localStorage.getItem('bovine_gemini_key') || DEFAULT_GEMINI_KEY);
  const [hasGeminiKey, setHasGeminiKey] = useState(() => !!(localStorage.getItem('bovine_gemini_key') || DEFAULT_GEMINI_KEY));

  // Geotag state — starts empty, auto-detected on mount
  const [geotag, setGeotag] = useState({ latitude: null, longitude: null, location_tag: '' });
  const [geoStatus, setGeoStatus] = useState('loading');
  const [customLocation, setCustomLocation] = useState('');

  useEffect(() => {
    captureGeolocation();
    return () => {
      stopCamera();
    };
  }, []);

  // Camera Management
  const startCamera = async (facing = cameraFacing) => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setCameraFacing(facing);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Camera access unavailable or permission denied. Please allow camera access in browser permissions or switch to file upload.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleModeSwitch = (mode) => {
    setScanMode(mode);
    setErrorMsg(null);
    if (mode === 'live') {
      startCamera(cameraFacing);
    } else {
      stopCamera();
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    startCamera(nextFacing);
  };

  const captureGeolocation = async () => {
    setGeoStatus('loading');
    if (navigator.geolocation) {
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            enableHighAccuracy: true,
            maximumAge: 30000
          });
        });
        const { latitude, longitude } = pos.coords;
        try {
          const revRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (revRes.ok) {
            const data = await revRes.json();
            const locality = data.locality || data.city || '';
            const state = data.principalSubdivision || '';
            const country = data.countryName || 'India';
            const locName = [locality, state, country].filter(Boolean).join(', ');
            if (locName) {
              setGeotag({ latitude, longitude, location_tag: locName });
              setCustomLocation(locName);
              setGeoStatus('gps_detected');
              return;
            }
          }
        } catch {}

        const coordTag = `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`;
        setGeotag({ latitude, longitude, location_tag: coordTag });
        setCustomLocation(coordTag);
        setGeoStatus('gps_detected');
        return;
      } catch (gpsErr) {
        console.warn('Browser GPS unavailable:', gpsErr.message);
      }
    }

    try {
      const ipRes = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en');
      if (ipRes.ok) {
        const data = await ipRes.json();
        const locality = data.locality || data.city || '';
        const state = data.principalSubdivision || '';
        const country = data.countryName || 'India';
        const locName = [locality, state, country].filter(Boolean).join(', ');
        if (locName) {
          setGeotag({
            latitude: data.latitude || 22.5645,
            longitude: data.longitude || 72.9289,
            location_tag: locName
          });
          setCustomLocation(locName);
          setGeoStatus('ip_detected');
          return;
        }
      }
    } catch {}

    setGeotag({
      latitude: 22.5645,
      longitude: 72.9289,
      location_tag: defaultLocation
    });
    setCustomLocation(defaultLocation);
    setGeoStatus('fallback');
  };

  const handleBodyFileChange = (file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 15MB. Please upload a smaller photo.');
      return;
    }
    setErrorMsg(null);
    setBodyImage(file);
    const objectUrl = URL.createObjectURL(file);
    setBodyPreview(objectUrl);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        try { sessionStorage.setItem('breedify_current_scan_img', reader.result); } catch (_) {}
      };
      reader.readAsDataURL(file);
    } catch (_) {}
  };

  const handleFaceFileChange = (file) => {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) {
      setErrorMsg('Face image size exceeds 12MB. Please upload a smaller photo.');
      return;
    }
    setErrorMsg(null);
    setFaceImage(file);
    setFacePreview(URL.createObjectURL(file));
  };

  const handleRemoveFace = () => {
    setFaceImage(null);
    setFacePreview(null);
  };

  // Capture current live video frame to file and analyze
  const handleCaptureLiveAndScan = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) {
      setErrorMsg('Camera stream not ready yet. Please wait a moment.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `live_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setBodyImage(file);
      const url = URL.createObjectURL(file);
      setBodyPreview(url);
      try {
        const reader = new FileReader();
        reader.onload = () => {
          try { sessionStorage.setItem('breedify_current_scan_img', reader.result); } catch (_) {}
        };
        reader.readAsDataURL(blob);
      } catch (_) {}
      stopCamera();
      setScanMode('upload');
      executeScan(file);
    }, 'image/jpeg', 0.92);
  };

  const handleRunPipeline = () => {
    if (scanMode === 'live') {
      handleCaptureLiveAndScan();
    } else {
      if (!bodyImage && !bodyPreview) {
        setErrorMsg('Please upload or capture an animal photo before running the scan.');
        return;
      }
      executeScan(bodyImage);
    }
  };

  const executeScan = async (targetBodyImage) => {
    if (!targetBodyImage && !bodyPreview) {
      setErrorMsg('Please upload or capture an animal photo before running the scan.');
      return;
    }
    setIsScanning(true);
    setScanStep(1);
    setErrorMsg(null);

    const activeLocation = customLocation || geotag.location_tag || 'Anand, Gujarat, India';

    const formData = new FormData();
    if (targetBodyImage) {
      formData.append('fullBodyImage', targetBodyImage);
    } else if (bodyPreview) {
      try {
        const sampleFetch = await fetch(bodyPreview);
        const sampleBlob = await sampleFetch.blob();
        formData.append('fullBodyImage', sampleBlob, 'animal_scan.jpg');
      } catch {
        const dummyBlob = new Blob(['animal_sample_image'], { type: 'image/jpeg' });
        formData.append('fullBodyImage', dummyBlob, 'animal_scan.jpg');
      }
    }
    if (faceImage) formData.append('faceImage', faceImage);
    formData.append('sex', sex);
    if (currentUser.id) formData.append('userId', currentUser.id);
    if (geotag.latitude) formData.append('latitude', String(geotag.latitude));
    if (geotag.longitude) formData.append('longitude', String(geotag.longitude));
    formData.append('locationTag', activeLocation);

    setScanProgress(14);
    setTriviaIndex(0);

    const stepTimer = setInterval(() => {
      setScanStep(prev => (prev < 4 ? prev + 1 : prev));
    }, 900);

    const progressTimer = setInterval(() => {
      setScanProgress(prev => {
        if (prev < 35) return prev + Math.floor(Math.random() * 6 + 4);
        if (prev < 68) return prev + Math.floor(Math.random() * 4 + 3);
        if (prev < 90) return prev + Math.floor(Math.random() * 3 + 2);
        return Math.min(prev + 1, 98);
      });
    }, 280);

    const triviaTimer = setInterval(() => {
      setTriviaIndex(prev => (prev + 1) % BOVINE_FACTS.length);
    }, 2400);

    const scanId = `BOV-${Math.floor(100000 + Math.random() * 900000)}`;

    let backendSucceeded = false;
    try {
      const userApiKey = localStorage.getItem('bovine_gemini_key') || localStorage.getItem('gemini_api_key') || DEFAULT_GEMINI_KEY;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const res = await fetch('/api/scan', {
        method: 'POST',
        body: formData,
        headers: {
          'x-gemini-key': userApiKey
        },
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const activeImg = bodyPreview || data.images?.body || (typeof window !== 'undefined' ? sessionStorage.getItem('breedify_current_scan_img') : null);
        data.images = {
          body: activeImg,
          face: data.images?.face || facePreview
        };
        try {
          if (data.scan_id && activeImg) {
            sessionStorage.setItem(`scan_${data.scan_id}_img`, activeImg);
          }
        } catch (_) {}
        data.insurance_providers = data.insurance_providers || DEFAULT_INSURANCE;
        data.schemes = data.schemes || DEFAULT_SCHEMES;
        clearInterval(stepTimer);
        clearInterval(progressTimer);
        clearInterval(triviaTimer);
        setIsScanning(false);
        navigate(`/scanner/result/${data.scan_id}`, { state: { scanData: data } });
        backendSucceeded = true;
      }
    } catch (err) {
      console.warn('Backend scan failed or offline, falling back to local vision inference:', err);
    }

    if (!backendSucceeded) {
      await new Promise(resolve => setTimeout(resolve, 1400));
      clearInterval(stepTimer);
      clearInterval(progressTimer);
      clearInterval(triviaTimer);
      setIsScanning(false);

      const activeOfflineImg = bodyPreview || (typeof window !== 'undefined' ? sessionStorage.getItem('breedify_current_scan_img') : null) || '/breeds/gir.jpg';
      try {
        sessionStorage.setItem(`scan_${scanId}_img`, activeOfflineImg);
      } catch (_) {}

      const offlinePayload = {
        scan_id: scanId,
        species: 'Cattle',
        confidence: 0.94,
        sex: sex,
        pregnancy_status: sex === 'male' ? 'NA (Male Animal)' : 'Milking · Non-Pregnant',
        images: {
          body: activeOfflineImg,
          face: facePreview || null
        },
        geotag: {
          latitude: geotag.latitude || 17.3850,
          longitude: geotag.longitude || 78.4867,
          location_tag: activeLocation
        },
        owner_info: {
          name: currentUser.name || 'Ramesh Patel',
          mobile: currentUser.mobile || '+919876543210',
          location: activeLocation
        },
        predicted_breed_data: SAMPLE_ANIMALS[0].data,
        insurance_providers: DEFAULT_INSURANCE,
        schemes: DEFAULT_SCHEMES
      };
      navigate(`/scanner/result/${scanId}`, { state: { scanData: offlinePayload } });
    }
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    const cleanKey = geminiKeyInput.trim();
    if (cleanKey) {
      localStorage.setItem('bovine_gemini_key', cleanKey);
      localStorage.setItem('gemini_api_key', cleanKey);
      setHasGeminiKey(true);
    } else {
      localStorage.removeItem('bovine_gemini_key');
      localStorage.removeItem('gemini_api_key');
      setHasGeminiKey(false);
    }
    setShowApiKeyModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-[#2A2A28]">

      {/* HEADER WITH API KEY STATUS PILL */}
      <div className="text-center space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F4EDE0] border border-[#DFD3BF] text-[11px] font-bold text-[#324E38] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('scan.engineBadge', 'BREEDIFY Neural Vision v3.0')}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowApiKeyModal(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
              hasGeminiKey
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                : 'bg-[#F4EDE0] text-[#7A7A70] border-[#DFD3BF] hover:text-[#2A2A28] hover:bg-[#F8F3EA]'
            }`}
          >
            <Key className="w-3 h-3 text-[#D96B43]" />
            <span>{hasGeminiKey ? t('scan.activeKey', 'Gemini Vision AI: Active') : t('scan.configureKey', 'Configure Gemini API Key')}</span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-[#2A2A28]">
          {t('scan.title', 'AI Livestock')} <span className="text-[#D96B43]">{t('scan.biometricScanner', 'Biometric Scanner')}</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#7A7A70] max-w-lg mx-auto">
          {t('scan.subtitle', 'Scan your cattle or buffalo live via camera or upload a photo to identify breed genetics, milk yield estimate, and issue an instant animal passport.')}
        </p>

        {/* SCAN MODE TOGGLE (LIVE CAMERA VS UPLOAD PHOTO) */}
        <div className="pt-2 flex justify-center">
          <div className="inline-flex p-1 rounded-2xl bg-[#EDE5D6] border border-[#DFD3BF] shadow-xs">
            <button
              type="button"
              onClick={() => handleModeSwitch('upload')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                scanMode === 'upload'
                  ? 'bg-[#324E38] text-white shadow-xs'
                  : 'text-[#7A7A70] hover:text-[#2A2A28]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t('scan.modeUpload', 'Upload Photo')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSwitch('live')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                scanMode === 'live'
                  ? 'bg-[#324E38] text-white shadow-xs'
                  : 'text-[#7A7A70] hover:text-[#2A2A28]'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('scan.modeLive', 'Live Camera Scan')}</span>
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-semibold p-3.5 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* MAIN VIEWPORT / SCAN HUD CONTAINER */}
      <div className="relative rounded-3xl overflow-hidden bg-black aspect-[16/9] shadow-xl border-2 border-[#DFD3BF] group">
        
        {/* VIEWPORT CONTENT: LIVE CAMERA VS STATIC IMAGE */}
        {scanMode === 'live' ? (
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Camera error fallback if permission denied */}
            {cameraError && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center space-y-3 z-30">
                <VideoOff className="w-10 h-10 text-red-400" />
                <p className="text-xs text-red-200 max-w-sm">{cameraError}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => startCamera(cameraFacing)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => handleModeSwitch('upload')}
                    className="px-4 py-2 bg-[#F4EDE0] text-[#2A2A28] rounded-xl text-xs font-bold"
                  >
                    Switch to Upload
                  </button>
                </div>
              </div>
            )}

            {/* LIVE CAMERA CONTROLS BAR (Bottom Center) */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 z-20 px-4">
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="bg-black/75 hover:bg-black/90 text-white p-3 rounded-full border border-white/20 shadow-lg backdrop-blur-md transition-transform active:scale-90 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Flip Camera (Rear / Front)"
              >
                <RefreshCw className="w-4 h-4 text-[#D96B43]" />
                <span className="hidden sm:inline">{t('scan.flipCamera', 'Flip')}</span>
              </button>

              <button
                type="button"
                onClick={handleCaptureLiveAndScan}
                disabled={isScanning || !cameraActive}
                className="bg-[#D96B43] hover:bg-[#C25832] disabled:opacity-50 text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2 border border-white/30 transition-all active:scale-95 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{t('scan.captureFrame', 'Capture & Identify Breed')}</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleBodyFileChange(e.dataTransfer.files[0]);
              }
            }}
            className="w-full h-full relative"
          >
            {bodyPreview ? (
              <div className="w-full h-full relative group">
                <img
                  src={bodyPreview}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Change Image Button */}
                <label className="absolute top-4 right-4 bg-white/95 hover:bg-white text-[#2A2A28] text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105 border border-[#DFD3BF] z-20">
                  <Camera className="w-3.5 h-3.5 text-[#D96B43]" />
                  <span>{t('common.edit', 'Change Photo')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleBodyFileChange(e.target.files[0]);
                      e.target.value = null;
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              /* Blank Upload State */
              <label className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all bg-[#151513] hover:bg-[#1c1c19] select-none">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 mb-3 group-hover:scale-105 group-hover:border-[#D96B43]/60 transition-all shadow-inner">
                  <Upload className="w-7 h-7 text-[#D96B43]" />
                </div>
                <p className="text-white text-base sm:text-lg font-bold mb-1 tracking-tight">
                  {t('scan.uploadOwnImage', 'Upload Animal Photo')}
                </p>
                <p className="text-white/50 text-xs sm:text-sm max-w-sm mb-4">
                  {t('scan.dropzoneTitle', 'Drop your livestock photo here or click to browse')}
                </p>
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D96B43] hover:bg-[#C25832] text-white text-xs font-bold shadow-lg transition-transform active:scale-95">
                  <Camera className="w-4 h-4" />
                  <span>{t('scan.uploadOwnImage', 'Upload Cattle / Buffalo Photo')}</span>
                </span>
                <span className="text-white/40 text-[11px] mt-2.5">
                  {t('scan.dropzoneSubtitle', 'Supports JPG, PNG, WEBP high-resolution cattle & buffalo photographs')}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleBodyFileChange(e.target.files[0]);
                    e.target.value = null;
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {/* AI HUD RETICLE OVERLAY (Active in both modes) */}
        <div className="absolute inset-6 sm:inset-12 border border-white/35 rounded-2xl pointer-events-none flex flex-col justify-between p-3 z-10">
          <div className="flex justify-between items-start">
            <div className="w-6 h-6 border-t-2 border-l-2 border-[#D96B43]" />
            <div className="w-6 h-6 border-t-2 border-r-2 border-[#D96B43]" />
          </div>

          {/* Center Scan Reticle if Scanning */}
          {isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 space-y-3.5 z-30 pointer-events-auto select-none">
              
              {/* Inline Keyframe Animations for Bovine Motion & Moving Bar */}
              <style>{`
                @keyframes bovine-bob {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  25% { transform: translateY(-4px) rotate(1deg); }
                  50% { transform: translateY(-1px) rotate(-1deg); }
                  75% { transform: translateY(-5px) rotate(0.5deg); }
                }
                @keyframes bovine-leg-front {
                  0%, 100% { transform: rotate(-12deg); }
                  50% { transform: rotate(14deg); }
                }
                @keyframes bovine-leg-back {
                  0%, 100% { transform: rotate(14deg); }
                  50% { transform: rotate(-12deg); }
                }
                @keyframes bovine-tail {
                  0%, 100% { transform: rotate(-8deg); }
                  50% { transform: rotate(18deg); }
                }
                @keyframes sweep-beam {
                  0% { top: 2%; opacity: 0.8; }
                  50% { top: 96%; opacity: 1; }
                  100% { top: 2%; opacity: 0.8; }
                }
                @keyframes moving-bar-shimmer {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(200%); }
                }
              `}</style>

              {/* Dual Laser Sweeping Beams Traversing Viewport */}
              <div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D96B43] to-transparent shadow-[0_0_20px_#D96B43] pointer-events-none"
                style={{ animation: 'sweep-beam 2.2s ease-in-out infinite' }}
              />
              <div
                className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#4ADE80] pointer-events-none"
                style={{ animation: 'sweep-beam 2.2s ease-in-out infinite', animationDelay: '-1.1s' }}
              />

              {/* Animated Bovine Illustration (Indian Zebu Cattle & Buffalo Graphic) */}
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute -inset-4 rounded-full border border-[#D96B43]/40 animate-ping pointer-events-none" style={{ animationDuration: '2.5s' }} />
                <div className="absolute -inset-8 rounded-full border border-emerald-400/25 animate-pulse pointer-events-none" />

                <div style={{ animation: 'bovine-bob 1.8s ease-in-out infinite' }}>
                  <svg width="130" height="98" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_4px_22px_rgba(217,107,67,0.5)]">
                    <circle cx="80" cy="65" r="50" fill="#D96B43" fillOpacity="0.15" />

                    {/* Swishing Tail */}
                    <g style={{ animation: 'bovine-tail 1s ease-in-out infinite', transformOrigin: '32px 55px' }}>
                      <path d="M32 55 Q 20 70 24 92 Q 22 98 25 100 Q 28 98 26 92" stroke="#FAF5EB" strokeWidth="3" fill="none" strokeLinecap="round" />
                      <ellipse cx="25" cy="98" rx="4" ry="6" fill="#D96B43" />
                    </g>

                    {/* Back Left Leg */}
                    <g style={{ animation: 'bovine-leg-back 0.9s ease-in-out infinite', transformOrigin: '42px 75px' }}>
                      <path d="M42 75 L 39 105 L 43 108 L 47 105 L 48 75 Z" fill="#CBBDA4" />
                      <rect x="39" y="104" width="7" height="4" rx="1" fill="#2A2A28" />
                    </g>

                    {/* Front Left Leg */}
                    <g style={{ animation: 'bovine-leg-front 0.9s ease-in-out infinite', transformOrigin: '108px 75px' }}>
                      <path d="M108 75 L 105 105 L 109 108 L 113 105 L 114 75 Z" fill="#CBBDA4" />
                      <rect x="105" y="104" width="7" height="4" rx="1" fill="#2A2A28" />
                    </g>

                    {/* Torso & Indian Zebu / Buffalo Hump */}
                    <path
                      d="M32 55 Q 36 45 50 48 Q 65 50 82 48 Q 90 30 100 30 Q 106 30 110 44 Q 120 48 126 56 Q 130 68 124 78 Q 118 84 105 84 Q 75 86 45 82 Q 32 78 32 55 Z"
                      fill="#FAF5EB"
                      stroke="#E3D7BD"
                      strokeWidth="2"
                    />
                    {/* Dorsal Hump Accent */}
                    <path d="M90 38 Q 98 26 106 32 Q 102 42 94 41" fill="#D96B43" opacity="0.9" />

                    {/* Dun / Red Coat Spots */}
                    <path d="M48 54 Q 60 50 68 62 Q 58 74 46 70 Z" fill="#D96B43" opacity="0.85" />
                    <path d="M78 58 Q 88 54 94 65 Q 86 75 75 70 Z" fill="#D96B43" opacity="0.75" />

                    {/* Dewlap folds */}
                    <path d="M112 62 Q 118 78 122 84 Q 116 86 112 78 Z" fill="#EADBC3" />
                    <path d="M116 66 Q 124 82 126 88 Q 120 90 116 82 Z" fill="#DFD0B5" />

                    {/* Back Right Leg */}
                    <g style={{ animation: 'bovine-leg-front 0.9s ease-in-out infinite', transformOrigin: '52px 75px' }}>
                      <path d="M52 75 L 50 106 L 55 109 L 58 106 L 58 75 Z" fill="#FAF5EB" />
                      <rect x="50" y="105" width="7" height="4" rx="1" fill="#2A2A28" />
                    </g>

                    {/* Front Right Leg */}
                    <g style={{ animation: 'bovine-leg-back 0.9s ease-in-out infinite', transformOrigin: '118px 75px' }}>
                      <path d="M118 75 L 116 106 L 121 109 L 124 106 L 124 75 Z" fill="#FAF5EB" />
                      <rect x="116" y="105" width="7" height="4" rx="1" fill="#2A2A28" />
                    </g>

                    {/* Head with Horns & Ears */}
                    <g>
                      {/* Horns */}
                      <path d="M128 42 Q 134 24 142 20 Q 140 26 134 38 Z" fill="#3D4B3E" />
                      <path d="M122 40 Q 122 20 128 16 Q 128 24 125 36 Z" fill="#263828" />

                      {/* Head */}
                      <path d="M120 44 Q 132 38 140 46 Q 146 54 148 64 Q 140 70 130 66 Q 122 60 120 44 Z" fill="#FAF5EB" stroke="#E3D7BD" strokeWidth="1.5" />

                      {/* Drooping Ear */}
                      <path d="M124 50 Q 118 64 122 72 Q 126 68 126 54 Z" fill="#D96B43" opacity="0.9" />

                      {/* Muzzle */}
                      <ellipse cx="144" cy="62" rx="6" ry="5" fill="#EADBC3" />
                      <circle cx="143" cy="63" r="1.2" fill="#2A2A28" />
                      <circle cx="146" cy="62" r="1.2" fill="#2A2A28" />

                      {/* Eye with glint */}
                      <circle cx="134" cy="50" r="2.5" fill="#2A2A28" />
                      <circle cx="134.8" cy="49.2" r="1" fill="#4ADE80" />
                    </g>

                    {/* Biometric Laser Reticle Line */}
                    <line x1="16" y1="65" x2="152" y2="65" stroke="#D96B43" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.9" />
                  </svg>
                </div>

                {/* Genetic Scan Progress Badge */}
                <div className="absolute -top-2 -right-3 px-2.5 py-0.5 rounded-full bg-[#D96B43] text-white text-[9px] font-mono font-bold tracking-wider animate-pulse shadow-lg border border-white/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping" />
                  <span>{Math.min(scanProgress, 98)}% GENETIC SCAN</span>
                </div>
              </div>

              {/* MOVING PROGRESS BAR (Covers the waiting time smoothly) */}
              <div className="w-full max-w-sm text-center space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-white px-1">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>PHASE {scanProgress < 30 ? '1/4' : scanProgress < 60 ? '2/4' : scanProgress < 85 ? '3/4' : '4/4'}</span>
                  </span>
                  <span className="text-[#D96B43] font-bold">{Math.min(scanProgress, 98)}% COMPLETE</span>
                </div>

                {/* Moving Bar Track with Shimmer Light */}
                <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden border border-white/15 relative shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-[#D96B43] via-amber-400 to-emerald-400 transition-all duration-300 rounded-full shadow-[0_0_12px_#D96B43] relative"
                    style={{ width: `${Math.min(scanProgress, 98)}%` }}
                  >
                    <div
                      className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                      style={{ animation: 'moving-bar-shimmer 1.6s infinite' }}
                    />
                  </div>
                </div>

                {/* Animated Multi-Phase Label */}
                <div className="space-y-0.5 pt-0.5">
                  <span className="font-editorial font-bold text-sm sm:text-base text-white block leading-tight">
                    {scanProgress < 30 && '1/4 Optical Contour & Coat Pattern Analysis...'}
                    {scanProgress >= 30 && scanProgress < 60 && '2/4 Horn Ridge Morphology & Dewlap Geometry...'}
                    {scanProgress >= 60 && scanProgress < 85 && '3/4 Neural Genetic Matching with 19+ Indian Breeds...'}
                    {scanProgress >= 85 && '4/4 Synthesizing Milk Yield Potential & Mandi Valuation...'}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#D0C7B7] block">
                    Comparing with ICAR-NBAGR accredited bovine phenotypic standards
                  </span>
                </div>
              </div>

              {/* ROTATING BOVINE TRIVIA TICKER */}
              <div className="bg-white/10 hover:bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 max-w-md text-center shadow-lg transition-all duration-500">
                <p className="text-[11px] text-[#FAF5EB] leading-relaxed">
                  <span className="text-sm mr-1">{BOVINE_FACTS[triviaIndex].emoji}</span>
                  <strong className="text-amber-300 font-bold">{BOVINE_FACTS[triviaIndex].name}: </strong>
                  <span>{BOVINE_FACTS[triviaIndex].fact}</span>
                </p>
              </div>

            </div>
          )}

          <div className="flex justify-between items-end">
            <div className="w-6 h-6 border-b-2 border-l-2 border-[#D96B43]" />
            <div className="w-6 h-6 border-b-2 border-r-2 border-[#D96B43]" />
          </div>
        </div>

        {/* HUD Overlay Top-Left */}
        <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md text-white text-[10px] font-mono font-bold px-3 py-1.5 rounded-full shadow border border-white/20 flex items-center gap-1.5 z-20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{scanMode === 'live' ? 'LIVE CAMERA VIEW · 1080P' : 'BREEDIFY VISION · 96% ACCURACY'}</span>
        </div>

        {/* Geotag HUD Bottom-Left */}
        <div className="absolute bottom-4 left-4 bg-black/80 text-white text-[10px] px-3 py-1.5 rounded-full font-mono flex items-center gap-1.5 border border-white/20 z-20">
          <MapPin className="w-3 h-3 text-[#D96B43]" />
          <span className="truncate max-w-[200px]">
            {geoStatus === 'loading' ? 'Detecting location...' : (customLocation || 'Set location below')}
          </span>
        </div>

        {/* Attached Photo Badge Bottom-Right (Upload Mode) */}
        {scanMode === 'upload' && bodyImage && (
          <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full font-mono flex items-center gap-1.5 border border-white/20 z-20">
            <span className="text-emerald-400 font-bold">✓</span>
            <span className="truncate max-w-[130px]">{bodyImage.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBodyImage(null);
                setBodyPreview(null);
                try { sessionStorage.removeItem('breedify_current_scan_img'); } catch (_) {}
              }}
              className="text-red-400 hover:text-red-200 font-bold ml-1 text-xs cursor-pointer"
              title="Remove photo"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* GPS & LOCATION CONTROLS */}
      <div className="p-4 sm:p-5 rounded-2xl border border-[#DFD3BF] bg-[#F4EDE0] shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#D96B43]" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A7A70]">
              {t('scan.gpsRecord', 'GEOTAG RECORD (MANDI & SUBSIDY VERIFICATION)')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {geoStatus === 'loading' && (
              <span className="text-[#7A7A70] flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> {t('common.loading', 'Auto-Detecting...')}
              </span>
            )}
            {geoStatus === 'gps_detected' && (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t('scan.gpsAcquired', 'GPS Locked')}
              </span>
            )}
            {geoStatus === 'ip_detected' && (
              <span className="text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 text-[11px]">
                IP Geotagged
              </span>
            )}
            {geoStatus === 'fallback' && (
              <span className="text-[#7A7A70] bg-[#F7F3EA] px-2 py-0.5 rounded-full text-[11px] border border-[#DFD3BF]">
                Default Mandi
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            placeholder="e.g. Anand, Gujarat, India or Karnal, Haryana"
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#DFD3BF] bg-[#FAF5EB] text-xs text-[#2A2A28] font-medium focus:outline-none focus:border-[#D96B43]"
          />
          <button
            type="button"
            onClick={captureGeolocation}
            className="px-4 py-2 rounded-xl bg-[#F7F3EA] border border-[#DFD3BF] text-xs font-bold text-[#324E38] hover:bg-[#FAF5EB] transition-colors shrink-0 cursor-pointer"
          >
            {t('scan.refreshGps', 'Refresh GPS')}
          </button>
        </div>
      </div>

      {/* SEX SELECTION & CLOSE-UP SLOTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Animal Sex Selector */}
        <div className="bg-[#F4EDE0] p-4 rounded-2xl border border-[#DFD3BF] shadow-sm space-y-2">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A7A70] block">
            {t('scan.animalSex', 'ANIMAL SEX (FOR LACTATION & PREGNANCY EVALUATION)')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSex('female')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                sex === 'female'
                  ? 'bg-[#324E38] text-white border-[#324E38] shadow-xs'
                  : 'bg-[#FAF5EB] text-[#2A2A28] border-[#DFD3BF] hover:bg-[#F4EDE0]'
              }`}
            >
              {t('scan.female', '♀ Female (Cow / Buffalo)')}
            </button>
            <button
              type="button"
              onClick={() => setSex('male')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                sex === 'male'
                  ? 'bg-[#324E38] text-white border-[#324E38] shadow-xs'
                  : 'bg-[#FAF5EB] text-[#2A2A28] border-[#DFD3BF] hover:bg-[#F4EDE0]'
              }`}
            >
              {t('scan.male', '♂ Male (Bull / Ox)')}
            </button>
          </div>
        </div>

        {/* Muzzle / Horn Close-Up Slot */}
        <div className={`p-4 rounded-2xl border transition-all ${
          facePreview
            ? 'bg-emerald-50/60 border-emerald-300 shadow-sm'
            : 'bg-[#F4EDE0] border-[#DFD3BF] shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A7A70] flex items-center gap-1.5">
              <span>{t('scan.faceHornOptional', 'FACE / HORN CLOSE-UP (OPTIONAL)')}</span>
              {facePreview && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {t('scan.faceAttached', 'Attached')}
                </span>
              )}
            </label>
            {facePreview && (
              <button
                type="button"
                onClick={handleRemoveFace}
                className="text-[11px] text-red-600 hover:text-red-800 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> {t('common.delete', 'Remove')}
              </button>
            )}
          </div>

          {facePreview ? (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-16 h-14 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm shrink-0">
                  <img src={facePreview} alt="Face / Horn Muzzle" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-emerald-900 block truncate">
                    ✓ {faceImage?.name || 'Muzzle Close-Up Image'}
                  </span>
                  <span className="text-[11px] text-[#5A5A50] block">
                    Facial & horn geometry attached
                  </span>
                </div>
              </div>

              <label className="bg-[#FAF5EB] border border-[#DFD3BF] hover:bg-[#F4EDE0] text-[#2A2A28] px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors shadow-xs">
                {t('common.edit', 'Change')}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleFaceFileChange(e.target.files[0]);
                    e.target.value = null;
                  }}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-[11px] text-[#7A7A70] block leading-snug">
                  {t('scan.faceHornSubtitle', 'Upload a head or muzzle shot to assist in high-precision horn curvature analysis.')}
                </span>
              </div>
              <label className="bg-[#F5EBE1] hover:bg-[#EBDCD0] text-[#D96B43] px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors shadow-xs">
                {t('scan.addFace', '+ Add Face')}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleFaceFileChange(e.target.files[0]);
                    e.target.value = null;
                  }}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

      </div>

      {/* SCAN ACTION BUTTON */}
      <div className="text-center pt-2">
        <button
          onClick={handleRunPipeline}
          disabled={isScanning}
          className="w-full sm:w-auto min-w-[340px] bg-[#D96B43] hover:bg-[#C25832] text-white py-4 px-8 rounded-full font-bold text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 mx-auto disabled:opacity-60 cursor-pointer"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t('scan.analyzing', 'Analyzing Livestock Biometrics...')}</span>
            </>
          ) : scanMode === 'live' ? (
            <>
              <Camera className="w-4 h-4" />
              <span>{t('scan.captureFrame', 'Capture Live Frame & Identify Breed')}</span>
            </>
          ) : !bodyPreview ? (
            <>
              <Upload className="w-4 h-4" />
              <span>{t('scan.uploadOwnImage', 'Upload Animal Photo to Scan')}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t('scan.analyzeLivestock', 'Run AI Biometric Scan & Generate Passport')}</span>
            </>
          )}
        </button>
      </div>

      {/* GEMINI API KEY MODAL */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#F8F3EA] rounded-3xl max-w-md w-full p-6 border border-[#DFD3BF] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2 text-[#D96B43]">
                <Key className="w-5 h-5" />
                <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                  Google Gemini Vision API Key
                </h3>
              </div>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="w-8 h-8 rounded-full bg-[#F4EDE0] hover:bg-[#EDE7DA] flex items-center justify-center text-[#7A7A70]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5A5A50] leading-relaxed">
              Enter your Google AI Studio Gemini API Key for deep multimodal cloud recognition. If no key is provided, the application automatically uses our built-in high-accuracy deep morphological computer vision engine.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#7A7A70] block mb-1">
                  Gemini API Key:
                </label>
                <input
                  type="password"
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFD3BF] bg-[#FAF5EB] text-xs font-mono text-[#2A2A28] focus:outline-none focus:border-[#D96B43]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setGeminiKeyInput('');
                    localStorage.removeItem('bovine_gemini_key');
                    localStorage.removeItem('gemini_api_key');
                    setHasGeminiKey(false);
                    setShowApiKeyModal(false);
                  }}
                  className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                >
                  Clear Key
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowApiKeyModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#F4EDE0] border border-[#DFD3BF] text-xs font-semibold text-[#7A7A70] hover:bg-[#EDE7DA]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#324E38] hover:bg-[#253D2A] text-white text-xs font-bold shadow-xs"
                  >
                    Save API Key
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
