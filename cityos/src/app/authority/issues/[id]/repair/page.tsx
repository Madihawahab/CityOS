"use client";

import { use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSubmitEvidence } from "@/hooks/useSubmitEvidence";

interface RepairPageProps {
  params: Promise<{ id: string }>;
}

export default function SubmitEvidencePage({ params }: RepairPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const {
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
  } = useSubmitEvidence(resolvedParams.id);

  if (!report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1c] p-6 text-slate-300">
        <span className="material-symbols-outlined text-6xl text-slate-700 animate-pulse">error</span>
        <h2 className="text-xl font-bold text-white mt-4">Issue Report Not Found</h2>
        <button
          onClick={() => router.push("/authority")}
          className="mt-6 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const onFileChange = (type: "before" | "after", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(type, file);
    }
  };

  const onVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoUpload(file);
    }
  };

  const isFormValid = afterPhoto !== null && repairNotes.trim().length >= 10;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 bg-[#0a0f1c] min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/authority/issues/${report.reportId}`}
            className="text-xs text-blue-500 hover:underline flex items-center gap-1 focus:outline-none"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Back to Details
          </Link>
        </div>
        <span className="text-xs text-slate-500 font-semibold">Repair Submission for #{report.reportId}</span>
      </div>

      {/* Main submission view */}
      {submitStep === 0 && (
        <section className="bg-[#12192c] rounded-2xl border border-slate-800/50 p-6 flex flex-col space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-2 text-white">Submit Repair Evidence</h3>
            <p className="text-xs text-slate-400">
              Provide photographic evidence of the resolved issue and add completion notes for AI verification.
            </p>
          </div>

          {/* Upload photos grid */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Upload Before &amp; After Photos</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before Photo */}
              <div
                onClick={() => beforeInputRef.current?.click()}
                className="relative aspect-video bg-[#1a2337]/50 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer overflow-hidden group"
              >
                {beforePhoto ? (
                  <>
                    <img alt="Before" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" src={beforePhoto} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">
                      <span className="material-symbols-outlined mb-1">add_a_photo</span>
                      Replace Before
                    </div>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[28px] mb-1">add_a_photo</span>
                    <span className="text-[10px] font-bold">Upload Before Photo</span>
                  </>
                )}
                <input
                  type="file"
                  ref={beforeInputRef}
                  onChange={(e) => onFileChange("before", e)}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* After Photo */}
              <div
                onClick={() => afterInputRef.current?.click()}
                className="relative aspect-video bg-[#1a2337]/50 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all cursor-pointer overflow-hidden group"
              >
                {afterPhoto ? (
                  <>
                    <img alt="After" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" src={afterPhoto} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">
                      <span className="material-symbols-outlined mb-1">add_a_photo</span>
                      Replace After
                    </div>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[28px] mb-1">add_a_photo</span>
                    <span className="text-[10px] font-bold">Upload After Photo *</span>
                  </>
                )}
                <input
                  type="file"
                  ref={afterInputRef}
                  onChange={(e) => onFileChange("after", e)}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Optional Video Upload */}
          <div className="p-4 bg-[#1a2337]/30 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-500">
                <span className="material-symbols-outlined text-[20px]">videocam</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-300">Upload Video (Optional)</p>
                <p className="text-[9px] text-slate-500 truncate max-w-[200px]">
                  {videoName ? `Selected: ${videoName}` : "Max 30 MB, .mp4 or .mov"}
                </p>
              </div>
            </div>
            <button
              onClick={() => videoInputRef.current?.click()}
              className="text-xs font-bold text-blue-500 hover:underline focus:outline-none"
            >
              {videoName ? "Change" : "Browse"}
            </button>
            <input
              type="file"
              ref={videoInputRef}
              onChange={onVideoChange}
              accept="video/*"
              className="hidden"
            />
          </div>

          {/* Repair Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Repair Notes *
            </label>
            <textarea
              id="notes"
              value={repairNotes}
              onChange={(e) => setRepairNotes(e.target.value)}
              className="w-full bg-[#1a2337]/50 border border-slate-800 hover:border-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl text-xs placeholder:text-slate-600 text-white p-4 focus:outline-none"
              placeholder="Provide a detailed explanation of the repair work conducted (minimum 10 characters)..."
              rows={4}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-800">
            <Link
              href={`/authority/issues/${report.reportId}`}
              className="px-6 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              disabled={!isFormValid || isSubmitting}
              onClick={submitEvidence}
              className={`px-8 py-2 rounded-lg text-xs font-bold transition-all shadow-lg ${
                isFormValid
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
              }`}
            >
              Submit for Verification
            </button>
          </div>
        </section>
      )}

      {/* Uploading progress screen */}
      {submitStep === 1 && (
        <section className="bg-[#12192c] rounded-2xl border border-slate-800/50 p-12 text-center flex flex-col items-center justify-center space-y-6">
          <div className="h-16 w-16 rounded-full border-[3px] border-t-blue-500 border-slate-800 animate-spin" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Uploading Repair Evidence...</h3>
            <p className="text-xs text-slate-500">Storing high-resolution visual evidence and notes safely in Firestore.</p>
          </div>
          <div className="w-full max-w-xs h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-[loading_1.5s_infinite]" style={{ width: "60%" }} />
          </div>
        </section>
      )}

      {/* AI Verification Analysis screen */}
      {submitStep === 2 && (
        <section className="bg-[#12192c] rounded-2xl border border-slate-800/50 p-12 text-center flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 animate-pulse">
              <span className="material-symbols-outlined text-[32px]">auto_awesome</span>
            </div>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Resolution Intelligence Scanning...</h3>
            <p className="text-xs text-slate-500">AI is reviewing before/after imagery, matching GPS coordinates, and checking notes.</p>
          </div>
          <div className="text-xs text-blue-400 font-semibold bg-blue-500/5 px-4 py-2 rounded-lg border border-blue-500/10 animate-pulse">
            Analyzing visual consistency between Before &amp; After states
          </div>
        </section>
      )}

      {/* Completed verification screen */}
      {submitStep === 3 && aiResult && (
        <section className="bg-[#12192c] rounded-2xl border border-slate-800/50 p-8 flex flex-col space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
            {aiResult.repairVerified ? (
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <span className="material-symbols-outlined text-[28px]">verified</span>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <span className="material-symbols-outlined text-[28px]">error</span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-white">
                {aiResult.repairVerified ? "AI Verification Successful!" : "AI Verification Unsuccessful"}
              </h3>
              <p className="text-xs text-slate-500">
                Resolution Intelligence Report generated with {Math.round(aiResult.confidence * 100)}% confidence score.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#1a2337]/50 p-4 rounded-xl space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI Assessment Reason</p>
              <p className="text-xs text-slate-300 leading-relaxed">{aiResult.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500 font-medium">Resolution Status</p>
                <p className={`font-semibold mt-0.5 ${aiResult.repairVerified ? "text-green-400" : "text-red-400"}`}>
                  {aiResult.repairVerified ? "Resolved (Report Closed)" : "Pending Investigation"}
                </p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Closure Recommendation</p>
                <p className="font-semibold text-slate-200 mt-0.5 capitalize">{aiResult.closureRecommendation}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-800">
            <button
              onClick={() => router.push("/authority")}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              Back to Dashboard
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
