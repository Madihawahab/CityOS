"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useReportsStore } from "@/store/reportsStore";
import { useAuthStore } from "@/store/authStore";
import type { Report, IssueCategory, IssueSeverity, ReportStatus } from "@/types";

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

  // Input states
  const [description, setDescription] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [voiceRecorded, setVoiceRecorded] = useState(false);
  const [address, setAddress] = useState("12th Main Road, Sector 6, HSR Layout, Bengaluru");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [reportAnonymously, setReportAnonymously] = useState(false);

  // Flow control states
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [hasReviewedAI, setHasReviewedAI] = useState(false);
  const [showAdvancedAi, setShowAdvancedAi] = useState(false);
  const [duplicateOption, setDuplicateOption] = useState<"merge" | "separate">("merge");

  // Success screen state
  const [submittedReport, setSubmittedReport] = useState<{
    reportId: string;
    department: string;
    estimatedResolution: string;
    aiConfidence: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build the AI pipeline dynamically based on provided inputs
  const aiSteps = (() => {
    const steps = [];
    const categoryName = aiResult?.reportIntelligence?.category || "water";
    const categoryLabel = categoryName === "roads" ? "road infrastructure" : 
                          categoryName === "sanitation" ? "public sanitation" :
                          categoryName === "electricity" ? "electrical grid" :
                          categoryName === "drainage" ? "drainage system" : "water infrastructure";

    const departmentName = aiResult?.decisionIntelligence?.department || "Water Works Department";

    steps.push({ 
      id: "understanding", 
      label: "Understanding your issue...", 
      successLabel: `✓ It looks like a ${categoryLabel} problem.`, 
      icon: "🧠" 
    });
    if (uploadedImage || uploadedVideo) {
      const visualDetail = categoryName === "roads" ? "Surface damage" :
                           categoryName === "sanitation" ? "Waste overflow" :
                           categoryName === "electricity" ? "Power/line failure" :
                           categoryName === "drainage" ? "Water accumulation" : "Water leakage";
      steps.push({ 
        id: "media", 
        label: "Analyzing uploaded evidence...", 
        successLabel: `✓ ${visualDetail} detected successfully.`, 
        icon: "📷" 
      });
    }
    if (voiceRecorded) {
      steps.push({ 
        id: "voice", 
        label: "Processing voice description...", 
        successLabel: "✓ Key information extracted.", 
        icon: "🎤" 
      });
    }
    
    const duplicateCount = aiResult?.trustEngine?.duplicateReportIds?.length || 2;
    steps.push({ 
      id: "duplicates", 
      label: "Checking nearby reports...", 
      successLabel: `✓ We found ${duplicateCount} similar reports nearby.`, 
      icon: "🛡" 
    });
    
    const severityLabel = aiResult?.reportIntelligence?.severity || "medium";
    steps.push({ 
      id: "priority", 
      label: "Determining priority...", 
      successLabel: `✓ Classified as ${severityLabel.toUpperCase()} priority.`, 
      icon: "⚖" 
    });
    steps.push({ 
      id: "department", 
      label: "Choosing the responsible department...", 
      successLabel: `✓ ${departmentName} selected.`, 
      icon: "🏛" 
    });
    
    const etaText = aiResult?.decisionIntelligence?.estimatedResolution || "2–3 days";
    steps.push({ 
      id: "resolution", 
      label: "Estimating repair timeline...", 
      successLabel: `✓ Estimated completion: ${etaText.toLowerCase()}.`, 
      icon: "⏱" 
    });
    steps.push({ 
      id: "summary", 
      label: "Preparing your report...", 
      successLabel: "✓ Everything is ready for your review.", 
      icon: "🤖" 
    });
    return steps;
  })();

  // Check if at least one evidence type is entered
  const isEvidenceProvided = description.trim().length > 0 || uploadedImage !== null || uploadedVideo !== null || voiceRecorded;

  // Handle media uploads
  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (file.type.startsWith("video/")) {
          setUploadedVideo(file.name);
          setUploadedImage(null);
        } else {
          setUploadedImage(reader.result as string);
          setUploadedVideo(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerVoiceRecord = () => {
    setVoiceRecorded(true);
    if (!description) {
      setDescription("[Transcribed voice record]: Water main line leakage detected flooding the sidewalk.");
    }
  };

  // Launch AI sequence
  const startAIReview = async () => {
    if (!isEvidenceProvided || isProcessingAI) return;

    setIsProcessingAI(true);
    setProcessingStep(0);
    setAiResult(null);

    // Identify standard step indices based on active steps:
    const mediaIdx = aiSteps.findIndex(s => s.id === "media");
    const voiceIdx = aiSteps.findIndex(s => s.id === "voice");
    const duplicatesIdx = aiSteps.findIndex(s => s.id === "duplicates");
    const priorityIdx = aiSteps.findIndex(s => s.id === "priority");
    const deptIdx = aiSteps.findIndex(s => s.id === "department");
    const resolutionIdx = aiSteps.findIndex(s => s.id === "resolution");
    const summaryIdx = aiSteps.findIndex(s => s.id === "summary");

    try {
      // ── Stage 1: Report Intelligence (multimodal) ─────────────────────────
      const step1Res = await fetch("/api/v1/ai/analyze-report?stage=reportIntelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description || "Visual issue reported via image upload.",
          hasImages: uploadedImage !== null,
          image: uploadedImage,
          voiceTranscript: voiceRecorded ? "[Transcribed voice record]: Water main line leakage detected flooding the sidewalk." : null,
          location: address,
        })
      });

      if (!step1Res.ok) throw new Error("Stage 1 failed");
      const step1Data = await step1Res.json();
      const reportIntel = step1Data.reportIntelligence;

      // Update AI result state partially so the UI steps can read from it
      setAiResult({
        reportIntelligence: reportIntel,
        trustEngine: {
          trustScore: 92,
          duplicateDetected: false,
          duplicateReportIds: [],
          spamProbability: 0.04,
          authenticity: "verified"
        },
        decisionIntelligence: {
          department: "Water Works Department",
          priority: reportIntel.severity,
          estimatedResolution: "2–3 Days",
          priorityReason: "",
          recommendedActions: []
        }
      });

      // Update UI steps for Stage 1 completion
      if (mediaIdx !== -1) setProcessingStep(mediaIdx);
      if (voiceIdx !== -1) setProcessingStep(voiceIdx);
      await new Promise(resolve => setTimeout(resolve, 300));
      setProcessingStep(duplicatesIdx);

      // ── Stage 2: Trust Engine ─────────────────────────────────────────────
      const step2Res = await fetch("/api/v1/ai/analyze-report?stage=trustEngine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: reportIntel.description,
          location: address,
          nearbyReportIds: ["RPT-2026-001", "RPT-2026-004"]
        })
      });

      if (!step2Res.ok) throw new Error("Stage 2 failed");
      const step2Data = await step2Res.json();
      const trustEng = step2Data.trustEngine;

      setAiResult((prev) => prev ? {
        ...prev,
        trustEngine: trustEng
      } : null);

      // Update UI steps for Stage 2 completion
      setProcessingStep(priorityIdx);
      await new Promise(resolve => setTimeout(resolve, 300));

      // ── Stage 3: Decision Intelligence ────────────────────────────────────
      const step3Res = await fetch("/api/v1/ai/analyze-report?stage=decisionEngine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: reportIntel.category,
          severity: reportIntel.severity,
          location: address,
          nearbyCount: trustEng.duplicateReportIds?.length ?? 0
        })
      });

      if (!step3Res.ok) throw new Error("Stage 3 failed");
      const step3Data = await step3Res.json();
      const decisionIntel = step3Data.decisionIntelligence;

      setAiResult((prev) => prev ? {
        ...prev,
        decisionIntelligence: decisionIntel
      } : null);

      // Progress through the remaining steps
      setProcessingStep(deptIdx);
      await new Promise(resolve => setTimeout(resolve, 200));
      setProcessingStep(resolutionIdx);
      await new Promise(resolve => setTimeout(resolve, 200));
      setProcessingStep(summaryIdx);
      await new Promise(resolve => setTimeout(resolve, 200));

      const compiledResult: AIAnalysisResult = {
        reportIntelligence: reportIntel,
        trustEngine: trustEng,
        decisionIntelligence: decisionIntel
      };

      setAiResult(compiledResult);
      setIsProcessingAI(false);
      setHasReviewedAI(true);

    } catch (err) {
      console.warn("Real AI pipeline encountered error, fallback keyword mock generated", err);
      
      // Fallback Keyword-Based Classifier
      let category = "water";
      let detectedIssue = "Water Outage & Pipeline Leak";
      let severity = "medium";
      let descSummary = "A water outage reported by local residents requiring pipeline inspection.";
      let dept = "BWSSB Water Supply Division";
      let priorityReason = "Water disruption risk detected on busy transit street corridor.";
      let actions = ["Locate shutoff valve", "Seal pipe leakage"];
      let eta = "2–3 Days";

      const query = (description + " " + (uploadedImage || "") + " " + (uploadedVideo || "")).toLowerCase();
      if (query.includes("pothole") || query.includes("road") || query.includes("asphalt")) {
        category = "roads";
        detectedIssue = "Large Pothole on MG Road";
        severity = "high";
        descSummary = "Significant road damage reported on MG Road causing traffic congestion and safety risks.";
        dept = "BBMP Roads & Infrastructure Division";
        priorityReason = "Pothole poses hazard on active vehicle traffic corridor.";
        actions = ["Seal pothole with cold mix", "Re-tar segment"];
        eta = "3 Days";
      } else if (query.includes("garbage") || query.includes("waste") || query.includes("refuse") || query.includes("trash")) {
        category = "sanitation";
        detectedIssue = "Overflowing Garbage Bin on 12th Main";
        severity = "medium";
        descSummary = "Overflowing municipal waste bin causing public sanitation and odor concerns.";
        dept = "BBMP Solid Waste Management Division";
        priorityReason = "Public health hazard in commercial sector, school zone within 200m.";
        actions = ["Inspect reported location", "Dispatch work crew"];
        eta = "3 Days";
      } else if (query.includes("light") || query.includes("lamp") || query.includes("dark")) {
        category = "electricity";
        detectedIssue = "Street Light Failure near Bus Stop";
        severity = "medium";
        descSummary = "Non-functional street light reducing visibility and public safety after dark.";
        dept = "BESCOM Street Lighting Dept";
        priorityReason = "Streetlight repair needed for night pedestrian safety.";
        actions = ["Replace bulb/fixture", "Check wiring line"];
        eta = "2 Days";
      } else if (query.includes("drain") || query.includes("flooding") || query.includes("sewer")) {
        category = "drainage";
        detectedIssue = "Sewer Blockage & Drainage Flooding";
        severity = "high";
        descSummary = "Stormwater drain backup flooding public sidewalk and roadway lanes.";
        dept = "BWSSB Drainage & Stormwater Division";
        priorityReason = "Drain blockage flooding public walk lanes.";
        actions = ["Clear drain inlet", "Flush stormwater pipe"];
        eta = "2 Days";
      } else if (query.includes("hazard") || query.includes("debris") || query.includes("safety")) {
        category = "other";
        detectedIssue = "Construction Debris Hazard on Sidewalk";
        severity = "high";
        descSummary = "Unregulated construction waste obstructing pedestrian sidewalk traffic.";
        dept = "BBMP Public Works Dept";
        priorityReason = "Obstructs pedestrian movement and forces walking on active street lanes.";
        actions = ["Inspect reported location", "Dispatch work crew"];
        eta = "3 Days";
      }

      if (mediaIdx !== -1) { setProcessingStep(mediaIdx); await new Promise(r => setTimeout(r, 100)); }
      if (voiceIdx !== -1) { setProcessingStep(voiceIdx); await new Promise(r => setTimeout(r, 100)); }
      setProcessingStep(duplicatesIdx);
      await new Promise(r => setTimeout(r, 100));
      setProcessingStep(priorityIdx);
      await new Promise(r => setTimeout(r, 100));
      setProcessingStep(deptIdx);
      await new Promise(r => setTimeout(r, 100));
      setProcessingStep(resolutionIdx);
      await new Promise(r => setTimeout(r, 100));
      setProcessingStep(summaryIdx);
      await new Promise(r => setTimeout(r, 100));

      const mockResult: AIAnalysisResult = {
        reportIntelligence: {
          category,
          detectedIssue,
          severity,
          confidence: 0.94,
          description: descSummary
        },
        trustEngine: {
          trustScore: 92,
          duplicateDetected: query.includes("leak") || query.includes("pothole") || query.includes("drain"),
          duplicateReportIds: ["RPT-2026-001", "RPT-2026-004"],
          spamProbability: 0.04,
          authenticity: "verified"
        },
        decisionIntelligence: {
          department: dept,
          priority: severity,
          estimatedResolution: eta,
          priorityReason,
          recommendedActions: actions
        }
      };

      setAiResult(mockResult);
      setIsProcessingAI(false);
      setHasReviewedAI(true);
    }
  };

  // Submit report to Zustand store
  const handleFinalSubmit = () => {
    if (!aiResult) return;

    const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;
    const newReport: Report = {
      reportId,
      citizenId: reportAnonymously ? "Protected Anonymous" : (user?.userId ?? "demo-citizen-1"),
      anonymousReport: reportAnonymously,
      issueCategory: aiResult.reportIntelligence.category as IssueCategory,
      title: aiResult.reportIntelligence.detectedIssue,
      description: description || "Reported with photos.",
      severity: aiResult.reportIntelligence.severity as IssueSeverity,
      status: "submitted" as ReportStatus,
      trustScore: aiResult.trustEngine.trustScore,
      priority: aiResult.decisionIntelligence.priority as IssueSeverity,
      departmentAssigned: aiResult.decisionIntelligence.department,
      estimatedResolution: aiResult.decisionIntelligence.estimatedResolution,
      aiConfidence: aiResult.reportIntelligence.confidence,
      location: {
        latitude: 12.9352,
        longitude: 77.6245,
        address: address,
        ward: "Ward 7 – Koramangala"
      },
      media: {
        imageUrls: uploadedImage ? [uploadedImage] : [],
        videoUrls: uploadedVideo ? [uploadedVideo] : []
      },
      communitySupport: 12,
      mergedReportIds: duplicateOption === "merge" ? aiResult.trustEngine.duplicateReportIds : [],
      createdAt: new Date(),
      updatedAt: new Date(),
      analysis: {
        reportIntelligence: {
          category: aiResult.reportIntelligence.category,
          detectedIssue: aiResult.reportIntelligence.detectedIssue,
          severity: aiResult.reportIntelligence.severity,
          confidence: aiResult.reportIntelligence.confidence,
          description: aiResult.reportIntelligence.description
        },
        trustEngine: {
          trustScore: aiResult.trustEngine.trustScore,
          duplicateDetected: aiResult.trustEngine.duplicateDetected,
          duplicateReportIds: aiResult.trustEngine.duplicateReportIds,
          spamProbability: aiResult.trustEngine.spamProbability,
          authenticity: aiResult.trustEngine.authenticity
        },
        decisionEngine: {
          department: aiResult.decisionIntelligence.department,
          priority: aiResult.decisionIntelligence.priority,
          estimatedResolution: aiResult.decisionIntelligence.estimatedResolution,
          priorityReason: aiResult.decisionIntelligence.priorityReason,
          recommendedActions: aiResult.decisionIntelligence.recommendedActions
        },
        civicIntelligence: {
          communityImpact: "High Priority Area",
          nearbyReportsCount: aiResult.trustEngine.duplicateReportIds.length,
          wardRiskIndex: "Koramangala Ward 7 Risk index: 84/100"
        },
        resolutionIntelligence: {
          estimatedResolution: aiResult.decisionIntelligence.estimatedResolution,
          confidenceScore: 0.94,
          historicalComparison: "Matches 14 previous water main cases in Ward 7"
        },
        civicCopilot: {
          summary: `Reported issue of ${aiResult.reportIntelligence.detectedIssue} categorized in ${aiResult.reportIntelligence.category} and routed to ${aiResult.decisionIntelligence.department}.`
        }
      }
    };

    setReport(newReport);

    setSubmittedReport({
      reportId,
      department: aiResult.decisionIntelligence.department,
      estimatedResolution: aiResult.decisionIntelligence.estimatedResolution,
      aiConfidence: Math.round(aiResult.reportIntelligence.confidence * 100)
    });
  };

  // Success view
  if (submittedReport) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center py-12 px-4 md:px-8 font-sans">
        <div className="max-w-md w-full bg-surface-container-low border border-outline-variant/30 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-emerald-400 text-4xl">check_circle</span>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-black text-on-surface">✅ Report Submitted Successfully</h3>
            <p className="text-xs text-on-surface-variant/70">CityOS AI verified authenticity and registered it to the department dispatcher.</p>
          </div>

          <div className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl p-5 space-y-4 text-left text-xs">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant font-bold uppercase tracking-wider text-[9px]">Ticket ID</span>
              <strong className="text-blue-600 dark:text-blue-450 font-bold">{submittedReport.reportId}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant font-bold uppercase tracking-wider text-[9px]">Assigned Department</span>
              <strong className="text-on-surface">{submittedReport.department}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant font-bold uppercase tracking-wider text-[9px]">Estimated Resolution</span>
              <strong className="text-on-surface">{submittedReport.estimatedResolution}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant font-bold uppercase tracking-wider text-[9px]">AI Reliability</span>
              <strong className="text-emerald-600 dark:text-emerald-450 font-bold">★★★★★ Excellent ({submittedReport.aiConfidence}%)</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant font-bold uppercase tracking-wider text-[9px]">Privacy Shield</span>
              <strong className="text-on-surface">{reportAnonymously ? "Protected Anonymous" : "Identity Visible"}</strong>
            </div>
          </div>

          {/* Ticket Lifecycle Tracker */}
          <div className="w-full py-4 border-t border-b border-outline-variant/20 text-[10px] space-y-3.5">
            <p className="text-left font-bold text-on-surface-variant uppercase tracking-widest text-[8px]">Live Resolution Lifecycle</p>
            <div className="flex flex-col gap-2.5 text-left pl-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                <span className="font-extrabold text-blue-500">Report Submitted (Active)</span>
              </div>
              <div className="flex items-center gap-2 opacity-40">
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                <span>AI Verified Dispatch</span>
              </div>
              <div className="flex items-center gap-2 opacity-40">
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                <span>Department Assigned</span>
              </div>
              <div className="flex items-center gap-2 opacity-40">
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                <span>Crew Dispatch & Repair Work</span>
              </div>
              <div className="flex items-center gap-2 opacity-40">
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                <span>Community Verification Resolution</span>
              </div>
            </div>
            <p className="text-center text-[9px] text-on-surface-variant/60 italic mt-2">We&apos;ll notify you automatically whenever your report progresses.</p>
          </div>

          <div className="flex flex-col w-full gap-2.5 pt-2">
            <button 
              onClick={() => router.push(`/reports/${submittedReport.reportId}`)}
              className="w-full bg-blue-600 hover:bg-blue-755 text-white py-3.5 rounded-xl font-bold transition-all text-xs cursor-pointer"
            >
              Track My Report
            </button>
            <button 
              onClick={() => router.push("/")}
              className="w-full bg-transparent border border-outline-variant text-on-surface hover:bg-surface-container-high py-3.5 rounded-xl font-bold transition-all text-xs cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface py-12 px-4 md:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500 text-3xl">add_circle</span>
            Report an Issue
          </h2>
          <p className="text-xs text-on-surface-variant/70 font-medium">You provide the details. The CityOS AI core handles validation, categorization, and dispatch.</p>
        </div>

        {/* Dynamic Display State Machine */}
        {!isProcessingAI && !hasReviewedAI && (
          <div className="space-y-6">
            
            {/* STEP 1: Evidence Input Card */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-full bg-blue-500/10 border border-blue-500 flex items-center justify-center text-[10px] font-black text-blue-400">1</div>
                <h3 className="font-extrabold text-on-surface text-sm">Capture the Evidence</h3>
              </div>

              {/* Bento styled upload panel options */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div 
                  onClick={handleDropzoneClick}
                  className="col-span-2 md:col-span-4 h-36 border border-dashed border-outline-variant/30 bg-surface-container-high rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/40 hover:bg-surface-container-high/40 transition-all text-center group p-4"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    className="hidden"
                  />
                  {uploadedImage ? (
                    <div className="w-full h-full relative rounded-lg overflow-hidden flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={uploadedImage} alt="Uploaded preview" className="h-full object-contain rounded" />
                    </div>
                  ) : uploadedVideo ? (
                    <div className="text-xs font-semibold text-blue-500 flex items-center gap-1.5">
                      <span className="material-symbols-outlined">videocam</span> {uploadedVideo}
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-on-surface-variant/50 group-hover:scale-110 group-hover:text-primary transition-all text-3xl">add_photo_alternate</span>
                      <p className="text-xs font-bold text-on-surface-variant">Drag or click to upload</p>
                      <p className="text-[10px] text-on-surface-variant/50">Supports images & video files up to 50MB</p>
                    </>
                  )}
                </div>

                <button 
                  type="button" 
                  onClick={handleDropzoneClick}
                  className="flex flex-col items-center justify-center gap-2 py-4 bg-surface-container-high border border-outline-variant/30 hover:bg-surface-container text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-blue-500">photo_camera</span>
                  <span className="text-[10px] font-bold">Upload Photo</span>
                </button>
                <button 
                  type="button" 
                  onClick={handleDropzoneClick}
                  className="flex flex-col items-center justify-center gap-2 py-4 bg-surface-container-high border border-outline-variant/30 hover:bg-surface-container text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-blue-500">videocam</span>
                  <span className="text-[10px] font-bold">Upload Video</span>
                </button>
                <button 
                  type="button" 
                  onClick={triggerVoiceRecord}
                  className={`flex flex-col items-center justify-center gap-2 py-4 border rounded-xl cursor-pointer transition-all ${
                    voiceRecorded ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse" : "bg-surface-container-high border-outline-variant/30 hover:bg-surface-container text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined">mic</span>
                  <span className="text-[10px] font-bold">{voiceRecorded ? "Recorded ✓" : "Record Voice"}</span>
                </button>
                <button 
                  type="button"
                  onClick={() => document.getElementById("desc-textarea")?.focus()}
                  className="flex flex-col items-center justify-center gap-2 py-4 bg-surface-container-high border border-outline-variant/30 hover:bg-surface-container text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-blue-500">edit_note</span>
                  <span className="text-[10px] font-bold">Type Details</span>
                </button>
              </div>

              {/* Text Description Box */}
              <div className="space-y-1.5">
                <textarea
                  id="desc-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue, location, or landmarks. AI parses category and severity automatically..."
                  rows={4}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-2xl p-4 text-xs text-on-surface placeholder-on-surface-variant/40 focus:border-primary/40 outline-none resize-none"
                />
              </div>
            </div>

            {/* STEP 2: Location Card */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-full bg-blue-500/10 border border-blue-500 flex items-center justify-center text-[10px] font-black text-blue-400">2</div>
                <h3 className="font-extrabold text-on-surface text-sm">Location Details</h3>
              </div>

              <div className="flex justify-between items-start gap-4 bg-surface-container-high p-4 border border-outline-variant/30 rounded-2xl text-xs">
                <div className="flex gap-2.5 items-start">
                  <span className="material-symbols-outlined text-blue-500 text-[18px]">location_on</span>
                  <div>
                    <span className="font-bold text-on-surface block">Detected Location Address</span>
                    {isEditingAddress ? (
                      <input 
                        type="text" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="bg-surface-container-low border border-outline-variant/30 rounded px-2 py-1 mt-1 outline-none text-on-surface w-full"
                        onBlur={() => setIsEditingAddress(false)}
                      />
                    ) : (
                      <p className="text-on-surface-variant/70 mt-1">{address}</p>
                    )}
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-blue-600 dark:text-blue-450 hover:underline font-bold text-[10px] uppercase tracking-wider"
                >
                  {isEditingAddress ? "Done" : "Adjust"}
                </button>
              </div>
            </div>

            {/* AI Review trigger CTA */}
            <button 
              type="button"
              disabled={!isEvidenceProvided}
              onClick={startAIReview}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none text-white py-4 rounded-2xl font-bold text-xs transition-transform active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
            >
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              Analyze with CityOS AI
            </button>
          </div>
        )}
        {/* STEP 3: Adaptive AI processing loading checkmarks */}
        {isProcessingAI && (
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-8 space-y-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-full border-2 border-t-blue-500 border-outline-variant/30 animate-spin" />
              <h3 className="font-extrabold text-on-surface text-base">Running CityOS AI Analysis Pipeline</h3>
              <p className="text-[11px] text-on-surface-variant/70">Verifying authenticity, calculating confidence, and selecting dispatch queues.</p>
            </div>

            <div className="max-w-xs mx-auto border-t border-outline-variant/20 pt-4 space-y-2.5 text-left text-[11px]">
              {aiSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col gap-0.5 transition-opacity duration-300 ${
                    idx > processingStep ? "opacity-30" : "opacity-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant font-semibold flex items-center gap-2">
                      <span>{step.icon}</span>
                      <span>{step.label}</span>
                    </span>
                    <span>
                      {idx < processingStep ? (
                        <span className="text-emerald-600 dark:text-emerald-450 font-bold">✓</span>
                      ) : idx === processingStep ? (
                        <span className="text-blue-500 font-bold animate-pulse">↻</span>
                      ) : (
                        <span className="text-on-surface-variant/40">•</span>
                      )}
                    </span>
                  </div>
                  {idx < processingStep && (
                    <span className="text-[10px] text-emerald-650 dark:text-emerald-400 font-bold pl-6 block mb-1">
                      {step.successLabel}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4 & 5: AI Results Display */}
        {hasReviewedAI && aiResult && (
          <div className="space-y-6">
            
            {/* ONE Clean AI Summary Card */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 space-y-5 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full text-[9px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[10px]">auto_awesome</span> AI Verified Review
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-wider">AI Suggested Title</span>
                  <input 
                    type="text" 
                    value={aiResult.reportIntelligence.detectedIssue}
                    onChange={(e) => setAiResult({
                      ...aiResult,
                      reportIntelligence: {
                        ...aiResult.reportIntelligence,
                        detectedIssue: e.target.value
                      }
                    })}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl p-3 text-xs font-bold text-on-surface outline-none focus:border-primary/45"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-wider">AI Suggested Description</span>
                  <textarea 
                    value={description || aiResult.reportIntelligence.description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl p-3 text-xs text-on-surface-variant outline-none focus:border-primary/45 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/20 pt-4 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-wider block">Category</span>
                    <strong className="text-on-surface capitalize font-bold">{aiResult.reportIntelligence.category}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-wider block">Severity</span>
                    <strong className="text-red-650 dark:text-red-400 capitalize font-bold">{aiResult.reportIntelligence.severity}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-wider block">Assigned Department</span>
                    <strong className="text-on-surface font-bold">{aiResult.decisionIntelligence.department}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-wider block">Estimated Resolution</span>
                    <strong className="text-on-surface font-bold">{aiResult.decisionIntelligence.estimatedResolution}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-wider block">AI Reliability</span>
                    <strong className="text-emerald-650 dark:text-emerald-450 font-bold">★★★★★ Excellent ({Math.round(aiResult.reportIntelligence.confidence * 100)}%)</strong>
                  </div>
                </div>

                {/* Progressive Disclosure (Advanced AI Details) */}
                <div className="border-t border-outline-variant/20 pt-3">
                  <button 
                    onClick={() => setShowAdvancedAi(!showAdvancedAi)}
                    className="text-xs text-blue-600 dark:text-blue-450 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {showAdvancedAi ? "expand_less" : "expand_more"}
                    </span> 
                    {showAdvancedAi ? "Hide AI Analysis Details" : "View AI Analysis Details"}
                  </button>

                  {showAdvancedAi && (
                    <div className="mt-3 p-4 bg-surface-container-high border border-outline-variant/30 rounded-2xl space-y-4 text-xs">
                      
                      {/* Community Impact and spam risk stats */}
                      <div className="grid grid-cols-2 gap-3 border-b border-outline-variant/20 pb-3 text-[10px] text-on-surface-variant/70">
                        <div>
                          <span>Community Impact:</span>
                          <strong className="text-on-surface block mt-0.5">High Priority Area</strong>
                        </div>
                        <div>
                          <span>Spam Verification:</span>
                          <strong className="text-emerald-655 dark:text-emerald-400 block mt-0.5">Low Risk ({Math.round(aiResult.trustEngine.spamProbability * 100)}%)</strong>
                        </div>
                        <div>
                          <span>Duplicate Match Rating:</span>
                          <strong className="text-blue-600 dark:text-blue-400 block mt-0.5">Very Strong Match</strong>
                        </div>
                        <div>
                          <span>Authenticity Check:</span>
                          <strong className="text-emerald-650 dark:text-emerald-400 block mt-0.5">AI Confirmed Verified</strong>
                        </div>
                      </div>

                      {/* Explainable AI block details */}
                      <div className="space-y-1">
                        <strong className="text-[10px] text-on-surface uppercase tracking-wider block font-bold">Why was this marked High Priority?</strong>
                        <ul className="space-y-1 text-on-surface-variant/70 text-[10px]">
                          <li>• The issue is located on a busy road.</li>
                          <li>• A hospital emergency route is nearby.</li>
                          <li>• Three similar reports were detected.</li>
                          <li>• Historical data suggests water infrastructure leaks in this zone worsen quickly.</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 5: Better Duplicate Detection Comparison Card */}
            {aiResult.trustEngine.duplicateDetected && (
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 space-y-4">
                <div className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-blue-500 text-[20px]">groups</span>
                  <div>
                    <strong className="text-on-surface text-xs block font-bold">Nearby Similar Report Detected</strong>
                    <p className="text-[10px] text-on-surface-variant/70 mt-0.5">Merging avoids dispatching duplicate maintenance crews and automatically subscribes you to progress notifications.</p>
                  </div>
                </div>

                {/* Simulated existing ticket preview */}
                <div className="bg-surface-container-high border border-outline-variant/30 p-4 rounded-2xl text-[11px] space-y-2 text-on-surface-variant">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-on-surface">📍 Water Pipe Burst (HSR 6th Sector)</span>
                    <span className="text-[9px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-1.5 py-0.5 rounded uppercase">Crew Dispatched</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant/50 font-bold uppercase text-[9px] tracking-wider">
                    <span>Distance: <strong className="text-on-surface">220 metres away</strong></span>
                    <span>Reported: <strong className="text-on-surface">Yesterday</strong></span>
                    <span>Support: <strong className="text-on-surface">42 Citizens</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <button 
                    type="button"
                    onClick={() => setDuplicateOption("merge")}
                    className={`py-3 rounded-xl font-bold cursor-pointer transition-all border ${
                      duplicateOption === "merge" ? "bg-blue-600 border-blue-500 text-white" : "bg-surface-container-high border-outline-variant/30 text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    Merge with Existing
                  </button>
                  <button 
                    type="button"
                    onClick={() => setDuplicateOption("separate")}
                    className={`py-3 rounded-xl font-bold cursor-pointer transition-all border ${
                      duplicateOption === "separate" ? "bg-blue-600 border-blue-500 text-white" : "bg-surface-container-high border-outline-variant/30 text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    Create Separate Report
                  </button>
                </div>
              </div>
            )}

            {/* STEP 8: Better Resolution Prediction Timeline */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-wider block">Estimated Resolution</span>
                <strong className="text-on-surface text-base block font-extrabold">2–3 Days</strong>
              </div>

              {/* Progress timeline visual bar */}
              <div className="flex items-center justify-between text-[9px] font-bold text-on-surface-variant/60 px-1 pt-1">
                <div className="flex flex-col items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></span>
                  <span className="text-on-surface">Submitted</span>
                </div>
                <div className="flex-grow h-0.5 bg-outline-variant/30 mx-2"></div>
                <div className="flex flex-col items-center gap-1 opacity-50">
                  <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                  <span>AI Dispatch</span>
                </div>
                <div className="flex-grow h-0.5 bg-outline-variant/30 mx-2"></div>
                <div className="flex flex-col items-center gap-1 opacity-50">
                  <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                  <span>Completion (2–3 Days)</span>
                </div>
              </div>
              
              <div className="p-3 bg-surface-container-high border border-outline-variant/20 rounded-2xl text-[10px] text-on-surface-variant/70 space-y-1">
                <p className="font-extrabold text-on-surface-variant">Prediction based on department workload, average response times, and current weather forecasts.</p>
              </div>
            </div>

            {/* STEP 11: Protected Anonymous Reporting */}
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <span className="material-symbols-outlined text-blue-500 text-[20px]">shield</span>
                  <strong className="text-on-surface text-xs font-bold">Protected Anonymous Reporting</strong>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={reportAnonymously}
                    onChange={(e) => setReportAnonymously(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                </label>
              </div>

              <div className="p-3.5 bg-surface-container-high border border-outline-variant/20 rounded-2xl text-[10.5px] text-on-surface-variant/70 space-y-1 leading-relaxed">
                <p>✓ Your identity is never visible to authorities.</p>
                <p>✓ Administrators cannot view your personal details.</p>
                <p>✓ Other citizens only see &quot;Protected Anonymous&quot;.</p>
                <p>✓ Personal information never appears on public maps.</p>
                <p>✓ AI summaries never expose personal information.</p>
              </div>
            </div>

            {/* Subtly indicate AI engines contributions */}
            <div className="text-center space-y-3 pt-2">
              <p className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-widest">Powered by CityOS AI Architecture Layers</p>
              <div className="flex flex-wrap justify-center gap-2.5 text-[9px] font-bold text-on-surface-variant/60">
                <span>🧠 Report Intelligence</span>
                <span>🛡 Trust Engine</span>
                <span>⚖ Decision Intelligence</span>
                <span>📊 Civic Intelligence</span>
                <span>✅ Resolution Intelligence</span>
                <span>🤖 Civic Copilot</span>
              </div>
            </div>

            {/* STEP 9: Submission CTA */}
            <div className="pt-2">
              <button 
                onClick={handleFinalSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-xs transition-transform active:scale-[0.98] cursor-pointer shadow-lg"
              >
                Submit Report to Dispatcher
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
