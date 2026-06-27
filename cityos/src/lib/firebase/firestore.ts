// ─── Firestore Service ────────────────────────────────────────────────────────
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type DocumentSnapshot,
  type QueryConstraint,
  serverTimestamp,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";
import { errorLogger } from "@/lib/logger/errorLogger";
import type { Report, User, WorkQueueItem, Analytics, Notification } from "@/types";

// ── Collection References ─────────────────────────────────────────────────────
export const COLLECTIONS = {
  users: "users",
  reports: "reports",
  aiAnalysis: "ai_analysis",
  departments: "departments",
  workQueue: "work_queue",
  repairEvidence: "repair_evidence",
  citizenVerification: "citizen_verification",
  notifications: "notifications",
  analytics: "analytics",
  auditLogs: "audit_logs",
} as const;

// ── Generic Helpers ───────────────────────────────────────────────────────────

export async function getDocument<T>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, collectionName, docId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as T;
  } catch (error) {
    errorLogger.firebase(`getDocument(${collectionName}/${docId})`, error);
    return null;
  }
}

export async function addDocument<T extends object>(
  collectionName: string,
  data: T
): Promise<string | null> {
  if (!db) return null;
  try {
    const ref = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    errorLogger.firebase(`addDocument(${collectionName})`, error);
    return null;
  }
}

export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Partial<Record<string, unknown>>
): Promise<boolean> {
  if (!db) return false;
  try {
    await updateDoc(doc(db, collectionName, docId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    errorLogger.firebase(`updateDocument(${collectionName}/${docId})`, error);
    return false;
  }
}

// ── Real-time Subscriptions ───────────────────────────────────────────────────

export function subscribeToReport(
  reportId: string,
  onUpdate: (report: Report | null) => void
): Unsubscribe {
  if (!db) {
    onUpdate(null);
    return () => {};
  }
  return onSnapshot(doc(db, COLLECTIONS.reports, reportId), (snap) => {
    if (!snap.exists()) {
      onUpdate(null);
      return;
    }
    onUpdate({ reportId: snap.id, ...snap.data() } as Report);
  });
}
