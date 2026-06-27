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

  // Default steps structure
  const steps: TimelineStep[] = [
    { title: "Report Submitted", time: cDate, status: "pending", icon: "check" },
    { title: "AI Verified", time: undefined, status: "pending", icon: "check" },
    { title: "Department Assigned", time: undefined, status: "pending", icon: "check" },
    { title: "Work Started", time: undefined, status: "pending", icon: "engineering" },
    { title: "Resolved", time: undefined, status: "pending", icon: "task_alt" }
  ];

  switch (reportStatus) {
    case "submitted":
      steps[0]!.status = "active";
      break;

    case "ai_processing":
      steps[0]!.status = "completed";
      steps[1]!.status = "active";
      steps[1]!.title = "AI Verifying...";
      break;

    case "ai_verified":
      steps[0]!.status = "completed";
      steps[1]!.status = "completed";
      steps[1]!.time = uDate || cDate;
      steps[2]!.status = "active";
      break;

    case "assigned":
      steps[0]!.status = "completed";
      steps[1]!.status = "completed";
      steps[2]!.status = "completed";
      steps[2]!.time = uDate || cDate;
      steps[3]!.status = "active";
      break;

    case "in_progress":
    case "work_started":
    case "evidence_uploaded":
    case "ai_verifying_repair":
    case "citizen_verification_pending":
      steps[0]!.status = "completed";
      steps[1]!.status = "completed";
      steps[2]!.status = "completed";
      steps[3]!.status = "active";
      steps[3]!.time = uDate || cDate;
      break;

    case "resolved":
    case "closed":
      steps[0]!.status = "completed";
      steps[1]!.status = "completed";
      steps[2]!.status = "completed";
      steps[3]!.status = "completed";
      steps[4]!.status = "completed";
      steps[4]!.time = uDate || cDate;
      break;
  }

  return steps;
}
