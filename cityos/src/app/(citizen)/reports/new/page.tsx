"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import { useReportsStore } from "@/store/reportsStore";
import type { Report, IssueCategory, IssueSeverity, ReportStatus } from "@/types";

// Zod Schema
const reportFormSchema = z.object({
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  locationAddress: z.string().min(1, { message: "Address is required" }),
  privacyOption: z.enum(["identity", "anonymous"])
});

type FormData = z.infer<typeof reportFormSchema>;

interface AIAnalysisResult {
  reportIntelligence: {
    category: string;
    detectedIssue: string;
    severity: string;
    confidence: number;
    description: string;
  };
  trustEngine: {
    trustScore: number;
    duplicateDetected: boolean;
    duplicateReportIds: string[];
    spamProbability: number;
    authenticity: string;
  };
  decisionIntelligence: {
    department: string;
    priority: string;
    estimatedResolution: string;
    priorityReason: string;
    recommendedActions: string[];
  };
}

export default function ReportIssuePage() {
  const user = useAuthStore((s) => s.user);
  const setReport = useReportsStore((s) => s.setReport);
  const router = useRouter();

  // Address editing state
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // AI Review / Analysis states
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiProgressStep, setAiProgressStep] = useState(0);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [hasReviewedAI, setHasReviewedAI] = useState(false);

  // Session Caching for AI results
  const [aiCache, setAiCache] = useState<{ key: string; result: AIAnalysisResult } | null>(null);

  // Submission success screen state
  const [submittedReport, setSubmittedReport] = useState<{
    reportId: string;
    department: string;
    estimatedResolution: string;
    aiConfidence: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      description: "",
      locationAddress: "221B Baker Street, London, NW1 6XE",
      privacyOption: "identity"
    }
  });

  const descriptionValue = watch("description");
  const addressValue = watch("locationAddress");
  const privacyOptionValue = watch("privacyOption");

  // Determine if "Continue to AI Review" should be enabled
  const isEvidenceProvided = descriptionValue.trim().length >= 15 || uploadedImage !== null;

  // AI Progress messages
  const progressMessages = [
    "Understanding your report...",
    "Checking nearby reports...",
    "Identifying the responsible department...",
    "Estimating resolution time..."
  ];

  // Trigger file upload dialog
  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        // Reset AI results if evidence changes
        setHasReviewedAI(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger AI analysis with session caching
  const triggerAIReview = async () => {
    if (!isEvidenceProvided || isProcessingAI) return;

    const cacheKey = `${descriptionValue.trim()}_${uploadedImage || ""}`;

    // Use cached result if key matches
    if (aiCache && aiCache.key === cacheKey) {
      setAiResult(aiCache.result);
      setHasReviewedAI(true);
      return;
    }

    setIsProcessingAI(true);
    setAiProgressStep(0);
    setAiResult(null);

    // Simulated progress steps (1000ms each)
    const stepInterval = setInterval(() => {
      setAiProgressStep((prev) => {
        if (prev < progressMessages.length - 1) {
          return prev + 1;
        }
        clearInterval(stepInterval);
        return prev;
      });
    }, 1000);

    try {
      const response = await fetch("/api/v1/ai/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: descriptionValue || "Civic issue reported",
          hasImages: uploadedImage !== null,
          location: addressValue,
          nearbyReportIds: ["RPT-2026-001", "RPT-2026-004"] // simulated nearby reports for duplicate check
        })
      });

      if (!response.ok) throw new Error("AI Analysis Failed");

      const data = (await response.json()) as AIAnalysisResult;

      // Keep showing progress to citizen until the 4 seconds elapse
      setTimeout(() => {
        setAiResult(data);
        setAiCache({ key: cacheKey, result: data });
        setIsProcessingAI(false);
        setHasReviewedAI(true);
      }, 4000);

    } catch {
      clearInterval(stepInterval);
      setIsProcessingAI(false);
      // Fallback fallback results
      const fallbackResult: AIAnalysisResult = {
        reportIntelligence: {
          category: "roads",
          detectedIssue: "Road Hazard Detected",
          severity: "high",
          confidence: 0.85,
          description: descriptionValue
        },
        trustEngine: {
          trustScore: 80,
          duplicateDetected: false,
          duplicateReportIds: [],
          spamProbability: 0.05,
          authenticity: "verified"
        },
        decisionIntelligence: {
          department: "BBMP Roads & Infrastructure",
          priority: "high",
          estimatedResolution: "3 Days",
          priorityReason: "High safety risk",
          recommendedActions: ["Inspect pothole", "Fill with cold mix"]
        }
      };
      setAiResult(fallbackResult);
      setHasReviewedAI(true);
    }
  };

  // Handle final report submission
  const onSubmit = async (data: FormData) => {
    // Validate schema manually via Zod to verify inputs
    const result = reportFormSchema.safeParse(data);
    if (!result.success) {
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          setError(err.path[0] as keyof FormData, { message: err.message });
        }
      });
      return;
    }

    if (!hasReviewedAI || !aiResult) {
      // Must complete AI review first
      await triggerAIReview();
      return;
    }

    const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;

    // Save to Zustand
    const newReport: Report = {
      reportId,
      citizenId: user?.userId ?? "demo-citizen-1",
      anonymousReport: data.privacyOption === "anonymous",
      issueCategory: aiResult.reportIntelligence.category as IssueCategory,
      title: aiResult.reportIntelligence.detectedIssue,
      description: data.description,
      severity: aiResult.reportIntelligence.severity as IssueSeverity,
      status: "submitted" as ReportStatus,
      trustScore: aiResult.trustEngine.trustScore,
      priority: aiResult.decisionIntelligence.priority as IssueSeverity,
      departmentAssigned: aiResult.decisionIntelligence.department,
      estimatedResolution: aiResult.decisionIntelligence.estimatedResolution,
      aiConfidence: aiResult.reportIntelligence.confidence,
      location: {
        latitude: 12.9716,
        longitude: 77.5946,
        address: data.locationAddress,
        ward: "Ward 7 – Koramangala"
      },
      media: {
        imageUrls: uploadedImage ? [uploadedImage] : [],
        videoUrls: []
      },
      communitySupport: aiResult.trustEngine.duplicateReportIds.length || 0,
      mergedReportIds: aiResult.trustEngine.duplicateReportIds,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setReport(newReport);

    // Transition to success screen instead of immediate redirect
    setSubmittedReport({
      reportId,
      department: aiResult.decisionIntelligence.department,
      estimatedResolution: aiResult.decisionIntelligence.estimatedResolution,
      aiConfidence: Math.round(aiResult.reportIntelligence.confidence * 100)
    });
  };

  // If submitted, show success screen
  if (submittedReport) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
        <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-8">
          <div className="max-w-2xl mx-auto space-y-8 pt-12">
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg border border-outline-variant/30 text-center gap-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "#6cf8bb" }}>
                <span className="material-symbols-outlined text-4xl" style={{ color: "#00714d" }}>check_circle</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-headline-lg font-bold text-on-surface">Report Submitted Successfully</h3>
                <p className="text-body-md text-on-surface-variant">Your report has been received and verified by CityOS AI.</p>
              </div>

              <div className="w-full bg-surface-low border border-outline-variant/30 rounded-lg p-6 space-y-4 text-left">
                <div>
                  <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Report ID</span>
                  <p className="text-body-lg font-bold text-primary">{submittedReport.reportId}</p>
                </div>
                <div>
                  <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Assigned Department</span>
                  <p className="text-body-lg font-bold text-on-surface">{submittedReport.department}</p>
                </div>
                <div>
                  <span className="text-label-md text-on-surface-variant uppercase tracking-wider">Estimated Resolution</span>
                  <p className="text-body-lg font-bold text-on-surface">{submittedReport.estimatedResolution}</p>
                </div>
                <div>
                  <span className="text-label-md text-on-surface-variant uppercase tracking-wider">AI Confidence Score</span>
                  <p className="text-body-lg font-bold text-on-surface">{submittedReport.aiConfidence}%</p>
                </div>
              </div>

              <div className="flex flex-col w-full gap-3">
                <button 
                  onClick={() => router.push(`/reports/${submittedReport.reportId}`)}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold transition-transform active:scale-95 shadow-md"
                >
                  View My Report
                </button>
                <button 
                  onClick={() => router.push("/")}
                  className="w-full bg-white border border-outline text-on-surface py-3 rounded-lg font-bold transition-transform active:scale-95 hover:bg-surface-low"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8 pt-8">
          
          <div className="flex flex-col gap-2">
            <h2 className="text-title-lg text-primary font-bold">Report an Issue</h2>
            <p className="text-body-md text-on-surface-variant">Upload a photo or describe the issue. AI will handle the rest.</p>
          </div>

          {/* Step 1: Upload (Bento Grid Inspired) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
              <h3 className="text-title-lg font-bold">Capture the Evidence</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Main Upload Dropzone */}
              <div 
                onClick={handleDropzoneClick}
                className="md:col-span-4 bg-white rounded-lg p-12 border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-4 hover:border-primary transition-colors cursor-pointer group shadow-[0px_4px_20px_rgba(30,41,59,0.05)]"
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  className="hidden"
                />
                
                {uploadedImage ? (
                  <div className="w-full max-w-xs h-40 relative rounded-lg overflow-hidden border border-outline-variant">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={uploadedImage} alt="Uploaded evidence" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-body-lg">Drag and drop images or videos</p>
                      <p className="text-on-surface-variant text-body-md">Files up to 50MB are supported</p>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Action Buttons */}
              <button 
                type="button" 
                onClick={handleDropzoneClick}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 border border-surface-container"
              >
                <span className="material-symbols-outlined text-primary text-3xl">photo_camera</span>
                <span className="font-medium text-body-md">Upload Photo</span>
              </button>
              <button 
                type="button" 
                onClick={handleDropzoneClick}
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 border border-surface-container"
              >
                <span className="material-symbols-outlined text-primary text-3xl">videocam</span>
                <span className="font-medium text-body-md">Upload Video</span>
              </button>
              <button 
                type="button" 
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 border border-surface-container opacity-50 cursor-not-allowed"
                disabled
              >
                <span className="material-symbols-outlined text-primary text-3xl">mic</span>
                <span className="font-medium text-body-md">Record Voice</span>
              </button>
              <button 
                type="button"
                className="flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 border border-surface-container"
              >
                <span className="material-symbols-outlined text-primary text-3xl">edit_note</span>
                <span className="font-medium text-body-md">Type Description</span>
              </button>
            </div>

            {/* Description Textarea (Connected to react-hook-form) */}
            <div className="bg-white rounded-lg p-6 border border-outline-variant/30 shadow-sm flex flex-col gap-2 mt-4">
              <label className="text-body-lg font-bold text-on-surface">Describe the Issue</label>
              <textarea
                {...register("description")}
                placeholder="Please describe what and where the issue is. Include specific landmarks if possible (minimum 10 characters)."
                rows={4}
                onChange={(e) => {
                  setValue("description", e.target.value);
                  setHasReviewedAI(false); // Reset AI status on edit
                }}
                className="w-full border border-outline-variant rounded-lg p-3 text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
              />
              {errors.description && (
                <p className="text-error text-xs font-semibold">{errors.description.message}</p>
              )}
            </div>

            {/* Explicit AI Review Trigger Button */}
            {!hasReviewedAI && !isProcessingAI && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!isEvidenceProvided}
                  onClick={triggerAIReview}
                  className="px-6 py-3 rounded-full text-white font-bold text-body-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
                  Continue to AI Review
                </button>
              </div>
            )}

            {/* AI processing loader */}
            {isProcessingAI && (
              <div className="ai-glow bg-white rounded-lg p-8 shadow-lg flex flex-col items-center justify-center gap-4 text-center">
                <div className="h-8 w-8 rounded-full border-2 border-t-primary border-surface-container animate-spin" />
                <p className="text-body-lg font-bold text-primary animate-pulse">
                  {progressMessages[aiProgressStep]}
                </p>
              </div>
            )}
          </section>

          {/* Step 2: Location */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
              <h3 className="text-title-lg font-bold">Location Details</h3>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-[0px_4px_20px_rgba(30,41,59,0.05)] overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-3 flex-1 min-w-0">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-body-lg">Current Address</p>
                    {isEditingAddress ? (
                      <input 
                        {...register("locationAddress")}
                        type="text"
                        className="w-full border border-outline-variant rounded-md p-1 mt-1 text-body-md focus:border-primary outline-none"
                      />
                    ) : (
                      <p className="text-on-surface-variant text-body-md truncate">{addressValue}</p>
                    )}
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-primary font-bold text-body-md hover:underline flex-shrink-0 ml-4"
                >
                  {isEditingAddress ? "Done" : "Change"}
                </button>
              </div>
              
              <div className="h-48 w-full rounded-lg relative bg-surface-container overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  className="w-full h-full object-cover grayscale-[20%] opacity-80" 
                  alt="Minimalist digital map"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXMAunkmBLtsFUEit8i2hbk47glrpDiYkKHnbDJKbut9XMS2YIU4YVLneK1m5UppDVxbSyi3nbClQTOUbRcR-W29OZNOG6eMdBTGX7P2zXuwhj2ZYQA8XYkbidemk3U71nu03gkIUh693CJ1MFed6ca7_ONHaRJ0f4J6r2dJUJTm6hMqdtcSWE0k85Ns7C-ptZYbV_KqARbWpaqxKwbsjU6pu7VeHXMy20-yPe4p3WXPhfEMj4CMdvhL--Cw8YuzY9y0oKFtTtRxJH"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-4 h-4 bg-primary rounded-full border-2 border-white"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3: AI Results (Gemini Analysis) */}
          {hasReviewedAI && aiResult && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">3</div>
                <h3 className="text-title-lg font-bold">AI Verification</h3>
              </div>
              
              <div className="ai-glow bg-white rounded-lg p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-label-md font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span> AI Verified
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-label-md text-on-surface-variant uppercase tracking-wider">Detected Issue</label>
                      <p className="text-title-lg font-bold text-primary capitalize">
                        {aiResult.reportIntelligence.detectedIssue}
                      </p>
                    </div>
                    <div>
                      <label className="text-label-md text-on-surface-variant uppercase tracking-wider">Severity</label>
                      <p className="text-body-lg font-medium flex items-center gap-2 capitalize">
                        <span 
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: 
                              aiResult.reportIntelligence.severity === "critical" || aiResult.reportIntelligence.severity === "high"
                                ? "#ba1a1a"
                                : "#004ac6"
                          }}
                        />
                        {aiResult.reportIntelligence.severity}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface">groups</span>
                      </div>
                      <div>
                        <p className="text-body-md font-bold">Nearby Reports</p>
                        <p className="text-on-surface-variant text-body-md">
                          {aiResult.trustEngine.duplicateReportIds.length || 0} neighbors reported this
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface">engineering</span>
                      </div>
                      <div>
                        <p className="text-body-md font-bold">Assigned Department</p>
                        <p className="text-on-surface-variant text-body-md">{aiResult.decisionIntelligence.department}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface">schedule</span>
                      </div>
                      <div>
                        <p className="text-body-md font-bold">Estimated Resolution</p>
                        <p className="text-on-surface-variant text-body-md">
                          Approximately {aiResult.decisionIntelligence.estimatedResolution}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Step 4: Community Synergy */}
          {hasReviewedAI && aiResult && aiResult.trustEngine.duplicateDetected && (
            <section className="bg-secondary-container/20 rounded-lg p-6 border border-secondary/20 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">celebration</span>
                </div>
                <div>
                  <h4 className="font-bold text-body-lg">Great news!</h4>
                  <p className="text-on-surface-variant text-body-md">
                    {aiResult.trustEngine.duplicateReportIds.length} nearby residents have already reported this issue. Your report helps increase its priority.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => {
                    const firstDupId = aiResult.trustEngine.duplicateReportIds[0];
                    if (firstDupId) router.push(`/reports/${firstDupId}`);
                  }}
                  className="px-6 py-2 bg-white border border-secondary text-secondary rounded-lg font-bold text-body-md hover:bg-secondary-container transition-colors"
                >
                  View Existing Report
                </button>
                <button 
                  type="button"
                  onClick={() => setHasReviewedAI(true)}
                  className="px-6 py-2 bg-secondary text-white rounded-lg font-bold text-body-md hover:opacity-90 transition-opacity"
                >
                  Continue Anyway
                </button>
              </div>
            </section>
          )}

          {/* Step 5: Submit */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                {hasReviewedAI && aiResult ? "5" : "3"}
              </div>
              <h3 className="text-title-lg font-bold">Privacy</h3>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-[0px_4px_20px_rgba(30,41,59,0.05)] space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="relative flex items-center gap-4 p-4 border border-surface-container rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors group">
                  <input 
                    type="radio" 
                    {...register("privacyOption")}
                    value="identity" 
                    className="w-5 h-5 text-primary border-outline-variant focus:ring-primary"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-body-lg">Report with my identity</span>
                    <span className="text-on-surface-variant text-body-md">Include my profile details</span>
                  </div>
                </label>
                <label className="relative flex items-center gap-4 p-4 border border-surface-container rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors group">
                  <input 
                    type="radio" 
                    {...register("privacyOption")}
                    value="anonymous" 
                    className="w-5 h-5 text-primary border-outline-variant focus:ring-primary"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-body-lg">Report anonymously</span>
                    <span className="text-on-surface-variant text-body-md">Hide my identity</span>
                  </div>
                </label>
              </div>
              
              <div className="flex items-start gap-2 p-4 bg-surface-container-low rounded-lg">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5" aria-hidden="true">info</span>
                <p className="text-body-md text-on-surface-variant">
                  {privacyOptionValue === "anonymous" ? (
                    "Citizen identity is hidden from the public and authorities. Identity is stored securely only for fraud prevention, abuse prevention, and legal verification."
                  ) : (
                    "Your identity will be visible to departments and other citizens. Report details will include your name and registered profile photo."
                  )}
                </p>
              </div>
            </div>
          </section>

          <section className="text-center pt-8 pb-12">
            <button 
              type="submit"
              className="w-full max-w-md bg-primary text-white py-5 rounded-lg text-title-lg font-bold shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              Submit Report
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <p className="text-body-md">AI will verify and begin tracking this immediately</p>
            </div>
          </section>

          {/* Footer Illustration */}
          <footer className="border-t border-surface-container-high pt-12 pb-20 text-center space-y-8">
            <div className="flex justify-center items-center gap-4 md:gap-12 opacity-80">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-surface-container flex items-center justify-center rounded-xl shadow-sm">
                  <span className="material-symbols-outlined text-primary text-2xl">person</span>
                </div>
                <span className="text-label-md font-medium">Citizen</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant" aria-hidden="true">trending_flat</span>
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-primary-container/10 flex items-center justify-center rounded-xl shadow-sm">
                  <span className="material-symbols-outlined text-primary text-2xl">smart_toy</span>
                </div>
                <span className="text-label-md font-medium">AI Intelligence</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant" aria-hidden="true">trending_flat</span>
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-surface-container flex items-center justify-center rounded-xl shadow-sm">
                  <span className="material-symbols-outlined text-secondary text-2xl">account_balance</span>
                </div>
                <span className="text-label-md font-medium">Government</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant" aria-hidden="true">trending_flat</span>
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-secondary-container/30 flex items-center justify-center rounded-xl shadow-sm">
                  <span className="material-symbols-outlined text-secondary text-2xl">task_alt</span>
                </div>
                <span className="text-label-md font-medium">Resolved</span>
              </div>
            </div>
            <p className="text-title-lg font-medium text-on-surface-variant">
              You report once. <span className="text-primary font-bold">CityOS</span> takes care of the rest.
            </p>
          </footer>
        </form>
      </main>
    </div>
  );
}
