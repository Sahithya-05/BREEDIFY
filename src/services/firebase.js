import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const getEnv = (key, fallback) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

export const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', 'breedify-8cbf8.firebaseapp.com'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', 'breedify-8cbf8'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', 'breedify-8cbf8.firebasestorage.app'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '641224261328'),
  appId: getEnv('VITE_FIREBASE_APP_ID', '1:641224261328:web:b5a1669278b684a4dc28d5'),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID', 'G-N5ERVG4T48')
};

// Initialize Firebase singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
