import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Trash2, 
  Scale, 
  Store, 
  MapPin, 
  Droplet, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  X,
  Sparkles
} from 'lucide-react';
import MarketplaceSubNav from '../components/MarketplaceSubNav';
import { getSavedListings, toggleSaveListing, getRealisticBreedImage } from '../utils/marketplaceStorage';

export default function SavedAnimals() {
  const [savedItems, setSavedItems] = useState([]);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadSaved = () => {
    setSavedItems(getSavedListings());
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleUnsave = (id) => {
    toggleSaveListing(id);
    setSelectedForCompare(prev => prev.filter(item => item.id !== id));
    loadSaved();
    setToastMessage('Animal removed from saved list');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleToggleCompare = (item) => {
    if (selectedForCompare.find(x => x.id === item.id)) {
      setSelectedForCompare(prev => prev.filter(x => x.id !== item.id));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('You can compare up to 3 animals simultaneously.');
        return;
      }
      setSelectedForCompare(prev => [...prev, item]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EDE0]/40 pb-20">
      <MarketplaceSubNav />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#324E38] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in border border-white/20">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-[#2A2A28]">
              Saved Animals
            </h1>
            <p className="text-sm text-[#2A2A28]/70 mt-1">
              Bookmark promising cattle & buffaloes, compare milk yields, age, pregnancy and pricing side-by-side.
            </p>
          </div>

          {selectedForCompare.length >= 2 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="inline-flex items-center gap-2 bg-[#324E38] hover:bg-[#253b2a] text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all animate-bounce"
            >
              <Scale className="w-5 h-5" />
              <span>Compare {selectedForCompare.length} Selected Animals</span>
            </button>
          )}
        </div>

        {savedItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#2A2A28]/10 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-[#D96B43]" />
            </div>
            <h3 className="text-xl font-bold font-editorial text-[#2A2A28] mb-2">
              No Saved Animals
            </h3>
            <p className="text-sm text-[#2A2A28]/60 mb-6">
              You haven't bookmarked any animals yet. Click the heart icon on any marketplace card to save and compare.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 bg-[#324E38] text-white px-5 py-2.5 rounded-xl font-semibold shadow-xs hover:bg-[#253b2a]"
            >
              <Store className="w-4 h-4" />
              <span>Browse Marketplace</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedItems.map(item => {
              const mainPhoto = item.photos && item.photos.length > 0
                ? (typeof item.photos[0] === 'string' ? item.photos[0] : item.photos[0].preview)
                : getRealisticBreedImage(item.breed, item.species || item.category);

              const isComparing = selectedForCompare.some(x => x.id === item.id);

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-xs hover:shadow-md flex flex-col ${
                    isComparing ? 'border-2 border-[#324E38] ring-4 ring-[#324E38]/10' : 'border-[#2A2A28]/10'
                  }`}
                >
                  <div className="relative h-52 overflow-hidden bg-gray-100">
                    <img
                      src={mainPhoto}
                      alt={item.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getRealisticBreedImage(item.breed, item.species || item.category);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Unsave Button */}
                    <button
                      onClick={() => handleUnsave(item.id)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-rose-600 shadow-md flex items-center justify-center transition-all"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Category badge */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      {item.breed}
                    </div>

                    <div className="absolute bottom-3 left-3 bg-[#D96B43] text-white font-extrabold text-sm px-3 py-1 rounded-xl shadow-xs">
                      ₹{Number(item.price).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold font-editorial text-[#2A2A28] mb-2 line-clamp-1">
                        {item.title}
                      </h3>

                      <div className="grid grid-cols-2 gap-2 text-xs text-[#2A2A28]/70 mb-4 bg-[#F4EDE0]/30 p-2.5 rounded-xl">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Age</span>
                          <span className="font-semibold">{item.age || '3.5 yrs'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Lactation / Milk</span>
                          <span className="font-semibold text-blue-700">
                            {item.milkYield ? `${item.milkYield} L/day` : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Pregnancy</span>
                          <span className={`font-semibold ${item.isPregnant ? 'text-amber-700' : 'text-gray-600'}`}>
                            {item.isPregnant ? `Pregnant (${item.pregnancyMonths || 0}m)` : 'Non-pregnant'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Location</span>
                          <span className="font-semibold truncate block">{item.location || 'Anand, Gujarat'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      {/* Compare Checkbox */}
                      <label className="flex items-center gap-2 text-xs font-semibold text-[#2A2A28] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isComparing}
                          onChange={() => handleToggleCompare(item)}
                          className="w-4 h-4 rounded text-[#324E38] focus:ring-[#324E38] border-gray-300"
                        />
                        <span>Select to compare</span>
                      </label>

                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          to={`/marketplace/animal/${item.id}`}
                          className="flex-1 text-center py-2 bg-[#324E38] hover:bg-[#253b2a] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison Modal */}
      {showCompareModal && selectedForCompare.length >= 2 && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-[#2A2A28]/10 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2.5">
                <Scale className="w-6 h-6 text-[#324E38]" />
                <h3 className="text-xl font-bold font-editorial text-[#2A2A28]">
                  Livestock Head-to-Head Comparison ({selectedForCompare.length} Animals)
                </h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {selectedForCompare.map(item => {
                const img = item.photos && item.photos.length > 0
                  ? (typeof item.photos[0] === 'string' ? item.photos[0] : item.photos[0].preview)
                  : '';

                return (
                  <div key={item.id} className="border border-gray-200 rounded-2xl p-4 bg-[#F4EDE0]/20 flex flex-col justify-between">
                    <div>
                      <img src={img} alt={item.title} className="w-full h-44 object-cover rounded-xl mb-3 shadow-xs" />
                      <h4 className="font-bold font-editorial text-base text-[#2A2A28] mb-1">{item.title}</h4>
                      <p className="text-xs text-[#324E38] font-bold mb-3">{item.breed}</p>

                      <div className="space-y-2 text-xs border-t border-gray-200 pt-3">
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-500">Price</span>
                          <span className="font-extrabold text-[#D96B43]">₹{Number(item.price).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-500">Category</span>
                          <span className="font-semibold">{item.category}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-500">Age</span>
                          <span className="font-semibold">{item.age || '3-4 yrs'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-500">Daily Milk Yield</span>
                          <span className="font-semibold text-blue-700">{item.milkYield ? `${item.milkYield} L/day` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-500">Lactation No.</span>
                          <span className="font-semibold">{item.lactationNumber ? `${item.lactationNumber}th` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-500">Pregnancy</span>
                          <span className="font-semibold">{item.isPregnant ? `Pregnant (${item.pregnancyMonths}m)` : 'Open / None'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-500">Pashu Aadhaar</span>
                          <span className="font-semibold text-emerald-700">{item.pashuAadhaarId || 'Pending'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-gray-100">
                          <span className="text-gray-500">Location</span>
                          <span className="font-semibold">{item.location || 'Gujarat'}</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/marketplace/animal/${item.id}`}
                      className="mt-4 block w-full text-center py-2 bg-[#324E38] text-white rounded-xl text-xs font-bold"
                    >
                      Full Details →
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
