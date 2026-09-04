import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Store, 
  PlusCircle, 
  Package, 
  Heart, 
  ShoppingBag, 
  History,
  Sparkles
} from 'lucide-react';
import { getSavedListingIds, getPurchaseRequests } from '../utils/marketplaceStorage';

export default function MarketplaceSubNav() {
  const location = useLocation();
  const [savedCount, setSavedCount] = useState(0);
  const [purchasesCount, setPurchasesCount] = useState(0);

  useEffect(() => {
    const updateCounters = () => {
      setSavedCount(getSavedListingIds().length);
      setPurchasesCount(getPurchaseRequests().length);
    };
    updateCounters();
    window.addEventListener('storage', updateCounters);
    return () => window.removeEventListener('storage', updateCounters);
  }, [location.pathname]);

  const navItems = [
    { to: '/marketplace', label: 'Marketplace', icon: Store, exact: true },
    { to: '/marketplace/sell', label: 'Sell Animal', icon: PlusCircle, highlight: true },
    { to: '/marketplace/my-listings', label: 'My Listings', icon: Package },
    { to: '/marketplace/saved', label: 'Saved Animals', icon: Heart, badge: savedCount },
    { to: '/marketplace/purchases', label: 'My Purchases', icon: ShoppingBag, badge: purchasesCount },
    { to: '/marketplace/history', label: 'Sales History', icon: History }
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md border border-[#2A2A28]/10 rounded-2xl sticky top-2 z-30 shadow-xs mb-6 px-3 sm:px-4 py-1.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-2 scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.to 
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  item.highlight
                    ? isActive
                      ? 'bg-[#D96B43] text-white shadow-sm'
                      : 'bg-[#D96B43]/10 text-[#D96B43] hover:bg-[#D96B43]/20 font-semibold'
                    : isActive
                      ? 'bg-[#324E38] text-white shadow-sm'
                      : 'text-[#2A2A28]/70 hover:text-[#2A2A28] hover:bg-[#F4EDE0]/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.highlight && !isActive ? 'text-[#D96B43]' : ''}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-[#324E38]' : 'bg-[#D96B43] text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-[#324E38] bg-[#324E38]/5 px-3 py-1.5 rounded-full font-medium whitespace-nowrap">
          <Sparkles className="w-3.5 h-3.5 text-[#D96B43]" />
          <span>Verified Pashu Mandi</span>
        </div>
      </div>
    </div>
  );
}
