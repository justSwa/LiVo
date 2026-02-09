import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: "AIzaSyAgzVdxeoamL8JqiyZsVG7xnGTCDdWLotM",
  authDomain: "livo-dac75.firebaseapp.com",
  databaseURL: "https://livo-dac75-default-rtdb.firebaseio.com",
  projectId: "livo-dac75",
  storageBucket: "livo-dac75.firebasestorage.app",
  messagingSenderId: "757583989992",
  appId: "1:757583989992:web:3cca29d7fd818d8ad8cd5d",
  measurementId: "G-2R4CNGNKR6"
};

// Initialize Firebase v9 modular SDK
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : undefined;

// Google Auth Provider for "Sign in with Google"
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
// Request Calendar access scope
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');

let appCheck;
if (typeof window !== 'undefined') {
  const siteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY;
  const enableInDev = import.meta.env.VITE_FIREBASE_APPCHECK_DEV === 'true';
  const shouldEnable = !!siteKey && (import.meta.env.PROD || enableInDev);
  if (shouldEnable) {
    if (import.meta.env.DEV) {
      (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true
    });
  }
}

export { appCheck };