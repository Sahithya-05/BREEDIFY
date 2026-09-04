import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Radio, Award } from 'lucide-react';

export default function Reports() {
  const [mandiPrices, setMandiPrices] = useState([]);

  useEffect(() => {
    fetch('/api/mandi')
      .then(res => res.json())
      .then(data => setMandiPrices(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-editorial font-bold text-charcoal">
          Analytics & <span className="text-terracotta">Mandi Price Reports</span>
        </h1>
        <p className="text-xs text-charcoal-muted max-w-xl mx-auto">
          Real-time mandi market pricing, milk yield forecasts, and genomic purity distributions across Indian districts.
        </p>
      </div>

      {/* MANDI PRICE TABLE */}
      <div className="bg-[#F4EDE0] rounded-3xl border border-[#DFD3BF] shadow-soft overflow-hidden space-y-4 p-6">
        <h2 className="text-xl font-editorial font-bold text-charcoal flex items-center gap-2">
          <Radio className="w-5 h-5 text-terracotta" /> Mandi Produce Pricing Ticker
        </h2>
        <div className="divide-y divide-[#EDE7DA]">
          {(mandiPrices.length > 0 ? mandiPrices : [
            { state: 'Haryana', district: 'Karnal', item: 'Murrah Buffalo Milk (7% Fat)', price_per_unit: '₹62 / Liter', date: '2026-09-03' },
            { state: 'Gujarat', district: 'Anand', item: 'Gir Cow Milk (A2 Quality)', price_per_unit: '₹68 / Liter', date: '2026-09-03' },
            { state: 'Punjab', district: 'Ludhiana', item: 'Sahiwal Cow Milk (4.5% Fat)', price_per_unit: '₹58 / Liter', date: '2026-09-03' }
          ]).map((m, i) => (
            <div key={i} className="py-3.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-charcoal block">{m.item}</span>
                <span className="text-charcoal-muted">{m.district}, {m.state}</span>
              </div>
              <span className="font-bold text-terracotta text-sm">{m.price_per_unit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* GENOMIC PURITY & YIELD ANALYTICS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-3">
          <span className="label-uppercase">GENOMIC PURITY INDEX</span>
          <div className="text-2xl font-editorial font-bold text-charcoal">94.8% Indigenous Purity</div>
          <p className="text-xs text-charcoal-muted">
            Evaluated against ICAR-NBAGR national breed references for Gir & Murrah lines.
          </p>
        </div>
        <div className="bg-[#F4EDE0] p-6 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-3">
          <span className="label-uppercase">ANNUAL MILK YIELD FORECAST</span>
          <div className="text-2xl font-editorial font-bold text-[#324E38]">4,200 Liters / Year</div>
          <p className="text-xs text-charcoal-muted">
            Based on 305-day standard lactation curve under recommended feeding plan.
          </p>
        </div>
      </div>
    </div>
  );
}
