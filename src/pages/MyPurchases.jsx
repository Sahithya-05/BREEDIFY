import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Store, 
  Clock, 
  CheckCircle2, 
  MessageCircle, 
  PhoneCall, 
  AlertCircle, 
  FileText,
  Calendar,
  IndianRupee,
  MapPin,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import MarketplaceSubNav from '../components/MarketplaceSubNav';
import { getPurchaseRequests, updatePurchaseRequestStatus, getListingById } from '../utils/marketplaceStorage';

export default function MyPurchases() {
  const [requests, setRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // all, Sent, Responded, Accepted, Completed

  const loadRequests = () => {
    setRequests(getPurchaseRequests());
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAdvanceStatus = (id, currentStatus) => {
    const sequence = ['Sent', 'Seller Responded', 'In Negotiation', 'Deal Accepted', 'Completed'];
    const currentIndex = sequence.indexOf(currentStatus);
    if (currentIndex !== -1 && currentIndex < sequence.length - 1) {
      const nextStatus = sequence[currentIndex + 1];
      updatePurchaseRequestStatus(id, nextStatus);
      loadRequests();
    }
  };

  const filteredRequests = requests.filter(r => {
    if (activeFilter === 'all') return true;
    return r.status.toLowerCase().includes(activeFilter.toLowerCase());
  });

  const getStepIndex = (status) => {
    switch (status) {
      case 'Sent': return 0;
      case 'Seller Responded': return 1;
      case 'In Negotiation': return 2;
      case 'Deal Accepted': return 3;
      case 'Completed': return 4;
      default: return 0;
    }
  };

  const steps = ['Offer Sent', 'Seller Responded', 'Negotiating', 'Deal Accepted', 'Completed'];

  return (
    <div className="min-h-screen bg-[#F4EDE0]/40 pb-20">
      <MarketplaceSubNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-[#2A2A28]">
              My Purchase Inquiries & Deals
            </h1>
            <p className="text-sm text-[#2A2A28]/70 mt-1">
              Track purchase requests, seller responses, deal status, and veterinary inspections in real time.
            </p>
          </div>

          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 bg-[#324E38] hover:bg-[#253b2a] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Store className="w-5 h-5" />
            <span>Explore Mandi</span>
          </Link>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'Sent', 'Responded', 'Accepted', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === f
                  ? 'bg-[#324E38] text-white shadow-xs'
                  : 'bg-white text-[#2A2A28]/70 border border-gray-200 hover:bg-[#F4EDE0]'
              }`}
            >
              {f === 'all' ? 'All Inquiries' : f}
            </button>
          ))}
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#2A2A28]/10 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold font-editorial text-[#2A2A28] mb-2">
              No Purchase Inquiries Yet
            </h3>
            <p className="text-sm text-[#2A2A28]/60 mb-6">
              When you find a high-yielding cow or buffalo and click "Request to Buy", your progress will appear here.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 bg-[#D96B43] text-white px-5 py-2.5 rounded-xl font-semibold shadow-xs hover:bg-[#c25a34]"
            >
              <Store className="w-4 h-4" />
              <span>Browse Marketplace</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map(req => {
              const currentStep = getStepIndex(req.status);
              const listing = getListingById(req.listingId);
              const img = listing?.photos?.[0] || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80';

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border border-[#2A2A28]/10 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-gray-100">
                    <div className="flex items-start sm:items-center gap-4">
                      <img
                        src={typeof img === 'string' ? img : img.preview}
                        alt={req.animalTitle}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-gray-100 border border-gray-200 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold bg-[#324E38]/10 text-[#324E38] px-2 py-0.5 rounded-md">
                            {req.breed || 'Breed'}
                          </span>
                          <span className="text-xs text-gray-400">
                            Requested {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold font-editorial text-[#2A2A28]">
                          {req.animalTitle}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#2A2A28]/70 mt-1">
                          <span>Offered Price: <strong className="text-[#D96B43] text-sm">₹{Number(req.offeredPrice).toLocaleString('en-IN')}</strong></span>
                          <span>•</span>
                          <span>Seller: <strong>{req.sellerName || 'Verified Breeder'}</strong></span>
                          <span>•</span>
                          <span>Phone: <strong>{req.sellerPhone || '+91 98765 43210'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/marketplace/animal/${req.listingId}`}
                        className="px-4 py-2 border border-gray-200 text-[#2A2A28] rounded-xl text-xs font-bold hover:bg-[#F4EDE0]/50"
                      >
                        View Animal
                      </Link>

                      <a
                        href={`tel:${req.sellerPhone || '+919876543210'}`}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call Seller</span>
                      </a>

                      {currentStep < 4 && (
                        <button
                          onClick={() => handleAdvanceStatus(req.id, req.status)}
                          className="px-4 py-2 bg-[#324E38] hover:bg-[#253b2a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                          title="Simulate Deal Progression"
                        >
                          <span>Progress Status</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Multi-step Status Tracker */}
                  <div className="pt-6">
                    <p className="text-xs font-bold text-[#2A2A28]/60 uppercase tracking-wider mb-4">
                      Purchase Progress Pipeline
                    </p>
                    <div className="relative flex items-center justify-between">
                      {/* Line connecting steps */}
                      <div className="absolute left-0 right-0 top-3 h-0.5 bg-gray-200 z-0" />
                      <div
                        className="absolute left-0 top-3 h-0.5 bg-emerald-600 z-0 transition-all duration-500"
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                      />

                      {steps.map((label, idx) => {
                        const isDone = idx <= currentStep;
                        const isCurrent = idx === currentStep;

                        return (
                          <div key={label} className="relative z-10 flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isDone
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white border-2 border-gray-300 text-gray-400'
                            }`}>
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[11px] mt-2 font-medium text-center max-w-[80px] ${
                              isCurrent ? 'font-bold text-[#324E38]' : isDone ? 'text-gray-700' : 'text-gray-400'
                            }`}>
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {req.message && (
                    <div className="mt-5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700 flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Your Note to Seller:</strong> {req.message}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
