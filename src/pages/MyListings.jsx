import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  PlusCircle, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle,
  AlertCircle,
  Calendar,
  IndianRupee,
  MapPin,
  ExternalLink,
  X
} from 'lucide-react';
import MarketplaceSubNav from '../components/MarketplaceSubNav';
import { getListings, fetchListingsFromFirestore, updateListing, updateListingAsync, deleteListing, deleteListingAsync, getRealisticBreedImage } from '../utils/marketplaceStorage';

export default function MyListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // all, active, pending, sold, paused
  const [searchQuery, setSearchQuery] = useState('');
  const [soldModalListing, setSoldModalListing] = useState(null);
  const [soldPrice, setSoldPrice] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = async () => {
    try {
      const data = await fetchListingsFromFirestore();
      if (data) setListings(data);
    } catch {
      setListings(getListings());
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleTogglePause = (item) => {
    const newStatus = item.status === 'paused' ? 'active' : 'paused';
    updateListing(item.id, { status: newStatus });
    showToast(`Listing ${newStatus === 'paused' ? 'paused' : 'resumed'} successfully.`);
    loadData();
  };

  const handleConfirmSold = (e) => {
    e.preventDefault();
    if (!soldModalListing) return;
    updateListing(soldModalListing.id, {
      status: 'sold',
      soldPrice: Number(soldPrice) || soldModalListing.price,
      soldDate: new Date().toISOString(),
      buyerName: buyerName || 'Direct Local Buyer',
      buyerPhone: buyerPhone || ''
    });
    setSoldModalListing(null);
    setSoldPrice('');
    setBuyerName('');
    setBuyerPhone('');
    showToast('🎉 Congratulations! Animal marked as Sold.');
    loadData();
  };

  const handleDelete = (id) => {
    deleteListing(id);
    setDeleteConfirmId(null);
    showToast('Listing removed from marketplace.');
    loadData();
  };

  const filteredListings = listings.filter(item => {
    if (activeTab === 'active' && item.status !== 'active') return false;
    if (activeTab === 'pending' && item.status !== 'pending') return false;
    if (activeTab === 'sold' && item.status !== 'sold') return false;
    if (activeTab === 'paused' && item.status !== 'paused') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.breed?.toLowerCase().includes(q) ||
        item.pashuAadhaarId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const tabCounts = {
    all: listings.length,
    active: listings.filter(l => l.status === 'active').length,
    pending: listings.filter(l => l.status === 'pending').length,
    sold: listings.filter(l => l.status === 'sold').length,
    paused: listings.filter(l => l.status === 'paused').length
  };

  return (
    <div className="min-h-screen bg-[#F4EDE0]/40 pb-16">
      <MarketplaceSubNav />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#324E38] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in border border-white/20">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title & CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-[#2A2A28]">
              My Livestock Listings
            </h1>
            <p className="text-sm text-[#2A2A28]/70 mt-1">
              Manage your active advertisements, view inquiries, track verification, and record sales.
            </p>
          </div>

          <Link
            to="/marketplace/sell"
            className="inline-flex items-center justify-center gap-2 bg-[#D96B43] hover:bg-[#c25a34] text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>List Another Animal</span>
          </Link>
        </div>

        {/* Tabs & Search Filter */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#2A2A28]/10 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Listings' },
              { id: 'active', label: 'Active' },
              { id: 'pending', label: 'Under Review' },
              { id: 'sold', label: 'Sold' },
              { id: 'paused', label: 'Paused' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-[#324E38] text-white shadow-xs font-semibold'
                    : 'bg-[#F4EDE0]/50 text-[#2A2A28]/70 hover:bg-[#F4EDE0]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#2A2A28]/10 text-[#2A2A28]'
                }`}>
                  {tabCounts[tab.id]}
                </span>
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#2A2A28]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search my animals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#F4EDE0]/30 border border-[#2A2A28]/15 rounded-xl text-xs sm:text-sm text-[#2A2A28] focus:outline-none focus:border-[#324E38]"
            />
          </div>
        </div>

        {/* Listings Grid / Cards */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#2A2A28]/10 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 bg-[#324E38]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-[#324E38]" />
            </div>
            <h3 className="text-xl font-bold font-editorial text-[#2A2A28] mb-2">
              No Listings Found
            </h3>
            <p className="text-sm text-[#2A2A28]/60 mb-6">
              {searchQuery
                ? 'No animals match your search query.'
                : activeTab === 'all'
                  ? 'You have not listed any cattle or buffalo for sale yet.'
                  : `You do not have any listings under ${activeTab}.`}
            </p>
            <Link
              to="/marketplace/sell"
              className="inline-flex items-center gap-2 bg-[#D96B43] text-white px-5 py-2.5 rounded-xl font-semibold shadow-xs hover:bg-[#c25a34]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your First Animal</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map(item => {
              const mainPhoto = item.photos && item.photos.length > 0
                ? (typeof item.photos[0] === 'string' ? item.photos[0] : item.photos[0].preview)
                : getRealisticBreedImage(item.breed, item.species);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#2A2A28]/10 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
                >
                  <div className="flex items-start sm:items-center gap-4 w-full md:w-auto">
                    <img
                      src={mainPhoto}
                      alt={item.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getRealisticBreedImage(item.breed, item.species);
                      }}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover bg-gray-100 flex-shrink-0 border border-[#2A2A28]/10"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          item.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'sold'
                              ? 'bg-purple-100 text-purple-800'
                              : item.status === 'paused'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                          ● {item.status}
                        </span>
                        <span className="text-xs bg-[#324E38]/10 text-[#324E38] font-semibold px-2 py-0.5 rounded-md">
                          {item.breed}
                        </span>
                        {item.verified && (
                          <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                            ✓ Pashu Aadhaar
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold font-editorial text-[#2A2A28] leading-tight">
                        {item.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#2A2A28]/70 mt-2">
                        <span className="font-bold text-base text-[#D96B43]">
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#324E38]" />
                          {item.location || item.seller?.location || 'Location Not Specified'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          Listed {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently'}
                        </span>
                      </div>

                      {/* Stats pill */}
                      <div className="flex items-center gap-4 mt-2.5 text-[11px] text-[#2A2A28]/60">
                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md">
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <strong>{item.views || 142}</strong> views
                        </span>
                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <strong>{item.inquiries || 6}</strong> inquiries
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <Link
                        to={`/marketplace/animal/${item.id}`}
                        className="p-2 text-[#324E38] hover:bg-[#324E38]/10 rounded-xl transition-colors title='View Public Page'"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      {item.status !== 'sold' && (
                        <button
                          onClick={() => handleTogglePause(item)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 text-[#2A2A28] hover:bg-gray-50 flex items-center gap-1.5"
                        >
                          {item.status === 'paused' ? (
                            <>
                              <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Resume</span>
                            </>
                          ) : (
                            <>
                              <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pause</span>
                            </>
                          )}
                        </button>
                      )}

                      {item.status !== 'sold' ? (
                        <button
                          onClick={() => {
                            setSoldModalListing(item);
                            setSoldPrice(item.price);
                          }}
                          className="px-3.5 py-1.5 bg-[#324E38] hover:bg-[#253b2a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Sold</span>
                        </button>
                      ) : (
                        <span className="text-xs bg-purple-100 text-purple-800 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                          ✓ Sold for ₹{Number(item.soldPrice || item.price).toLocaleString('en-IN')}
                        </span>
                      )}

                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mark As Sold Modal */}
      {soldModalListing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#2A2A28]/10 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2 text-[#324E38]">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold font-editorial text-[#2A2A28]">
                  Record Completed Sale
                </h3>
              </div>
              <button
                onClick={() => setSoldModalListing(null)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#2A2A28]/70 mb-4">
              Marking <strong>{soldModalListing.title}</strong> as sold will remove it from active search and record your revenue into Sales History.
            </p>

            <form onSubmit={handleConfirmSold} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2A2A28] mb-1">
                  Final Agreed Sale Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    required
                    value={soldPrice}
                    onChange={(e) => setSoldPrice(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm font-bold text-[#2A2A28] focus:border-[#324E38] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2A2A28] mb-1">
                  Buyer Name / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel, Anand"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-[#2A2A28] focus:border-[#324E38] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2A2A28] mb-1">
                  Buyer Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-[#2A2A28] focus:border-[#324E38] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSoldModalListing(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-[#2A2A28] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#324E38] hover:bg-[#253b2a] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Confirm & Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center border border-red-100 shadow-xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h4 className="text-base font-bold text-[#2A2A28] mb-1">
              Delete This Listing?
            </h4>
            <p className="text-xs text-[#2A2A28]/70 mb-5">
              This action cannot be undone. It will permanently remove this animal from your listings and the marketplace.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold text-[#2A2A28]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
