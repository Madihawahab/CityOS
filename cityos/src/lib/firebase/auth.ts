// ─── Firebase Auth Service ────────────────────────────────────────────────────
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./config";
import { logger } from "@/lib/logger/logger";
import { errorLogger } from "@/lib/logger/errorLogger";
import { features } from "@/config/features";

export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  if (!auth || !features.ENABLE_FIREBASE) {
    throw new Error("Firebase auth not available");
  }
  try {
    logger.auth("SIGN_IN_ATTEMPT", email);
    const result = await signInWithEmailAndPassword(auth, email, password);
    logger.auth("SIGN_IN_SUCCESS", result.user.uid);
    return result.user;
  } catch (error) {
    logger.auth("SIGN_IN_FAILURE");
    errorLogger.firebase("signInWithEmail", error);
    throw error;
  }
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  if (!auth || !features.ENABLE_FIREBASE) {
    throw new Error("Firebase auth not available");
  }
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  logger.auth("GOOGLE_SIGN_IN_SUCCESS", result.user.uid);
  return result.user;
}

export async function registerWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  if (!auth || !features.ENABLE_FIREBASE) {
    throw new Error("Firebase auth not available");
  }
  const result = await createUserWithEmailAndPassword(auth, email, password);
  logger.auth("REGISTER_SUCCESS", result.user.uid);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
  logger.auth("SIGN_OUT");
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
