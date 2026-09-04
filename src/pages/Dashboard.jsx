import React from 'react';
import FarmerDashboard from './FarmerDashboard';
import VetDashboard from './VetDashboard';
import VendorDashboard from './VendorDashboard';

export default function Dashboard({ user }) {
  const currentUser = user || JSON.parse(localStorage.getItem('bovine_user') || '{}') || {
    name: 'Ramesh Patel',
    role: 'farmer',
    location: 'Anand, Gujarat'
  };

  const role = (currentUser.role || 'farmer').toLowerCase();

  if (role === 'vet' || role === 'veterinarian') {
    return <VetDashboard user={currentUser} />;
  }

  if (role === 'vendor' || role === 'milk_vendor' || role === 'flw') {
    return <VendorDashboard user={currentUser} />;
  }

  return <FarmerDashboard user={currentUser} />;
}
