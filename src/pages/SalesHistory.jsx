import React, { useState, useEffect } from 'react';
import { 
  History, 
  IndianRupee, 
  TrendingUp, 
  CheckCircle2, 
  Download, 
  FileText, 
  Search, 
  Calendar, 
  ShieldCheck, 
  Award,
  ArrowUpRight
} from 'lucide-react';
import MarketplaceSubNav from '../components/MarketplaceSubNav';
import { getListings } from '../utils/marketplaceStorage';

export default function SalesHistory() {
  const [soldListings, setSoldListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const all = getListings();
    const sold = all.filter(l => l.status === 'sold');
    
    // If no sold listings exist in fresh localstorage, provide sample historical sales
    if (sold.length === 0) {
      setSoldListings([
        {
          id: 'hist-1',
          title: 'Prime Gir Cow (3rd Lactation, 17 L/Day)',
          breed: 'Gir Cow',
          category: 'Cattle',
          soldPrice: 78000,
          soldDate: '2026-08-14T10:00:00Z',
          buyerName: 'Vikram Singh, Surat Mandi',
          buyerPhone: '+91 94280 11223',
          pashuAadhaarId: 'IN-GJ-2024-88412',
          photos: ['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80']
        },
        {
          id: 'hist-2',
          title: 'Champion Line Murrah Buffalo',
          breed: 'Murrah Buffalo',
          category: 'Buffalo',
          soldPrice: 95000,
          soldDate: '2026-07-28T14:30:00Z',
          buyerName: 'Harpreet Dhillon, Karnal',
          buyerPhone: '+91 98120 44556',
          pashuAadhaarId: 'IN-HR-2023-99120',
          photos: ['https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=400&q=80']
        },
        {
          id: 'hist-3',
          title: 'Pure Kankrej Bull Calf',
          breed: 'Kankrej Bull',
          category: 'Calf',
          soldPrice: 32000,
          soldDate: '2026-06-19T09:15:00Z',
          buyerName: 'Gopal Dairy Farm, Vadodara',
          buyerPhone: '+91 99099 77881',
          pashuAadhaarId: 'Pending Registration',
          photos: ['https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=400&q=80']
        }
      ]);
    } else {
      setSoldListings(sold);
    }
  }, []);

  const totalRevenue = soldListings.reduce((sum, item) => sum + (Number(item.soldPrice) || Number(item.price) || 0), 0);
  const totalCount = soldListings.length;
  const avgPrice = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;
  const highestSale = soldListings.reduce((max, item) => Math.max(max, Number(item.soldPrice) || Number(item.price) || 0), 0);

  const filtered = soldListings.filter(item => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.breed?.toLowerCase().includes(q) ||
      item.buyerName?.toLowerCase().includes(q) ||
      item.pashuAadhaarId?.toLowerCase().includes(q)
    );
  });

  const handleDownloadCertificate = (item) => {
    const certText = `
=============================================================
             BREEDIFY LIVESTOCK TRANSFER CERTIFICATE
=============================================================
Animal: ${item.title}
Breed: ${item.breed} (${item.category})
Pashu Aadhaar ID: ${item.pashuAadhaarId || 'Verified Record'}
Sale Price: ₹${Number(item.soldPrice || item.price).toLocaleString('en-IN')}
Sale Date: ${new Date(item.soldDate || Date.now()).toLocaleDateString('en-IN')}
Buyer: ${item.buyerName || 'Verified Buyer'}
Phone: ${item.buyerPhone || 'N/A'}
Platform: BREEDIFY AI Mandi & Traceability Network
Status: Legally Transferred & Recorded in Distributed Ledger
=============================================================
    `;
    const blob = new Blob([certText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BREEDIFY_Transfer_Cert_${item.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F4EDE0]/40 pb-20">
      <MarketplaceSubNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-editorial text-[#2A2A28]">
              Sales History & Revenue Ledger
            </h1>
            <p className="text-sm text-[#2A2A28]/70 mt-1">
              Verified financial records, completed livestock transactions, and official transfer certificates.
            </p>
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by buyer, breed, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-[#2A2A28] focus:border-[#324E38] focus:outline-none shadow-xs"
            />
          </div>
        </div>

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-[#2A2A28]/10 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Sales</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-editorial text-[#324E38]">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Lifetime gross livestock volume</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#2A2A28]/10 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Animals Sold</span>
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-editorial text-[#2A2A28]">
              {totalCount} Head
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Cattle & buffaloes transferred</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#2A2A28]/10 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Price</span>
              <IndianRupee className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-editorial text-[#2A2A28]">
              ₹{avgPrice.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Mean realized value per animal</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#2A2A28]/10 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Highest Sale</span>
              <ArrowUpRight className="w-4 h-4 text-[#D96B43]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-editorial text-[#D96B43]">
              ₹{highestSale.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Peak individual listing transaction</p>
          </div>
        </div>

        {/* Transactions Table / List */}
        <div className="bg-white rounded-3xl border border-[#2A2A28]/10 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold font-editorial text-lg text-[#2A2A28]">
              Completed Transaction Records
            </h3>
            <span className="text-xs text-gray-400 font-medium">
              Showing {filtered.length} of {soldListings.length} completed transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F4EDE0]/40 text-gray-600 font-semibold uppercase text-[11px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Animal / Breed</th>
                  <th className="py-3.5 px-4">Pashu Aadhaar / Tag</th>
                  <th className="py-3.5 px-4">Buyer Details</th>
                  <th className="py-3.5 px-4">Sale Date</th>
                  <th className="py-3.5 px-4 text-right">Sold Amount</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {filtered.map(item => {
                  const img = item.photos && item.photos.length > 0
                    ? (typeof item.photos[0] === 'string' ? item.photos[0] : item.photos[0].preview)
                    : '';

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          {img && (
                            <img
                              src={img}
                              alt={item.title}
                              className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-bold text-[#2A2A28] line-clamp-1">{item.title}</div>
                            <div className="text-xs text-[#324E38] font-semibold">{item.breed}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-xs">
                        <span className="bg-gray-100 px-2.5 py-1 rounded-md text-gray-800 font-medium">
                          {item.pashuAadhaarId || 'Verified Record'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#2A2A28]">{item.buyerName || 'Verified Buyer'}</div>
                        <div className="text-xs text-gray-400">{item.buyerPhone || 'Private Record'}</div>
                      </td>

                      <td className="py-4 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {item.soldDate
                          ? new Date(item.soldDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'Recent'}
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-base text-[#D96B43] whitespace-nowrap">
                        ₹{Number(item.soldPrice || item.price).toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-center">
                        <button
                          onClick={() => handleDownloadCertificate(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#324E38]/10 hover:bg-[#324E38] text-[#324E38] hover:text-white rounded-xl text-xs font-bold transition-colors"
                          title="Download Official Transfer Certificate"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
