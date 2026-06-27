// ─── Firebase Storage Service ─────────────────────────────────────────────────
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTaskSnapshot,
} from "firebase/storage";
import { storage } from "./config";
import { logger } from "@/lib/logger/logger";
import { auditLogger, AUDIT_ACTIONS } from "@/lib/logger/auditLogger";
import { errorLogger } from "@/lib/logger/errorLogger";
import { features } from "@/config/features";
import { demo, sleep } from "@/config/demo";

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percent: number;
  state: "running" | "paused" | "success" | "error";
}

/**
 * Upload a file to Firebase Storage with progress tracking.
 * Falls back to simulated progress in Demo Mode.
 */
export async function uploadFile(
  file: File,
  path: string,
  onProgress?: (progress: UploadProgress) => void,
  userId?: string
): Promise<string | null> {
  // ── Demo Mode ──────────────────────────────────────────────────────────────
  if (demo.isActive || !features.ENABLE_FIREBASE || !storage) {
    return simulateUpload(file, path, onProgress);
  }

  // ── Live Firebase Upload ───────────────────────────────────────────────────
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot: UploadTaskSnapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        onProgress?.({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          percent,
          state: snapshot.state as UploadProgress["state"],
        });
      },
      (error) => {
        errorLogger.firebase("uploadFile", error);
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        logger.info("File uploaded", { path, size: file.size });
        if (userId) {
          auditLogger.log({
            userId,
            role: "authority",
            action: AUDIT_ACTIONS.EVIDENCE_UPLOADED,
            target: path,
          });
        }
        resolve(url);
      }
    );
  });
}

/**
 * Simulate upload progress for Demo Mode
 */
async function simulateUpload(
  file: File,
  _path: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const steps = 20;
  const stepMs = demo.uploadSimDurationMs / steps;

  for (let i = 0; i <= steps; i++) {
    const percent = Math.round((i / steps) * 100);
    onProgress?.({
      bytesTransferred: Math.round((i / steps) * file.size),
      totalBytes: file.size,
      percent,
      state: i < steps ? "running" : "success",
    });
    await sleep(stepMs);
  }

  // Return a mock Blob URL in demo mode
  return URL.createObjectURL(file);
}

/**
 * Delete a file from Firebase Storage
 */
export async function deleteFile(path: string): Promise<boolean> {
  if (!storage || !features.ENABLE_FIREBASE) return true; // no-op in demo
  try {
    await deleteObject(ref(storage, path));
    return true;
  } catch (error) {
    errorLogger.firebase("deleteFile", error);
    return false;
  }
}
