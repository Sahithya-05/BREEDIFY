import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Droplets,
  IndianRupee,
  TrendingUp,
  Award,
  Users,
  Building2,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  FileSpreadsheet,
  Truck,
  FileText,
  MapPin,
  Sparkles,
  X
} from 'lucide-react';
import { getPassports } from '../utils/passportStorage';
import { getMilkCollections, saveMilkCollection } from '../utils/ecosystemStorage';

export default function VendorDashboard({ user }) {
  const { t } = useTranslation();

  const currentUser = user || JSON.parse(localStorage.getItem('bovine_user') || '{}') || {
    name: 'Anand Milk Union (AMUL Procurement)',
    role: 'vendor',
    location: 'District Center, Anand, Gujarat'
  };

  const [collections, setCollections] = useState([]);
  const [passports, setPassports] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // New Collection Form State
  const [collectionForm, setCollectionForm] = useState({
    farmerName: 'Ramesh Patel',
    farmerMobile: '+91 98765 43210',
    village: 'Mogri Route #4',
    animalTag: 'TAG-IN-4420 (Murrah Buffalo)',
    liters: 14.5,
    fat: 7.6,
    snf: 9.2
  });

  const [collectionSuccessToast, setCollectionSuccessToast] = useState(false);

  useEffect(() => {
    setCollections(getMilkCollections());
    const loadedPassports = getPassports();
    setPassports(loadedPassports);
    if (loadedPassports.length > 0) {
      setCollectionForm(prev => ({
        ...prev,
        animalTag: `${loadedPassports[0].tagNumber} (${loadedPassports[0].breed})`,
        farmerName: loadedPassports[0].owner?.name || 'Ramesh Patel',
        farmerMobile: loadedPassports[0].owner?.mobile || '+91 98765 43210',
        village: `${loadedPassports[0].owner?.village || 'Mogri'} Route #4`
      }));
    }
  }, []);

  // Calculated Two-Axis Rate and Payout
  const calculatedRate = Math.round(((parseFloat(collectionForm.fat || 0) * 5.8) + (parseFloat(collectionForm.snf || 0) * 2.4)) * 10) / 10;
  const calculatedPayout = Math.round((parseFloat(collectionForm.liters || 0) * calculatedRate) * 10) / 10;

  // KPI Calculations
  const totalLitersToday = Math.round(collections.reduce((acc, c) => acc + (c.liters || 0), 0) * 10) / 10;
  const totalPayoutToday = Math.round(collections.reduce((acc, c) => acc + (c.totalPayout || 0), 0));
  const avgFat = collections.length > 0
    ? (collections.reduce((acc, c) => acc + (c.fat || 0), 0) / collections.length).toFixed(1)
    : '6.4';
  const avgSnf = collections.length > 0
    ? (collections.reduce((acc, c) => acc + (c.snf || 0), 0) / collections.length).toFixed(1)
    : '8.9';

  const handleSaveCollection = (e) => {
    e.preventDefault();
    saveMilkCollection({
      ...collectionForm,
      vendorName: currentUser.name || 'Amul Procurement Unit'
    }, 'vendor');

    setCollections(getMilkCollections());
    setShowCollectionModal(false);
    setCollectionSuccessToast(true);
    setTimeout(() => setCollectionSuccessToast(false), 3500);
  };

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Receipt,Date,Shift,Farmer,Tag,Liters,Fat,SNF,Rate,Payout,Status\n" +
      collections.map(c => `"${c.id}","${c.date}","${c.shift}","${c.farmerName}","${c.animalTag}","${c.liters}","${c.fat}","${c.snf}","${c.ratePerLiter}","${c.totalPayout}","${c.paymentStatus}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `milk_collection_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 text-[#2A2A28]">

      {/* TOAST CONFIRMATION */}
      {collectionSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#324E38] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <strong className="text-xs block">Milk Collection & Payment Recorded!</strong>
            <span className="text-[11px] text-[#C2D6C3]">Synced to Farmer's digital earnings wallet & animal passport.</span>
          </div>
        </div>
      )}

      {/* HERO BANNER - MILK VENDOR PORTAL */}
      <div className="bg-[#324E38] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-card border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-300 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-amber-400" />
                MILK INTELLIGENCE & PROCUREMENT HUB
              </span>
              <span className="text-[10px] font-bold bg-white/10 px-2.5 py-0.5 rounded-full text-white">
                Bulk Cooler Center #12
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-editorial font-bold text-white leading-tight">
              {currentUser.name}
            </h1>

            <p className="text-xs sm:text-sm text-[#E2D5C8] leading-relaxed">
              Two-axis quality milk procurement (Fat/SNF), direct farmer DBT settlement, route planning, and dairy cold-chain analytics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowCollectionModal(true)}
              className="bg-[#D96B43] hover:bg-[#C25832] text-white px-5 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Milk Collection</span>
            </button>

            <button
              onClick={exportCSV}
              className="bg-white/15 hover:bg-white/20 text-white px-4 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider border border-white/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 PROCUREMENT KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Today's Total Intake */}
        <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-1.5 hover:border-[#D96B43] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#7A7A70] flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-[#D96B43]" />
              TOTAL MILK INTAKE
            </span>
            <span className="text-[9px] font-bold bg-[#F5EBE1] text-[#D96B43] px-2 py-0.5 rounded-full">
              Today
            </span>
          </div>
          <div className="text-2xl font-editorial font-bold text-[#2A2A28]">
            {totalLitersToday} Litres
          </div>
          <p className="text-[11px] text-[#7A7A70]">Total volume received at cooler</p>
        </div>

        {/* KPI 2: Total Payments Disbursed */}
        <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-1.5 hover:border-emerald-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-800 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5" />
              PAYOUTS DISBURSED
            </span>
            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              DBT Settled
            </span>
          </div>
          <div className="text-2xl font-editorial font-bold text-emerald-800">
            ₹{totalPayoutToday}
          </div>
          <p className="text-[11px] text-[#7A7A70]">100% credited to farmer wallets</p>
        </div>

        {/* KPI 3: Average Butterfat */}
        <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-1.5 hover:border-amber-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-800 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              AVERAGE BUTTERFAT
            </span>
            <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              High Grade
            </span>
          </div>
          <div className="text-2xl font-editorial font-bold text-[#2A2A28]">
            {avgFat}% Fat
          </div>
          <p className="text-[11px] text-[#7A7A70]">Weighted across buffalo & cow batches</p>
        </div>

        {/* KPI 4: Average SNF */}
        <div className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-1.5 hover:border-purple-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-purple-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              AVERAGE SNF QUALITY
            </span>
            <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              Compliant
            </span>
          </div>
          <div className="text-2xl font-editorial font-bold text-[#2A2A28]">
            {avgSnf}% SNF
          </div>
          <p className="text-[11px] text-[#7A7A70]">Meets cooperative dairy standards</p>
        </div>

      </div>

      {/* MAIN PROCUREMENT SPLIT: COLLECTION RECORDS (7 Cols) + PRICING & ROUTES (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT 7 COLS: TODAY'S COLLECTION ENTRIES */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-[#D96B43]" />
                <div>
                  <h2 className="text-lg font-editorial font-bold text-[#2A2A28]">
                    Daily Milk Collection Records
                  </h2>
                  <span className="text-[10px] text-[#7A7A70]">Synchronized with Farmer Wallets & Animal Passports</span>
                </div>
              </div>

              <button
                onClick={() => setShowCollectionModal(true)}
                className="text-xs font-bold text-[#D96B43] hover:underline"
              >
                + New Intake
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {collections.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] space-y-2 hover:border-[#D96B43] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-[#2A2A28]">{c.farmerName}</strong>
                        <span className="text-[10px] font-mono text-[#7A7A70]">{c.id}</span>
                      </div>
                      <span className="text-[11px] text-[#7A7A70]">{c.animalTag} · {c.village}</span>
                    </div>

                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      ₹{c.totalPayout} (Paid)
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                    <div className="bg-[#F4EDE0] p-2 rounded-xl border border-[#EDE7DA]">
                      <span className="text-[9px] font-bold text-[#7A7A70] block uppercase">Volume</span>
                      <strong className="text-[#2A2A28]">{c.liters} L</strong>
                    </div>
                    <div className="bg-[#F4EDE0] p-2 rounded-xl border border-[#EDE7DA]">
                      <span className="text-[9px] font-bold text-[#7A7A70] block uppercase">Fat %</span>
                      <strong className="text-[#D96B43]">{c.fat}%</strong>
                    </div>
                    <div className="bg-[#F4EDE0] p-2 rounded-xl border border-[#EDE7DA]">
                      <span className="text-[9px] font-bold text-[#7A7A70] block uppercase">SNF %</span>
                      <strong className="text-[#2A2A28]">{c.snf}%</strong>
                    </div>
                    <div className="bg-[#F4EDE0] p-2 rounded-xl border border-[#EDE7DA]">
                      <span className="text-[9px] font-bold text-[#7A7A70] block uppercase">Rate/L</span>
                      <strong className="text-emerald-700">₹{c.ratePerLiter}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#7A7A70] pt-1 border-t border-[#EDE7DA]">
                    <span>Recorded: {c.recordedAt || 'Morning Shift'}</span>
                    <span className="text-emerald-700 font-bold">✓ Direct Bank Transfer (DBT)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: TWO-AXIS PRICING & COLLECTION ROUTES */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Two-Axis Price Calculator Card */}
          <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
            <div className="flex items-center gap-2 border-b border-[#EDE7DA] pb-3">
              <IndianRupee className="w-5 h-5 text-emerald-700" />
              <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                Two-Axis Pricing Standard
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F4EDE0] rounded-2xl border border-[#DFD3BF] space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-[#7A7A70] block">
                  COOPERATIVE FORMULA:
                </span>
                <p className="font-mono text-xs text-[#2A2A28] font-bold">
                  Rate/L = (Fat % × ₹5.80) + (SNF % × ₹2.40)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">Murrah Buffalo (7.6% Fat)</span>
                  <div className="text-base font-bold text-emerald-950 mt-1">₹66.80 / L</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-blue-800 uppercase font-bold block">Gir Cow (4.8% Fat)</span>
                  <div className="text-base font-bold text-blue-950 mt-1">₹58.20 / L</div>
                </div>
              </div>
            </div>
          </div>

          {/* Collection Route Status */}
          <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#D96B43]" />
                <h3 className="font-editorial font-bold text-base text-[#2A2A28]">Active Routes</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700">All Live</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { route: 'Route #4 (Mogri - Anand)', farmers: '12 Farmers', time: '6:30 AM - 8:00 AM', status: 'Completed', color: 'bg-emerald-100 text-emerald-800' },
                { route: 'Route #7 (Vadtal Dairy Loop)', farmers: '18 Farmers', time: '7:00 AM - 8:30 AM', status: 'Completed', color: 'bg-emerald-100 text-emerald-800' },
                { route: 'Route #9 (Petlad Chilling Center)', farmers: '15 Farmers', time: '5:00 PM - 6:30 PM', status: 'Upcoming', color: 'bg-amber-100 text-amber-800' }
              ].map((r, i) => (
                <div key={i} className="p-3 rounded-2xl bg-[#F4EDE0] border border-[#DFD3BF] flex items-center justify-between">
                  <div>
                    <strong className="text-[#2A2A28] block">{r.route}</strong>
                    <span className="text-[10px] text-[#7A7A70]">{r.farmers} · {r.time}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.color}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL: RECORD MILK COLLECTION */}
      {showCollectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F8F3EA] rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#DFD3BF] shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-[#EDE7DA] pb-3">
              <div className="flex items-center gap-2 text-[#D96B43]">
                <Droplets className="w-5 h-5" />
                <h3 className="font-editorial font-bold text-base text-[#2A2A28]">
                  Record Farmer Milk Collection
                </h3>
              </div>
              <button
                onClick={() => setShowCollectionModal(false)}
                className="w-8 h-8 rounded-full bg-[#F7F3EA] hover:bg-[#EDE7DA] flex items-center justify-center text-[#7A7A70]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="space-y-3.5 text-xs">
              
              {/* Select Registered Animal & Farmer */}
              <div>
                <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Select Animal / Farmer</label>
                <select
                  value={collectionForm.animalTag}
                  onChange={(e) => {
                    const matched = passports.find(p => `${p.tagNumber} (${p.breed})` === e.target.value);
                    setCollectionForm(prev => ({
                      ...prev,
                      animalTag: e.target.value,
                      farmerName: matched?.owner?.name || prev.farmerName,
                      farmerMobile: matched?.owner?.mobile || prev.farmerMobile,
                      village: `${matched?.owner?.village || 'Mogri'} Route #4`
                    }));
                  }}
                  className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2.5 text-xs text-[#2A2A28]"
                >
                  {passports.map(p => (
                    <option key={p.id} value={`${p.tagNumber} (${p.breed})`}>
                      {p.tagNumber} — {p.breed} (Owner: {p.owner?.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Liters & Quality */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Volume (Liters)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={collectionForm.liters}
                    onChange={(e) => setCollectionForm(prev => ({ ...prev, liters: e.target.value }))}
                    className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28] font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">Fat % (Tester)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={collectionForm.fat}
                    onChange={(e) => setCollectionForm(prev => ({ ...prev, fat: e.target.value }))}
                    className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28] font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-[#7A7A70] block mb-1">SNF % (Hydrometer)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={collectionForm.snf}
                    onChange={(e) => setCollectionForm(prev => ({ ...prev, snf: e.target.value }))}
                    className="w-full bg-[#F4EDE0] border border-[#DFD3BF] rounded-xl px-3.5 py-2 text-xs text-[#2A2A28] font-bold"
                  />
                </div>
              </div>

              {/* Real-time Rate & Payout preview */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">Calculated Milk Rate</span>
                  <div className="text-base font-bold text-emerald-950">₹{calculatedRate} / Litre</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">Total Farmer Payout</span>
                  <div className="text-xl font-bold text-emerald-800">₹{calculatedPayout}</div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCollectionModal(false)}
                  className="flex-1 bg-[#F4EDE0] border border-[#DFD3BF] py-2.5 rounded-xl font-bold text-[#7A7A70]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#D96B43] hover:bg-[#C25832] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Record & Disburse DBT
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
