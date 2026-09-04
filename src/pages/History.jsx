import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Eye, Calendar, Sparkles } from 'lucide-react';

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scans')
      .then(res => res.json())
      .then(data => {
        setScans(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-editorial font-bold text-charcoal">
            Past Scan <span className="text-terracotta">History & Digital Passports</span>
          </h1>
          <p className="text-xs text-charcoal-muted">Timeline of neural scan predictions and digital passports</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/digital-passport" className="bg-[#F4EDE0] border border-[#DFD3BF] text-charcoal font-bold text-xs px-4 py-2.5 rounded-2xl hover:bg-[#EAE0CD]">
            View Digital Passports &rarr;
          </Link>
          <Link to="/scanner" className="bg-terracotta text-white font-bold text-xs px-4 py-2.5 rounded-2xl">
            + New Scan
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-charcoal-muted">Loading scan history...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(scans.length > 0 ? scans : [
            { id: 'scan_001', predicted_breed: 'murrah', confidence: 0.94, pregnancy_status: 'NA', created_at: '2026-09-03', breed_details: { name: 'Murrah Buffalo' } },
            { id: 'scan_002', predicted_breed: 'gir', confidence: 0.91, pregnancy_status: 'Pregnant (5 mos)', created_at: '2026-09-01', breed_details: { name: 'Gir Cow' } }
          ]).map((sc) => (
            <div key={sc.id} className="bg-[#F4EDE0] p-5 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-terracotta">#{sc.id}</span>
                <span className="text-[10px] text-charcoal-muted">{sc.created_at?.split('T')[0]}</span>
              </div>
              <h3 className="font-editorial font-bold text-base text-charcoal">
                {sc.breed_details?.name || sc.predicted_breed}
              </h3>
              <div className="text-xs text-charcoal space-y-1">
                <div>Confidence: <strong>{Math.round(sc.confidence * 100)}%</strong></div>
                <div>Pregnancy: <strong>{sc.pregnancy_status}</strong></div>
              </div>
              <Link
                to={`/scanner/result/${sc.id}`}
                className="w-full bg-cream-100 hover:bg-cream-200 text-charcoal py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> View Report
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
