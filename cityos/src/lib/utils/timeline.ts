import type { ReportStatus } from "@/types";

export interface TimelineStep {
  title: string;
  time?: string;
  status: "completed" | "active" | "pending";
  icon: string;
}

export function getTimelineSteps(
  reportStatus: ReportStatus,
  createdAt: Date | string,
  updatedAt?: Date | string
): TimelineStep[] {
  const formatDate = (dStr: Date | string) => {
    const d = new Date(dStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${months[d.getMonth()]} ${d.getDate()}, ${hours}:${minutes}`;
  };

  const cDate = formatDate(createdAt);
  const uDate = updatedAt ? formatDate(updatedAt) : undefined;

  const steps: TimelineStep[] = [
    { title: "Report Submitted", time: cDate, status: "completed", icon: "check" },
    { title: "AI Verified", time: uDate || cDate, status: "pending", icon: "check" },
    { title: "Department Assigned", time: undefined, status: "pending", icon: "check" },
    { title: "Crew Dispatched", time: undefined, status: "pending", icon: "local_shipping" },
    { title: "Repair Work", time: undefined, status: "pending", icon: "engineering" },
    { title: "Evidence Uploaded", time: undefined, status: "pending", icon: "cloud_upload" },
    { title: "Community Verification", time: undefined, status: "pending", icon: "rate_review" },
    { title: "Resolved", time: undefined, status: "pending", icon: "task_alt" }
  ];

  // Helper function to mark steps as completed or active
  const setStatus = (idx: number, status: "completed" | "active" | "pending", time?: string) => {
    if (steps[idx]) {
      steps[idx].status = status;
      if (time) steps[idx].time = time;
    }
  };

  // State transitions mapping:
  if (reportStatus === "submitted") {
    setStatus(0, "completed");
    setStatus(1, "completed", uDate || cDate);
    setStatus(2, "active");
  } else if (reportStatus === "ai_processing") {
    setStatus(0, "completed");
    setStatus(1, "active");
  } else if ((reportStatus as string) === "predicted") {
    setStatus(0, "completed");
    setStatus(1, "completed", uDate || cDate);
  } else if (reportStatus === "ai_verified") {
    setStatus(0, "completed");
    setStatus(1, "completed", uDate || cDate);
    setStatus(2, "active");
  } else if (reportStatus === "assigned") {
    setStatus(0, "completed");
    setStatus(1, "completed", cDate);
    setStatus(2, "completed", uDate || cDate);
    setStatus(3, "active");
  } else if (reportStatus === "work_started") {
    setStatus(0, "completed");
    setStatus(1, "completed", cDate);
    setStatus(2, "completed", cDate);
    setStatus(3, "completed", uDate || cDate);
    setStatus(4, "active");
  } else if (reportStatus === "in_progress") {
    setStatus(0, "completed");
    setStatus(1, "completed", cDate);
    setStatus(2, "completed", cDate);
    setStatus(3, "completed", cDate);
    setStatus(4, "completed", uDate || cDate);
    setStatus(5, "active");
  } else if (reportStatus === "evidence_uploaded" || reportStatus === "ai_verifying_repair") {
    setStatus(0, "completed");
    setStatus(1, "completed", cDate);
    setStatus(2, "completed", cDate);
    setStatus(3, "completed", cDate);
    setStatus(4, "completed", cDate);
    setStatus(5, "completed", uDate || cDate);
    setStatus(6, "active");
  } else if (reportStatus === "citizen_verification_pending") {
    setStatus(0, "completed");
    setStatus(1, "completed", cDate);
    setStatus(2, "completed", cDate);
    setStatus(3, "completed", cDate);
    setStatus(4, "completed", cDate);
    setStatus(5, "completed", cDate);
    setStatus(6, "completed", uDate || cDate);
    setStatus(7, "active");
  } else if (reportStatus === "resolved" || reportStatus === "closed") {
    setStatus(0, "completed");
    setStatus(1, "completed", cDate);
    setStatus(2, "completed", cDate);
    setStatus(3, "completed", cDate);
    setStatus(4, "completed", cDate);
    setStatus(5, "completed", cDate);
    setStatus(6, "completed", cDate);
    setStatus(7, "completed", uDate || cDate);
  }

  return steps;
}
