// ─── Firebase Configuration ───────────────────────────────────────────────────
// NOTE: All NEXT_PUBLIC_ vars are safe for browser.
// Firebase Admin SDK is used server-side only (in API routes).

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { features } from "@/config/features";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "demo.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "cityos-demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "cityos-demo.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "000000000000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:000000000000:web:demo",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

function initFirebase() {
  if (!features.ENABLE_FIREBASE) return;
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0] ?? null;
  }
  if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
}

// Initialize on module load (client side only)
if (typeof window !== "undefined") {
  initFirebase();
}

export { app, auth, db, storage };
export { firebaseConfig };
