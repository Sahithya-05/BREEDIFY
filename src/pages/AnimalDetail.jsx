import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  ShieldCheck,
  Sparkles,
  Heart,
  Share2,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  ChevronLeft,
  Calendar,
  Clock,
  Droplets,
  Award,
  Activity,
  User,
  ShoppingBag,
  FileText,
  Truck,
  HelpCircle,
  X,
  Check,
  Send,
  Loader2
} from 'lucide-react';
import { getListingById, fetchListingByIdFromFirestore, toggleSaveListing, getSavedListingIds, createPurchaseRequest, getRealisticBreedImage } from '../utils/marketplaceStorage';
import MarketplaceSubNav from '../components/MarketplaceSubNav';

export default function AnimalDetail() {
  const { listingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [animal, setAnimal] = useState(null);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Buy Request Form State
  const [offeredPrice, setOfferedPrice] = useState('');
  const [buyerName, setBuyerName] = useState('Bandela Revanth');
  const [buyerMobile, setBuyerMobile] = useState('+91 98765 43210');
  const [buyerLocation, setBuyerLocation] = useState('Hyderabad, Telangana');
  const [buyerMessage, setBuyerMessage] = useState('I am very interested in this animal. Would like to discuss delivery logistics and verify clinical health records.');
  const [isSubmittingBuy, setIsSubmittingBuy] = useState(false);
  const [buySubmittedSuccess, setBuySubmittedSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadAnimal = async () => {
      try {
        const data = await fetchListingByIdFromFirestore(listingId);
        if (isMounted && data) {
          setAnimal(data);
          setOfferedPrice(data.price);
          setIsSaved(getSavedListingIds().includes(data.listingId));
        }
      } catch {
        const data = getListingById(listingId);
        if (isMounted && data) {
          setAnimal(data);
          setOfferedPrice(data.price);
          setIsSaved(getSavedListingIds().includes(data.listingId));
        }
      }
    };
    loadAnimal();
    if (searchParams.get('openBuyModal') === 'true') {
      setShowBuyModal(true);
    }
    return () => {
      isMounted = false;
    };
  }, [listingId, searchParams]);

  if (!animal) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-[#F4EDE0] rounded-3xl border border-[#DFD3BF] space-y-4 my-8">
        <span className="text-4xl block">🐮❓</span>
        <h2 className="font-editorial font-bold text-2xl text-[#2A2A28]">Livestock Listing Not Found</h2>
        <p className="text-xs text-[#7A7A70]">The animal listing you are looking for may have been sold or removed.</p>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#324E38] text-white text-xs font-bold shadow-md"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  const handleSaveToggle = () => {
    const newState = toggleSaveListing(animal.listingId);
    setIsSaved(newState);
  };

  const handleSendPurchaseRequest = (e) => {
    e.preventDefault();
    setIsSubmittingBuy(true);

    const reqData = {
      listingId: animal.listingId,
      animalName: `${animal.breed} (${animal.estimatedAge})`,
      species: animal.species,
      breed: animal.breed,
      askingPrice: animal.price,
      offeredPrice: Number(offeredPrice) || animal.price,
      sellerName: animal.sellerDetails.name,
      sellerMobile: animal.sellerDetails.mobile,
      buyerName,
      buyerMobile,
      buyerLocation,
      message: buyerMessage
    };

    createPurchaseRequest(reqData);

    setTimeout(() => {
      setIsSubmittingBuy(false);
      setBuySubmittedSuccess(true);
      setTimeout(() => {
        setShowBuyModal(false);
        setBuySubmittedSuccess(false);
        navigate('/marketplace/purchases');
      }, 1200);
    }, 800);
  };

  const isCalf = animal.ageGroup === 'Calf' || animal.ageGroup === 'Young';
  const isPregnant = animal.pregnancyStatus === 'Pregnant';
  const isVerified = animal.breedVerificationStatus === 'verified';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-28">
      <MarketplaceSubNav />

      {/* BREADCRUMB & TOP ACTIONS */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#7A7A70]">
          <Link to="/marketplace" className="hover:text-[#2A2A28] font-semibold">
            Marketplace
          </Link>
          <span>/</span>
          <span>{animal.species}</span>
          <span>/</span>
          <span className="text-[#2A2A28] font-bold">{animal.breed}</span>
          <span>/</span>
          <span className="font-mono text-[#D96B43]">{animal.listingId}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToggle}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
              isSaved
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-white text-[#7A7A70] border-[#DFD3BF] hover:bg-neutral-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-red-600 text-red-600' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save Animal'}</span>
          </button>

          <Link
            to="/marketplace"
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-50 text-[#2A2A28] border border-[#DFD3BF] text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>
        </div>
      </div>

      {/* SECTION 1 — PHOTO GALLERY & PRIMARY CARD */}
      <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
        
        {/* Main Photo Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-neutral-200 shadow-md">
            <img
              src={animal.images[selectedImgIdx] || animal.images[0]}
              alt={animal.breed}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getRealisticBreedImage(animal.breed, animal.species);
              }}
              className="w-full h-full object-cover"
            />

            {/* Top Corner Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {isVerified && (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-600 text-white shadow-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>VERIFIED</span>
                </span>
              )}
              {isCalf && (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-600 text-white shadow-md">
                  🐮 CALF
                </span>
              )}
              {isPregnant && (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-700 text-white shadow-md">
                  🤰 PREGNANT
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#324E38]/90 text-white shadow-md backdrop-blur-xs">
                🧬 PURE BREED
              </span>
            </div>

            {/* Price Overlay */}
            <div className="absolute bottom-4 left-4 bg-[#2A2A28]/95 backdrop-blur-xs text-white px-4 py-2 rounded-2xl shadow-xl flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-editorial">
                ₹{animal.price.toLocaleString('en-IN')}
              </span>
              {animal.negotiable && (
                <span className="text-xs text-emerald-300 font-medium">
                  · Negotiable
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Selector Strip */}
          {animal.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {animal.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImgIdx(i)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    selectedImgIdx === i ? 'border-[#D96B43] scale-105 shadow-md' : 'border-[#DFD3BF] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumb ${i}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getRealisticBreedImage(animal.breed, animal.species);
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title, Origin & Trust Tiers */}
        <div className="pt-2 border-t border-[#EDE7DA] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D96B43] bg-[#F5EBE1] px-2.5 py-0.5 rounded-full">
                {animal.species} · {animal.gender} · {animal.estimatedAge}
              </span>
              <span className="text-xs text-[#7A7A70]">Listing #{animal.listingId}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-[#2A2A28]">
              {animal.breed}
            </h1>

            <p className="text-xs text-[#7A7A70] flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#D96B43] shrink-0" />
              <span>{animal.location}</span>
              <span>· {animal.mandiDistance}</span>
            </p>
          </div>

          {/* THREE TRUST TIERS DISPLAY (Section 15) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200 flex items-center gap-1 shadow-2xs">
              <span>🟣</span>
              <span>AI ESTIMATED</span>
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1 shadow-2xs">
              <span>🟠</span>
              <span>SELLER PROVIDED</span>
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center gap-1 shadow-2xs">
              <span>🟢</span>
              <span>OFFICIALLY VERIFIED</span>
            </span>
          </div>
        </div>

      </div>

      {/* DETAILED INFORMATION CARDS GRID (Section 14) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. Animal Information Card */}
        <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-3 text-xs">
          <div className="flex items-center gap-2 border-b border-[#EDE7DA] pb-2">
            <span className="text-lg">🐄</span>
            <h3 className="font-editorial font-bold text-base text-[#2A2A28]">Animal Identification</h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-white border border-[#DFD3BF]">
              <span className="text-[10px] text-[#7A7A70] block">Species</span>
              <strong className="text-sm text-[#2A2A28]">{animal.species}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#DFD3BF]">
              <span className="text-[10px] text-[#7A7A70] block">Gender</span>
              <strong className="text-sm text-[#2A2A28]">{animal.gender}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#DFD3BF]">
              <span className="text-[10px] text-[#7A7A70] block">Age Group</span>
              <strong className="text-sm text-[#2A2A28]">{animal.ageGroup}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#DFD3BF]">
              <span className="text-[10px] text-[#7A7A70] block">Approx Weight</span>
              <strong className="text-sm text-[#2A2A28]">{animal.weight}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#DFD3BF]">
              <span className="text-[10px] text-[#7A7A70] block">Ear Tag</span>
              <strong className="text-sm font-mono text-[#2A2A28]">{animal.earTag || 'N/A'}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#DFD3BF]">
              <span className="text-[10px] text-[#7A7A70] block">Pashu Aadhaar ID</span>
              <strong className="text-sm font-mono text-[#D96B43]">
                {animal.identificationStatus === 'Pending Registration' ? 'Pending Registration' : animal.officialAnimalId}
              </strong>
            </div>
          </div>
        </div>

        {/* 2. Breed Information & Confidence */}
        <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧬</span>
              <h3 className="font-editorial font-bold text-base text-[#2A2A28]">Breed & Pedigree Traits</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {Math.round(animal.breedConfidence * 100)}% AI Match
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#DFD3BF] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-[#2A2A28]">{animal.breed}</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#324E38] text-white">
                Pure Indigenous
              </span>
            </div>
            <p className="text-xs text-[#5A5A50] leading-relaxed">
              Certified genetic markers match ICAR / NBAGR breed standards. Characteristic forehead bone formation, pendulous ear droop, and dewlap skin folds verified.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#7A7A70]">
            <span>Verification Tier:</span>
            <strong className="text-emerald-800">Verified by Veterinary Officer & BREEDIFY Vision</strong>
          </div>
        </div>

        {/* 3. Pregnancy & Reproduction Status */}
        <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤰</span>
              <h3 className="font-editorial font-bold text-base text-[#2A2A28]">Pregnancy & Lactation</h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              animal.pregnancyStatus === 'Pregnant'
                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                : 'bg-neutral-100 text-neutral-700 border border-neutral-300'
            }`}>
              {animal.pregnancyStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {animal.pregnancyStatus === 'Pregnant' && (
              <>
                <div className="p-2.5 rounded-xl bg-white border border-[#DFD3BF]">
                  <span className="text-[10px] text-[#7A7A70] block">Months Pregnant</span>
                  <strong className="text-sm text-purple-900">{animal.monthsPregnant} Months</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-[#DFD3BF]">
                  <span className="text-[10px] text-[#7A7A70] block">Expected Calving</span>
                  <strong className="text-sm text-purple-900">{animal.expectedCalvingDate}</strong>
                </div>
              </>
            )}

            <div className="p-2.5 rounded-xl bg-white border border-[#DFD3BF]">
              <span className="text-[10px] text-[#7A7A70] block">Daily Milk Yield</span>
              <strong className="text-sm text-[#2A2A28]">{animal.milkYield || 'N/A'}</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-[#DFD3BF]">
              <span className="text-[10px] text-[#7A7A70] block">Butterfat Quality</span>
              <strong className="text-sm text-[#2A2A28]">{animal.fatPercentage || 'N/A'}</strong>
            </div>
          </div>

          <p className="text-[10px] text-[#7A7A70] italic">
            Ultrasound verification status: Certified by Licensed Veterinary Surgeon.
          </p>
        </div>

        {/* 4. Health & Vaccination Status */}
        <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🩺</span>
              <h3 className="font-editorial font-bold text-base text-[#2A2A28]">Health & Vaccination</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              🟢 {animal.healthStatus}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#DFD3BF] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#7A7A70] font-bold uppercase">Vaccines Administered:</span>
              <span className="text-[10px] font-bold text-emerald-700">✓ Verified</span>
            </div>
            <strong className="text-xs text-[#2A2A28] block">{animal.vaccinationStatus}</strong>
            <span className="text-[10px] text-[#7A7A70] block">Last Deworming: {animal.dewormingDate || 'Recent'}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#EDE5D6] border border-[#DFD3BF] text-[11px] text-[#5A5A50]">
            <strong>Clinical Remarks:</strong> Screened clear for subclinical mastitis, foot rot, and external parasites.
          </div>
        </div>

      </div>

      {/* 5. ANIMAL HISTORY TIMELINE (Section 9) */}
      <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4 text-xs">
        <div className="flex items-center gap-2 border-b border-[#EDE7DA] pb-3">
          <span className="text-lg">📜</span>
          <h3 className="font-editorial font-bold text-lg text-[#2A2A28]">Verified Animal History Timeline</h3>
        </div>

        <div className="relative border-l-2 border-[#D96B43]/40 ml-3 space-y-4 pl-4">
          {(animal.historyTimeline || []).map((item, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-[#D96B43] border-2 border-white shadow-xs" />
              <div className="p-3 rounded-2xl bg-white border border-[#DFD3BF] space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-[#2A2A28]">{item.title}</strong>
                  <span className="text-[10px] text-[#7A7A70] font-semibold">{item.date}</span>
                </div>
                <p className="text-[11px] text-[#5A5A50]">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. SELLER & LOGISTICS CARD */}
      <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">👤</span>
            <h3 className="font-editorial font-bold text-lg text-[#2A2A28]">Seller & Mandi Logistics</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            ✓ Verified Seller ({animal.sellerDetails?.sellerRating || 4.9} ★)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 rounded-2xl bg-white border border-[#DFD3BF]">
            <span className="text-[10px] text-[#7A7A70] block">Seller Name</span>
            <strong className="text-sm text-[#2A2A28] block">{animal.sellerDetails?.name}</strong>
            <span className="text-[11px] text-[#7A7A70]">{animal.sellerDetails?.sellerType} · {animal.sellerDetails?.animalsSold} Animals Sold</span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#DFD3BF]">
            <span className="text-[10px] text-[#7A7A70] block">Farm Location</span>
            <strong className="text-sm text-[#2A2A28] block">{animal.location}</strong>
            <span className="text-[11px] text-[#7A7A70]">{animal.mandiDistance}</span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-[#DFD3BF]">
            <span className="text-[10px] text-[#7A7A70] block">Transport Availability</span>
            <strong className="text-sm text-emerald-800 block">
              {animal.deliveryAvailable ? '✓ Farm Delivery Assistance Available' : 'Farm Pickup Required'}
            </strong>
            <span className="text-[11px] text-[#7A7A70]">Available: {animal.availableFrom || 'Immediate'}</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#EDE5D6] border border-[#DFD3BF]">
          <span className="font-bold text-[#2A2A28] block mb-0.5">Seller's Note to Buyers:</span>
          <p className="text-[11px] text-[#5A5A50] leading-relaxed">
            {animal.description}
          </p>
        </div>
      </div>

      {/* BOTTOM STICKY ACTION BAR (Section 14 & 21) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DFD3BF] px-4 py-3 sm:px-8 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-[#7A7A70] block uppercase font-bold">Asking Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold font-editorial text-[#2A2A28]">
                ₹{animal.price.toLocaleString('en-IN')}
              </span>
              {animal.negotiable && (
                <span className="text-[11px] text-emerald-700 font-semibold">
                  (Negotiable)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowContactModal(true)}
              className="px-4 py-2.5 rounded-full bg-white hover:bg-neutral-50 text-[#324E38] border-2 border-[#324E38] text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact Seller</span>
            </button>

            <button
              onClick={() => setShowBuyModal(true)}
              className="px-6 py-2.5 rounded-full bg-[#D96B43] hover:bg-[#C25832] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Request to Buy</span>
            </button>
          </div>
        </div>
      </div>

      {/* REQUEST TO BUY MODAL (Section 19) */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4EDE0] rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#DFD3BF] shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D96B43]" />
                <h3 className="font-editorial font-bold text-lg text-[#2A2A28]">
                  Submit Purchase Request
                </h3>
              </div>
              <button
                onClick={() => setShowBuyModal(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 flex items-center justify-center text-[#7A7A70]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {buySubmittedSuccess ? (
              <div className="p-8 text-center space-y-3 animate-in fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-editorial font-bold text-xl text-[#2A2A28]">Purchase Request Sent!</h4>
                <p className="text-xs text-[#7A7A70]">
                  Your purchase offer of ₹{Number(offeredPrice).toLocaleString('en-IN')} has been delivered to {animal.sellerDetails.name}. You can track responses under <strong>My Purchases</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendPurchaseRequest} className="space-y-3.5 text-xs">
                <div className="p-3 rounded-2xl bg-white border border-[#DFD3BF] flex items-center gap-3">
                  <img src={animal.images[0]} alt={animal.breed} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <span className="text-[10px] font-bold text-[#D96B43] uppercase block">{animal.species} · #{animal.listingId}</span>
                    <strong className="text-sm text-[#2A2A28]">{animal.breed}</strong>
                    <span className="text-[11px] text-[#7A7A70] block">Asking Price: ₹{animal.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#2A2A28] block mb-1">Your Offered Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={offeredPrice}
                      onChange={(e) => setOfferedPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DFD3BF] font-bold text-[#2A2A28]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#2A2A28] block mb-1">Your Contact Mobile *</label>
                    <input
                      type="text"
                      required
                      value={buyerMobile}
                      onChange={(e) => setBuyerMobile(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#DFD3BF] text-xs text-[#2A2A28]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#2A2A28] block mb-1">Your Delivery Location *</label>
                  <input
                    type="text"
                    required
                    value={buyerLocation}
                    onChange={(e) => setBuyerLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#DFD3BF] text-xs text-[#2A2A28]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#2A2A28] block mb-1">Message / Logistics Inquiry</label>
                  <textarea
                    rows={3}
                    value={buyerMessage}
                    onChange={(e) => setBuyerMessage(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#DFD3BF] text-xs text-[#2A2A28]"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-[#EDE5D6] border border-[#DFD3BF] text-[11px] text-[#5A5A50]">
                  Status Workflow: <strong>Sent → Seller Responded → Negotiation → Accepted → Sold</strong>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBuyModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#DFD3BF] bg-white text-[#7A7A70] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingBuy}
                    className="px-6 py-2 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {isSubmittingBuy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Submit Offer</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CONTACT SELLER MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4EDE0] rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#DFD3BF] shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#D96B43]" />
                <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                  Seller Contact
                </h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 flex items-center justify-center text-[#7A7A70]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-[#DFD3BF]">
                <span className="text-[10px] text-[#7A7A70] uppercase font-bold block">Seller Name</span>
                <strong className="text-base text-[#2A2A28] block">{animal.sellerDetails.name}</strong>
                <span className="text-[11px] text-[#7A7A70]">{animal.sellerDetails.sellerType} · {animal.location}</span>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#DFD3BF]">
                <span className="text-[10px] text-[#7A7A70] uppercase font-bold block">Direct Mobile Phone</span>
                <a
                  href={`tel:${animal.sellerDetails.mobile}`}
                  className="text-base font-bold text-[#324E38] hover:underline flex items-center gap-2 mt-0.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>{animal.sellerDetails.mobile}</span>
                </a>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <a
                href={`https://wa.me/${animal.sellerDetails.mobile.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(animal.sellerDetails.name)},%20I%20am%20interested%20in%20your%20${encodeURIComponent(animal.breed)}%20(Listing%20#${animal.listingId})%20on%20BREEDIFY.`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`tel:${animal.sellerDetails.mobile}`}
                className="flex-1 py-2.5 rounded-xl bg-[#324E38] hover:bg-[#253D2A] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
