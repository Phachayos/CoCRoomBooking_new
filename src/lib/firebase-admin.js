import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import fs from 'fs';

// Since we are not using environment variables yet for the key, we will read it directly from the file
// IMPORTANT: Make sure this file is in .gitignore
const serviceAccountPath = path.join(process.cwd(), 'coc-roombooking-firebase-adminsdk-fbsvc-d2518d9cd9.json');
let serviceAccount = null;

try {
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  }
} catch (error) {
  console.error("Error reading Firebase Service Account file", error);
}

let app;
if (!getApps().length) {
  if (serviceAccount) {
    app = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: "coc-roombooking.firebasestorage.app"
    });
  } else {
    console.warn("Firebase Service Account key not found. Firebase Admin SDK may not work properly.");
  }
} else {
    app = getApps()[0];
}

export const adminAuth = app ? getAuth(app) : null;
export const adminDb = app ? getFirestore(app) : null;
export const adminStorage = app ? getStorage(app) : null;
