"use client";

import { useState, useEffect } from "react";
import { openDB, type IDBPDatabase } from "idb";
import type { OfflineReport } from "@/types";
import { logger } from "@/lib/logger/logger";
import { features } from "@/config/features";

const DB_NAME = "cityos-offline";
const DB_VERSION = 1;
const STORE_NAME = "offline-reports";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "localId" });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * IndexedDB offline report queue.
 * Stores reports when offline, flushes on reconnect.
 */
export function useOfflineQueue() {
  const [queue, setQueue] = useState<OfflineReport[]>([]);
  const [isFlushing, setIsFlushing] = useState(false);

  async function loadQueue() {
    try {
      const db = await getDB();
      const items = await db.getAll(STORE_NAME) as OfflineReport[];
      setQueue(items);
    } catch (err) {
      logger.error("Failed to load offline queue", { err });
    }
  }

  // Load queue on mount
  useEffect(() => {
    if (!features.ENABLE_OFFLINE_MODE) return;
    Promise.resolve().then(() => {
      loadQueue();
    });
  }, []);

  async function enqueue(report: Omit<OfflineReport, "localId" | "queuedAt" | "retryCount">) {
    if (!features.ENABLE_OFFLINE_MODE) return;
    const entry: OfflineReport = {
      ...report,
      localId: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      queuedAt: new Date(),
      retryCount: 0,
    };
    try {
      const db = await getDB();
      await db.put(STORE_NAME, entry);
      setQueue((prev) => [...prev, entry]);
      logger.info("Report queued offline", { localId: entry.localId });
    } catch (err) {
      logger.error("Failed to queue offline report", { err });
    }
  }

  async function dequeue(localId: string) {
    try {
      const db = await getDB();
      await db.delete(STORE_NAME, localId);
      setQueue((prev) => prev.filter((r) => r.localId !== localId));
    } catch (err) {
      logger.error("Failed to dequeue report", { err });
    }
  }

  async function flushQueue(submitFn: (report: OfflineReport) => Promise<boolean>) {
    if (queue.length === 0 || isFlushing) return;
    setIsFlushing(true);
    logger.info(`Flushing offline queue: ${queue.length} reports`);

    for (const report of queue) {
      try {
        const success = await submitFn(report);
        if (success) await dequeue(report.localId);
      } catch (err) {
        logger.error("Failed to flush offline report", { localId: report.localId });
      }
    }
    setIsFlushing(false);
  }

  return { queue, enqueue, dequeue, flushQueue, isFlushing, pendingCount: queue.length };
}
