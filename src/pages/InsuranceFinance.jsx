import React, { useState, useEffect } from 'react';
import { ShieldCheck, Building2, ExternalLink, CheckCircle2, Search, Filter } from 'lucide-react';

export default function InsuranceFinance() {
  const [schemes, setSchemes] = useState([]);
  const [insurance, setInsurance] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [appliedModal, setAppliedModal] = useState(null);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    fetch('/api/schemes')
      .then(res => res.json())
      .then(data => setSchemes(data))
      .catch(err => console.error(err));

    fetch('/api/insurance')
      .then(res => res.json())
      .then(data => setInsurance(data))
      .catch(err => console.error(err));
  }, []);

  const filteredSchemes = schemes.filter(s => {
    const matchesType = filterType === 'all' || s.type === filterType;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.eligibility.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleApply = (scheme) => {
    setAppliedModal(scheme);
  };

  const confirmApplication = () => {
    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setAppliedModal(null);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-editorial font-bold text-charcoal">
          Livestock <span className="text-terracotta">Insurance & Financial Portal</span>
        </h1>
        <p className="text-xs text-charcoal-muted max-w-xl mx-auto">
          Explore breed-aware government subsidies, NABARD loans, and active insurance coverage policies for Indian dairy farmers.
        </p>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="bg-[#F4EDE0] p-4 rounded-3xl border border-[#DFD3BF] shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes (PKCC, NABARD, Gokul Mission)..."
            className="w-full bg-[#FAF5EB] border border-[#DFD3BF] rounded-2xl pl-9 pr-3 py-2 text-xs text-charcoal focus:outline-none focus:border-terracotta"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'subsidy', 'loan'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold capitalize transition-all ${
                filterType === t
                  ? 'bg-[#324E38] text-white shadow-sm'
                  : 'bg-[#FAF5EB] text-charcoal hover:bg-[#EAE0CD]'
              }`}
            >
              {t === 'all' ? 'All Schemes' : t + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* SCHEMES GRID */}
      <div className="space-y-4">
        <h2 className="text-xl font-editorial font-bold text-charcoal flex items-center gap-2">
          <Building2 className="w-5 h-5 text-terracotta" /> Applicable Government Loans & Subsidies
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSchemes.map((sch) => (
            <div key={sch.id} className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-terracotta/10 text-terracotta">
                    {sch.type}
                  </span>
                  <span className="text-[11px] font-semibold text-[#324E38]">
                    Amount: {sch.amount_range}
                  </span>
                </div>
                <h3 className="font-editorial font-bold text-base text-charcoal">{sch.name}</h3>
                <p className="text-xs text-charcoal-muted mt-1">Offered by: {sch.offered_by}</p>
                
                <div className="mt-3 p-3 bg-[#FAF5EB] rounded-2xl border border-[#DFD3BF] text-xs text-charcoal">
                  <strong>Eligibility:</strong> {sch.eligibility}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={sch.link}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-[#DFD3BF] text-charcoal hover:bg-[#FAF5EB] transition-colors"
                  title="Official Scheme Portal"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleApply(sch)}
                  className="flex-1 bg-terracotta hover:bg-terracotta-hover text-white py-2.5 rounded-xl font-bold text-xs shadow-md"
                >
                  1-Tap Pre-fill & Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INSURANCE PROVIDERS DIRECTORY */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-editorial font-bold text-charcoal flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#324E38]" /> Active Insurance Providers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insurance.map((ins) => (
            <div key={ins.id} className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-charcoal">{ins.name}</h4>
                <p className="text-xs text-charcoal-muted">Coverage: {ins.coverage_amount} · {ins.region}</p>
                <div className="text-xs font-semibold text-[#324E38] mt-1">Helpline: {ins.contact}</div>
              </div>
              <span className="text-xs font-bold text-terracotta bg-terracotta-light px-3 py-1 rounded-full">
                {ins.premium_rate}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* APPLY MODAL */}
      {appliedModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#F4EDE0] border border-[#DFD3BF] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-editorial font-bold text-lg text-charcoal">Apply for {appliedModal.name}</h3>
            <p className="text-xs text-charcoal-muted">Pre-filling application using verified scan passport data.</p>
            
            {successMsg ? (
              <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl text-center text-xs font-bold">
                ✓ Application Successfully Sent to Portal!
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-cream-100 rounded-2xl text-xs space-y-1">
                  <div><strong>Applicant:</strong> Ramesh Patel</div>
                  <div><strong>Mobile:</strong> +919876543210</div>
                  <div><strong>Location:</strong> Anand, Gujarat</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setAppliedModal(null)} className="flex-1 bg-cream-200 text-charcoal py-2.5 rounded-xl font-bold text-xs">
                    Cancel
                  </button>
                  <button onClick={confirmApplication} className="flex-1 bg-terracotta text-white py-2.5 rounded-xl font-bold text-xs">
                    Submit Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
