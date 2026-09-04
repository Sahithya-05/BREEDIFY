import React from 'react';
import { User, MapPin, Phone, ShieldCheck, Tractor } from 'lucide-react';

export default function Profile({ user }) {
  const currentUser = user || JSON.parse(localStorage.getItem('bovine_user') || '{}') || {
    name: 'Ramesh Patel',
    mobile: '+919876543210',
    location: 'Anand, Gujarat',
    role: 'farmer',
    preferred_language: 'en'
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-editorial font-bold text-charcoal">
          Farmer & Farm <span className="text-terracotta">Profile</span>
        </h1>
        <p className="text-xs text-charcoal-muted">Verified livestock owner record</p>
      </div>

      <div className="bg-[#F4EDE0] p-8 rounded-3xl border border-[#DFD3BF] shadow-soft space-y-6">
        <div className="flex items-center gap-4 border-b border-[#EDE7DA] pb-6">
          <div className="w-16 h-16 rounded-full bg-[#324E38] text-white flex items-center justify-center text-2xl font-bold font-editorial">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-editorial font-bold text-charcoal">{currentUser.name}</h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-terracotta/10 text-terracotta uppercase">
              Role: {currentUser.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-[#FAF5EB] border border-[#DFD3BF] rounded-2xl">
            <span className="label-uppercase block mb-1">MOBILE NUMBER</span>
            <div className="font-bold text-charcoal">{currentUser.mobile}</div>
          </div>
          <div className="p-4 bg-[#FAF5EB] border border-[#DFD3BF] rounded-2xl">
            <span className="label-uppercase block mb-1">LOCATION</span>
            <div className="font-bold text-charcoal">{currentUser.location}</div>
          </div>
          <div className="p-4 bg-[#FAF5EB] border border-[#DFD3BF] rounded-2xl">
            <span className="label-uppercase block mb-1">PREFERRED LANGUAGE</span>
            <div className="font-bold text-charcoal uppercase">{currentUser.preferred_language || 'EN'}</div>
          </div>
          <div className="p-4 bg-[#FAF5EB] border border-[#DFD3BF] rounded-2xl">
            <span className="label-uppercase block mb-1">REGISTERED ANIMALS</span>
            <div className="font-bold text-charcoal">2 Cattle & Buffaloes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
