"use client";

import { useState } from "react";
import { useReportsStore } from "@/store/reportsStore";
import { useAuthStore } from "@/store/authStore";
import { verifyRepair } from "@/lib/gemini/resolutionIntelligence";
import { auditLogger, AUDIT_ACTIONS } from "@/lib/logger/auditLogger";
import type { Report, ResolutionIntelligenceResult } from "@/types";

export function useSubmitEvidence(reportId: string) {
  const getReportById = useReportsStore((s) => s.getReportById);
  const setReport = useReportsStore((s) => s.setReport);
  const user = useAuthStore((s) => s.user);

  const report = getReportById(reportId);

  const [uploadedBeforePhoto, setUploadedBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [repairNotes, setRepairNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<number>(0); // 0: idle, 1: uploading, 2: AI analysis, 3: completed
  const [aiResult, setAiResult] = useState<ResolutionIntelligenceResult | null>(null);

  // Compute beforePhoto dynamically: use uploaded if replaced, else use original report image
  const beforePhoto = uploadedBeforePhoto || (report?.media?.imageUrls && report.media.imageUrls[0]) || null;

  const handlePhotoUpload = (type: "before" | "after", file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "before") {
        setUploadedBeforePhoto(reader.result as string);
      } else {
        setAfterPhoto(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (file: File) => {
    setVideoName(file.name);
  };

  const submitEvidence = async () => {
    if (!report || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStep(1); // Uploading

    const userId = user?.userId || "demo-authority-1";

    try {
      // 1. Log upload event
      auditLogger.log({
        userId,
        role: "authority",
        action: AUDIT_ACTIONS.EVIDENCE_UPLOADED,
        target: reportId,
        detail: { notesLength: repairNotes.length, hasVideo: !!videoName },
      });

      // Update status to evidence_uploaded in the store
      const updatedReportUpload: Report = {
        ...report,
        status: "evidence_uploaded",
        updatedAt: new Date(),
      };
      setReport(updatedReportUpload);

      // Simulate upload delay (1500ms)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSubmitStep(2); // AI Analysis

      // 2. Call AI Resolution Intelligence Verification
      const result = await verifyRepair(
        report.description,
        repairNotes,
        !!beforePhoto,
        !!afterPhoto,
        true // gpsVerified
      );
      setAiResult(result);

      // Simulate AI processing delay (2000ms)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 3. Complete and resolve if AI verifies it
      if (result.repairVerified) {
        const finalReport: Report = {
          ...report,
          status: "resolved",
          media: {
            ...report.media,
            imageUrls: [
              ...(report.media?.imageUrls || []),
              ...(afterPhoto ? [afterPhoto] : []),
            ],
          },
          updatedAt: new Date(),
        };
        setReport(finalReport);

        // Log completion audit
        auditLogger.log({
          userId,
          role: "authority",
          action: AUDIT_ACTIONS.WORK_COMPLETED,
          target: reportId,
          detail: { confidence: result.confidence, recommendation: result.closureRecommendation },
        });
      }

      setSubmitStep(3); // Completed
    } catch (err) {
      console.error("Failed to submit repair evidence:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    report,
    beforePhoto,
    afterPhoto,
    videoName,
    repairNotes,
    setRepairNotes,
    isSubmitting,
    submitStep,
    aiResult,
    handlePhotoUpload,
    handleVideoUpload,
    submitEvidence,
  };
}
