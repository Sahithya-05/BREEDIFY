import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import ScanResult from './pages/ScanResult';
import Health from './pages/Health';
import Assistant from './pages/Assistant';
import InsuranceFinance from './pages/InsuranceFinance';
import History from './pages/History';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CommunityFeedback from './pages/CommunityFeedback';
import DigitalPassport from './pages/DigitalPassport';
import PassportDetail from './pages/PassportDetail';
import Identity from './pages/Identity';
import ErrorPage from './pages/ErrorPage';
import AppPreview from './pages/AppPreview';

// Livestock Marketplace Pages
import Marketplace from './pages/Marketplace';
import SellAnimal from './pages/SellAnimal';
import AnimalDetail from './pages/AnimalDetail';
import MyListings from './pages/MyListings';
import SavedAnimals from './pages/SavedAnimals';
import MyPurchases from './pages/MyPurchases';
import SalesHistory from './pages/SalesHistory';

export default function App() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bovine_user');
    if (saved) return JSON.parse(saved);
    const demo = {
      id: 'usr_demo',
      name: 'Bandela Revanth',
      mobile: '+91 98765 43210',
      location: 'Hyderabad, Telangana',
      role: 'farmer',
      preferred_language: 'en'
    };
    try {
      localStorage.setItem('bovine_user', JSON.stringify(demo));
    } catch (_) {}
    return demo;
  });

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('bovine_user');
    localStorage.removeItem('bovine_token');
    setUser(null);
    navigate('/login');
  };

  return (
    <Routes>
      {/* Auth Route */}
      <Route path="/login" element={<Login onLogin={handleLogin} />} />

      {/* Main Application Routes Wrapped in AppLayout */}
      <Route
        path="/dashboard"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <Dashboard user={user} />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/scanner"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <Scanner user={user} />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/scanner/result/:scanId"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <ScanResult user={user} />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/digital-passport"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <DigitalPassport />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/digital-passport/:animalId"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <PassportDetail />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Animal Identity & Iris Biometric Verification */}
      <Route
        path="/identity"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <Identity user={user} />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 🛒 Livestock Marketplace & Selling Feature Routes */}
      <Route
        path="/marketplace"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <Marketplace user={user} />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/marketplace/sell"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <SellAnimal user={user} />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/marketplace/animal/:listingId"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <AnimalDetail user={user} />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/marketplace/my-listings"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <MyListings user={user} />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/marketplace/saved"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <SavedAnimals user={user} />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/marketplace/purchases"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <MyPurchases user={user} />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/marketplace/history"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <SalesHistory user={user} />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Shareable Public QR Passport Link */}
      <Route
        path="/passport/:animalId"
        element={
          <AppLayout user={user || { name: 'Guest Farmer', role: 'farmer' }} onLogout={handleLogout}>
            <PassportDetail />
          </AppLayout>
        }
      />

      <Route
        path="/health"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <Health />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/assistant"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <Assistant />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/insurance-finance"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <InsuranceFinance />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/history"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <History />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/reports"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <Reports />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/profile"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <Profile user={user} />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/settings"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <Settings />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/community-feedback"
        element={
          user ? (
            <AppLayout user={user} onLogout={handleLogout}>
              <CommunityFeedback />
            </AppLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Error Page Routes */}
      <Route
        path="/error/:code"
        element={
          <AppLayout user={user || { name: 'Guest', role: 'farmer' }} onLogout={handleLogout}>
            <ErrorPage />
          </AppLayout>
        }
      />

      {/* Interactive In-App Preview & Showcase */}
      <Route
        path="/preview"
        element={
          <AppLayout user={user || { name: 'Bandela Revanth', role: 'farmer' }} onLogout={handleLogout}>
            <AppPreview />
          </AppLayout>
        }
      />

      {/* Fallback Catch-all Route */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route
        path="*"
        element={
          <AppLayout user={user || { name: 'Guest', role: 'farmer' }} onLogout={handleLogout}>
            <ErrorPage />
          </AppLayout>
        }
      />
    </Routes>
  );
}
