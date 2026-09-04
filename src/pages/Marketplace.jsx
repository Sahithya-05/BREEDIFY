import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Store,
  PlusCircle,
  Search,
  SlidersHorizontal,
  MapPin,
  ShieldCheck,
  Sparkles,
  Heart,
  ChevronRight,
  Phone,
  MessageCircle,
  Tag,
  CheckCircle2,
  AlertCircle,
  Eye,
  Calendar,
  X,
  ArrowUpDown,
  ShoppingBag
} from 'lucide-react';
import { getListings, fetchListingsFromFirestore, getMarketplaceStats, toggleSaveListing, getSavedListingIds, getRealisticBreedImage } from '../utils/marketplaceStorage';
import MarketplaceSubNav from '../components/MarketplaceSubNav';

export default function Marketplace() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({
    total: 0, cattle: 0, buffalo: 0, calves: 0, pregnant: 0, verified: 0
  });
  const [savedIds, setSavedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedPregnancy, setSelectedPregnancy] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(150000);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Quick contact seller modal state
  const [contactModalAnimal, setContactModalAnimal] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadListings = async () => {
      setIsLoading(true);
      const filters = {
        species: selectedSpecies,
        ageGroup: selectedAgeGroup,
        gender: selectedGender,
        pregnancy: selectedPregnancy,
        verification: selectedVerification,
        search: search.trim(),
        maxPrice: maxPrice
      };
      try {
        const data = await fetchListingsFromFirestore(filters, sortBy);
        if (isMounted) {
          setListings(data);
          setStats(getMarketplaceStats());
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Marketplace fetch notice:', err);
        if (isMounted) {
          setListings(getListings(filters, sortBy));
          setStats(getMarketplaceStats());
          setIsLoading(false);
        }
      }
    };

    loadListings();
    setSavedIds(getSavedListingIds());

    return () => {
      isMounted = false;
    };
  }, [selectedSpecies, selectedAgeGroup, selectedGender, selectedPregnancy, selectedVerification, sortBy, search, maxPrice]);

  const handleToggleSave = (e, listingId) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveListing(listingId);
    setSavedIds(getSavedListingIds());
  };

  const clearFilters = () => {
    setSelectedSpecies('all');
    setSelectedAgeGroup('all');
    setSelectedGender('all');
    setSelectedPregnancy('all');
    setSelectedVerification('all');
    setSortBy('newest');
    setSearch('');
    setMaxPrice(150000);
  };

  const hasActiveFilters = selectedSpecies !== 'all' || selectedAgeGroup !== 'all' || selectedGender !== 'all' || selectedPregnancy !== 'all' || selectedVerification !== 'all' || search !== '' || maxPrice < 150000;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <MarketplaceSubNav />

      {/* TOP BRAND TRUST HERO & OVERVIEW BANNER */}
      <div className="bg-[#324E38] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#4B6B52]/30 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/15">
              <span>🛒</span>
              <span>BREEDIFY LIVESTOCK MARKETPLACE</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-editorial font-bold tracking-tight">
              “Identify. Verify. Connect. Sell.”
            </h1>
            
            <p className="text-xs sm:text-sm text-[#E2EBE3] leading-relaxed">
              BREEDIFY helps farmers identify livestock, present verified animal information and connect with potential buyers through a transparent digital marketplace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/marketplace/sell"
              className="px-6 py-3 rounded-full bg-[#D96B43] hover:bg-[#C25832] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ SELL YOUR ANIMAL</span>
            </Link>

            <Link
              to="/marketplace/my-listings"
              className="px-4 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/20 flex items-center gap-1.5 transition-colors"
            >
              <span>My Listings</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#D96B43] text-[10px] font-bold">
                {stats.total}
              </span>
            </Link>
          </div>
        </div>

        {/* METRIC CHIPS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/15 text-xs">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-[#B8CBB9] block font-medium">🐄 Animals Listed</span>
            <span className="text-lg font-bold text-white">{stats.total}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-[#B8CBB9] block font-medium">🐄 Cattle Available</span>
            <span className="text-lg font-bold text-white">{stats.cattle}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-[#B8CBB9] block font-medium">🐃 Buffaloes</span>
            <span className="text-lg font-bold text-white">{stats.buffalo}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-[#B8CBB9] block font-medium">🐮 Calves</span>
            <span className="text-lg font-bold text-white">{stats.calves}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-[#B8CBB9] block font-medium">🤰 Pregnant</span>
            <span className="text-lg font-bold text-white">{stats.pregnant}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[10px] text-emerald-300 block font-medium">✓ Verified</span>
            <span className="text-lg font-bold text-emerald-400">{stats.verified}</span>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-[#F4EDE0] p-4 sm:p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7A7A70] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by breed, location, or Pashu Aadhaar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#DFD3BF] rounded-2xl pl-10 pr-4 py-2.5 text-xs text-[#2A2A28] placeholder-[#9A9A90] focus:outline-none focus:border-[#D96B43] shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7A70] hover:text-[#2A2A28]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#DFD3BF] rounded-2xl px-3 py-2.5 text-xs font-semibold text-[#2A2A28] focus:outline-none focus:border-[#D96B43] shadow-xs cursor-pointer appearance-none pr-8"
              >
                <option value="newest">🕒 Newest Listed</option>
                <option value="price_asc">💰 Price: Low → High</option>
                <option value="price_desc">💎 Price: High → Low</option>
                <option value="verified_first">✓ Verified First</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#7A7A70] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => setShowFiltersModal(true)}
              className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors ${
                hasActiveFilters
                  ? 'bg-[#324E38] text-white border-[#324E38]'
                  : 'bg-white text-[#2A2A28] border-[#DFD3BF] hover:bg-[#F7F3EA]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#D96B43]" />
              )}
            </button>
          </div>
        </div>

        {/* QUICK CATEGORY PILLS */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#EDE7DA] text-xs">
          <span className="text-[11px] font-bold text-[#7A7A70] mr-1">Quick Filter:</span>

          {/* Species */}
          {['all', 'Cattle', 'Buffalo'].map((sp) => (
            <button
              key={sp}
              onClick={() => setSelectedSpecies(sp)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                selectedSpecies === sp
                  ? 'bg-[#324E38] text-white border-[#324E38]'
                  : 'bg-white text-[#5A5A50] border-[#DFD3BF] hover:bg-[#F7F3EA]'
              }`}
            >
              {sp === 'all' ? 'All Species' : sp === 'Cattle' ? '🐄 Cattle' : '🐃 Buffalo'}
            </button>
          ))}

          {/* Age Group */}
          {['all', 'Calf', 'Young', 'Adult'].map((ag) => (
            <button
              key={ag}
              onClick={() => setSelectedAgeGroup(ag)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                selectedAgeGroup === ag
                  ? 'bg-[#324E38] text-white border-[#324E38]'
                  : 'bg-white text-[#5A5A50] border-[#DFD3BF] hover:bg-[#F7F3EA]'
              }`}
            >
              {ag === 'all' ? 'All Ages' : ag === 'Calf' ? '🐮 Calves' : ag}
            </button>
          ))}

          {/* Pregnant */}
          <button
            onClick={() => setSelectedPregnancy(selectedPregnancy === 'pregnant' ? 'all' : 'pregnant')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
              selectedPregnancy === 'pregnant'
                ? 'bg-purple-800 text-white border-purple-800'
                : 'bg-white text-[#5A5A50] border-[#DFD3BF] hover:bg-[#F7F3EA]'
            }`}
          >
            🤰 Pregnant Only
          </button>

          {/* Verified */}
          <button
            onClick={() => setSelectedVerification(selectedVerification === 'verified' ? 'all' : 'verified')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
              selectedVerification === 'verified'
                ? 'bg-emerald-800 text-white border-emerald-800'
                : 'bg-white text-[#5A5A50] border-[#DFD3BF] hover:bg-[#F7F3EA]'
            }`}
          >
            ✓ Officially Verified
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[11px] text-[#D96B43] hover:underline font-bold ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* FILTER DRAWER / MODAL */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4EDE0] rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#DFD3BF] shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#324E38]" />
                <h3 className="font-editorial font-bold text-lg text-[#2A2A28]">Filter Marketplace</h3>
              </div>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 flex items-center justify-center text-[#7A7A70]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Species */}
              <div>
                <label className="font-bold text-[#2A2A28] block mb-1.5">Species</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'Cattle', 'Buffalo'].map(sp => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setSelectedSpecies(sp)}
                      className={`py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                        selectedSpecies === sp ? 'bg-[#324E38] text-white border-[#324E38]' : 'bg-white text-[#2A2A28] border-[#DFD3BF]'
                      }`}
                    >
                      {sp === 'all' ? 'All' : sp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="font-bold text-[#2A2A28] block mb-1.5">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'Female', 'Male'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGender(g)}
                      className={`py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                        selectedGender === g ? 'bg-[#324E38] text-white border-[#324E38]' : 'bg-white text-[#2A2A28] border-[#DFD3BF]'
                      }`}
                    >
                      {g === 'all' ? 'All' : g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Group */}
              <div>
                <label className="font-bold text-[#2A2A28] block mb-1.5">Age Group</label>
                <div className="grid grid-cols-4 gap-2">
                  {['all', 'Calf', 'Young', 'Adult'].map(ag => (
                    <button
                      key={ag}
                      type="button"
                      onClick={() => setSelectedAgeGroup(ag)}
                      className={`py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                        selectedAgeGroup === ag ? 'bg-[#324E38] text-white border-[#324E38]' : 'bg-white text-[#2A2A28] border-[#DFD3BF]'
                      }`}
                    >
                      {ag === 'all' ? 'All' : ag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Price Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#2A2A28]">Maximum Budget</label>
                  <span className="font-bold text-[#D96B43]">₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="150000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#D96B43] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#7A7A70]">
                  <span>₹20,000</span>
                  <span>₹1,50,000</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EDE7DA] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl border border-[#DFD3BF] bg-white text-[#7A7A70] text-xs font-bold hover:bg-neutral-50 cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setShowFiltersModal(false)}
                className="px-6 py-2 rounded-xl bg-[#324E38] text-white text-xs font-bold hover:bg-[#253D2A] cursor-pointer shadow-md"
              >
                Apply Filters ({listings.length} Results)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANIMAL CARDS GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-[#F4EDE0] rounded-3xl border border-[#DFD3BF] overflow-hidden p-4 space-y-3 animate-pulse">
              <div className="w-full aspect-[4/3] bg-[#E2D8C7] rounded-2xl" />
              <div className="h-4 bg-[#E2D8C7] rounded w-3/4" />
              <div className="h-3 bg-[#E2D8C7] rounded w-1/2" />
              <div className="h-8 bg-[#E2D8C7] rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="p-12 text-center bg-[#F4EDE0] rounded-3xl border border-[#DFD3BF] space-y-3">
          <span className="text-4xl block">🐮🔍</span>
          <h3 className="font-editorial font-bold text-xl text-[#2A2A28]">No livestock listings match your filter</h3>
          <p className="text-xs text-[#7A7A70] max-w-md mx-auto">
            Try resetting your filters, expanding your budget range, or searching for a different breed.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 rounded-full bg-[#D96B43] text-white text-xs font-bold cursor-pointer hover:bg-[#C25832]"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((animal) => {
            const isSaved = savedIds.includes(animal.listingId);
            const isPregnant = animal.pregnancyStatus === 'Pregnant';
            const isCalf = animal.ageGroup === 'Calf' || animal.ageGroup === 'Young';
            const isVerified = animal.breedVerificationStatus === 'verified';

            return (
              <div
                key={animal.listingId}
                className="bg-[#F4EDE0] rounded-3xl border border-[#DFD3BF] overflow-hidden shadow-soft hover:shadow-xl transition-all duration-200 flex flex-col group"
              >
                {/* Image Container with Floating Corner Badges */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-200">
                  <img
                    src={animal.images[0]}
                    alt={animal.breed}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getRealisticBreedImage(animal.breed, animal.species);
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Top-Left Selective Corner Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[80%]">
                    {isVerified && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>VERIFIED</span>
                      </span>
                    )}
                    {isCalf && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white shadow-md">
                        🐮 CALF
                      </span>
                    )}
                    {isPregnant && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-700 text-white shadow-md">
                        🤰 PREGNANT
                      </span>
                    )}
                    {animal.breedVerificationStatus === 'verified' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#324E38]/90 text-white shadow-md backdrop-blur-xs">
                        🧬 PURE BREED
                      </span>
                    )}
                  </div>

                  {/* Top-Right Save Bookmark Button */}
                  <button
                    onClick={(e) => handleToggleSave(e, animal.listingId)}
                    title={isSaved ? 'Remove from Saved' : 'Save Animal'}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-90 cursor-pointer ${
                      isSaved
                        ? 'bg-red-500 text-white'
                        : 'bg-white/80 hover:bg-white text-[#7A7A70] hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                  </button>

                  {/* Bottom Image Price Overlay */}
                  <div className="absolute bottom-3 left-3 bg-[#2A2A28]/90 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-sm font-bold shadow-md">
                    ₹{animal.price.toLocaleString('en-IN')}
                    {animal.negotiable && (
                      <span className="text-[10px] text-emerald-300 font-normal ml-1.5">
                        (Negotiable)
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content Details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D96B43] bg-[#F5EBE1] px-2 py-0.5 rounded-full">
                        {animal.species} · {animal.gender}
                      </span>
                      <span className="text-[10px] text-[#7A7A70] font-semibold">
                        {animal.estimatedAge}
                      </span>
                    </div>

                    <h3 className="font-editorial font-bold text-xl text-[#2A2A28] group-hover:text-[#324E38] transition-colors line-clamp-1">
                      {animal.breed}
                    </h3>

                    <p className="text-xs text-[#7A7A70] flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-[#D96B43] shrink-0" />
                      <span className="truncate">{animal.location}</span>
                    </p>

                    {/* Highlights / Health Snapshot */}
                    <div className="mt-2.5 pt-2 border-t border-[#EDE7DA] text-xs space-y-1">
                      {animal.milkYield && (
                        <div className="flex items-center justify-between text-[#2A2A28]">
                          <span className="text-[11px] text-[#7A7A70]">🥛 Milk Yield:</span>
                          <span className="font-bold text-[11px]">{animal.milkYield}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[#2A2A28]">
                        <span className="text-[11px] text-[#7A7A70]">🩺 Health:</span>
                        <span className="font-semibold text-emerald-700 text-[11px]">
                          {animal.healthStatus} · {animal.vaccinationStatus?.split('(')[0] || 'Vaccinated'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-3 border-t border-[#EDE7DA] flex items-center gap-2">
                    <Link
                      to={`/marketplace/animal/${animal.listingId}`}
                      className="flex-1 py-2 rounded-xl bg-[#324E38] hover:bg-[#253D2A] text-white text-xs font-bold text-center transition-colors shadow-xs"
                    >
                      View Details
                    </Link>

                    <button
                      onClick={() => setContactModalAnimal(animal)}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-neutral-50 text-[#D96B43] border border-[#D96B43] text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Contact</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK CONTACT SELLER MODAL */}
      {contactModalAnimal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4EDE0] rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#DFD3BF] shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#D96B43]" />
                <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                  Contact Seller
                </h3>
              </div>
              <button
                onClick={() => setContactModalAnimal(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 flex items-center justify-center text-[#7A7A70]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#DFD3BF] flex items-center gap-3">
              <img
                src={contactModalAnimal.images[0]}
                alt={contactModalAnimal.breed}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[#D96B43] uppercase block">
                  {contactModalAnimal.species} · ₹{contactModalAnimal.price.toLocaleString('en-IN')}
                </span>
                <strong className="text-sm text-[#2A2A28] block truncate">
                  {contactModalAnimal.breed}
                </strong>
                <span className="text-[11px] text-[#7A7A70] block">
                  📍 {contactModalAnimal.location}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#EDE5D6] border border-[#DFD3BF]">
                <span className="text-[10px] font-bold uppercase text-[#7A7A70] block mb-0.5">Seller Name</span>
                <span className="text-sm font-bold text-[#2A2A28] block">{contactModalAnimal.sellerDetails.name}</span>
                <span className="text-[11px] text-[#7A7A70]">{contactModalAnimal.sellerDetails.sellerType} · {contactModalAnimal.sellerDetails.district}, {contactModalAnimal.sellerDetails.state}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#EDE5D6] border border-[#DFD3BF]">
                <span className="text-[10px] font-bold uppercase text-[#7A7A70] block mb-0.5">Mobile Phone</span>
                <a
                  href={`tel:${contactModalAnimal.sellerDetails.mobile}`}
                  className="text-base font-bold text-[#324E38] hover:underline flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>{contactModalAnimal.sellerDetails.mobile}</span>
                </a>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <a
                href={`https://wa.me/${contactModalAnimal.sellerDetails.mobile.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(contactModalAnimal.sellerDetails.name)},%20I%20am%20interested%20in%20your%20${encodeURIComponent(contactModalAnimal.breed)}%20listed%20on%20BREEDIFY%20for%20₹${contactModalAnimal.price}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Seller</span>
              </a>

              <button
                onClick={() => {
                  const id = contactModalAnimal.listingId;
                  setContactModalAnimal(null);
                  navigate(`/marketplace/animal/${id}?openBuyModal=true`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#D96B43] hover:bg-[#C25832] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Send Buy Offer</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
