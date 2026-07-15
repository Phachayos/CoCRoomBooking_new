import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyACgyebF4eqW12xuIguDnqash02VxiLoMM",
  authDomain: "coc-roombooking.firebaseapp.com",
  projectId: "coc-roombooking",
  storageBucket: "coc-roombooking.firebasestorage.app",
  messagingSenderId: "238926672712",
  appId: "1:238926672712:web:6c4cbd5d66c6b36b3b397d",
  measurementId: "G-H43SFLZLY1"
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
