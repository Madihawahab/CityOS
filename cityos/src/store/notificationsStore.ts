import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Notification, AIEngineId, NotificationType } from "@/types";
import { useReportsStore } from "./reportsStore";

interface NotificationsState {
  notifications: Record<string, Notification & {
    readAt?: Date;
    aiEngine?: AIEngineId;
    whyExplanation?: string;
    needsAction?: boolean;
    actionType?: string;
    category?: string;
    department?: string;
    ward?: string;
  }>;
  initialized: boolean;
  markRead: (notificationId: string) => void;
  markAllRead: (userId: string) => void;
  syncNotifications: (userId: string) => void;
}

interface StageData {
  id: string;
  title: string;
  message: string;
  time: Date;
  type: NotificationType;
  aiEngine?: AIEngineId;
  whyExplanation?: string;
  needsAction: boolean;
  actionType?: string;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: {},
      initialized: false,

      markRead: (id) =>
        set((state) => {
          const current = state.notifications[id];
          if (!current) return {};
          return {
            notifications: {
              ...state.notifications,
              [id]: {
                ...current,
                isRead: true,
                readAt: new Date()
              }
            }
          };
        }),

      markAllRead: (userId) =>
        set((state) => {
          const updated = { ...state.notifications };
          Object.keys(updated).forEach((id) => {
            if (updated[id]!.userId === userId && !updated[id]!.isRead) {
              updated[id] = {
                ...updated[id]!,
                isRead: true,
                readAt: new Date()
              };
            }
          });
          return { notifications: updated };
        }),

      syncNotifications: (userId) => {
        const reports = Object.values(useReportsStore.getState().reports);
        const currentNotifications = { ...get().notifications };
        let updated = false;

        // 1. Generate dynamic notifications for each citizen report
        reports.forEach((report) => {
          if (report.citizenId !== userId) return;

          const baseTime = new Date(report.createdAt).getTime();
          const updateTime = new Date(report.updatedAt).getTime();

          const stages: StageData[] = [
            {
              id: "submitted",
              title: "📝 Report Submitted",
              message: report.anonymousReport
                ? "Your civic report has been securely submitted. Citizen identity is fully shielded by the CityOS Cryptographic Privacy Shield."
                : `Your civic report "${report.title}" has been successfully logged.`,
              time: new Date(baseTime),
              type: "submitted",
              needsAction: false,
              actionType: "view_report"
            },
            {
              id: "ai_verified",
              title: "🧠 AI Analysis Completed",
              message: report.analysis?.reportIntelligence
                ? `🧠 Report Intelligence classified this issue under "${report.analysis.reportIntelligence.category}" with ${Math.round((report.analysis.reportIntelligence.confidence || 0.9) * 100)}% confidence.`
                : "🧠 Report Intelligence verified the report parameters and checked for duplicate submissions.",
              time: new Date(baseTime + 5 * 60000),
              type: "ai_suggestion",
              aiEngine: "report_intelligence" as AIEngineId,
              whyExplanation: "AI vision scanned your uploaded photo and verified visual features of the issue, matching it with the category database.",
              needsAction: false,
              actionType: "view_report"
            }
          ];

          // Duplicates Merged Event
          if (report.mergedReportIds && report.mergedReportIds.length > 0) {
            stages.push({
              id: "duplicates_merged",
              title: "🛡️ Duplicate Reports Merged",
              message: `🛡️ Trust Engine merged your report with ${report.mergedReportIds.length} nearby duplicates, accelerating dispatch priority.`,
              time: new Date(baseTime + 12 * 60000),
              type: "ai_suggestion",
              aiEngine: "trust_engine" as AIEngineId,
              whyExplanation: "Multiple reports detected within 50 meters sharing identical descriptors and timestamps. Merging consolidates resources and escalates urgency.",
              needsAction: false,
              actionType: "track_progress"
            });
            stages.push({
              id: "community_priority",
              title: "👥 Community Priority Escalation",
              message: "👥 Your report has been upgraded to a community priority due to active area impact.",
              time: new Date(baseTime + 15 * 60000),
              type: "ai_suggestion",
              aiEngine: "civic_intelligence" as AIEngineId,
              whyExplanation: "Aggregated reports indicate this infrastructure failure affects multiple households in your immediate vicinity.",
              needsAction: false,
              actionType: "support"
            });
          }

          // Department Assigned Event
          if (["assigned", "work_started", "in_progress", "evidence_uploaded", "ai_verifying_repair", "citizen_verification_pending", "resolved", "closed"].includes(report.status)) {
            stages.push({
              id: "assigned",
              title: "⚖️ Department Dispatched & Assigned",
              message: `⚖️ Decision Intelligence assigned your report to the "${report.departmentAssigned || "Municipal Department"}" with expected resolution within ${report.estimatedResolution || "1 Day"}.`,
              time: new Date(baseTime + 30 * 60000),
              type: "assigned",
              aiEngine: "decision_intelligence" as AIEngineId,
              whyExplanation: `Jurisdictional matching routed this report to ${report.departmentAssigned} as the primary authorized agency with the lowest current queue workload in your ward.`,
              needsAction: false,
              actionType: "track_progress"
            });
          }

          // Crew Dispatched Event
          if (["work_started", "in_progress", "evidence_uploaded", "ai_verifying_repair", "citizen_verification_pending", "resolved", "closed"].includes(report.status)) {
            stages.push({
              id: "work_started",
              title: "👷 Repair Crew Dispatched",
              message: `👷 Repair crew under Officer Ramesh Kumar has been dispatched and is traveling to your report location.`,
              time: new Date(baseTime + 45 * 60000),
              type: "work_started",
              needsAction: false,
              actionType: "track_progress"
            });
          }

          // Repair Started Event
          if (["in_progress", "evidence_uploaded", "ai_verifying_repair", "citizen_verification_pending", "resolved", "closed"].includes(report.status)) {
            stages.push({
              id: "in_progress",
              title: "👷 Physical Repair Started",
              message: "👷 Repair crew has arrived at the coordinate coordinates and commenced physical work operations.",
              time: new Date(baseTime + 60 * 60000),
              type: "work_started",
              needsAction: false,
              actionType: "track_progress"
            });
          }

          // Evidence Uploaded Event
          if (["evidence_uploaded", "ai_verifying_repair", "citizen_verification_pending", "resolved", "closed"].includes(report.status)) {
            stages.push({
              id: "evidence_uploaded",
              title: "👷 Repair Evidence Uploaded",
              message: "👷 Field crews have completed physical work and uploaded high-resolution before/after images.",
              time: new Date(updateTime - 10 * 60000),
              type: "repair_completed",
              needsAction: false,
              actionType: "view_report"
            });
          }

          // Verification Requested Event
          if (["citizen_verification_pending", "resolved", "closed"].includes(report.status)) {
            stages.push({
              id: "citizen_verification_pending",
              title: "✅ Community Verification Requested",
              message: "Repair completed. Please verify whether the issue has really been fixed.",
              time: new Date(updateTime - 5 * 60000),
              type: "verification_requested",
              aiEngine: "resolution_intelligence" as AIEngineId,
              whyExplanation: "Visual validation confirmed successful repair with 92% confidence. Requesting citizen validation to close the ticket.",
              needsAction: report.status === "citizen_verification_pending", // Only needs action if currently pending
              actionType: "verify_repair"
            });
          }

          // Issue Reopened Event (if report was reopened)
          if (report.status === "in_progress" && report.updatedAt.getTime() > report.createdAt.getTime() + 2 * 3600000) {
            stages.push({
              id: "reopened",
              title: "⚠️ Report Reopened by Citizen",
              message: "⚠️ You indicated that the issue still exists. CityOS has reopened the ticket and alerted the department.",
              time: new Date(updateTime),
              type: "work_started",
              needsAction: false,
              actionType: "track_progress"
            });
          }

          // Issue Resolved Event
          if (report.status === "resolved" || report.status === "closed") {
            stages.push({
              id: "resolved",
              title: "✓ Community Verified Resolution",
              message: "✓ Issue has been verified as resolved by the citizen and closed in the municipal database.",
              time: new Date(updateTime),
              type: "repair_completed",
              aiEngine: "resolution_intelligence" as AIEngineId,
              whyExplanation: "Citizen confirmation and computer-vision audit verified that the asset has been restored to fully operational conditions.",
              needsAction: false,
              actionType: "view_report"
            });
          }

          // Community support alerts
          if (report.communitySupport > 0) {
            stages.push({
              id: `support-${report.communitySupport}`,
              title: "❤️ Community Support Growing",
              message: `❤️ ${report.communitySupport} citizens are supporting your report, boosting its priority standing.`,
              time: new Date(baseTime + 2 * 3600000),
              type: "ai_suggestion",
              needsAction: false,
              actionType: "support"
            });
          }

          if (report.communitySupport > 25) {
            stages.push({
              id: "trending",
              title: "🔥 Trending Civic Issue",
              message: `🔥 Your issue is now trending in your ward. City officials are tracking response metrics.`,
              time: new Date(baseTime + 3 * 3600000),
              type: "ai_suggestion",
              needsAction: false,
              actionType: "support"
            });
          }

          // Map stages to notification objects
          stages.forEach((stage) => {
            const notifId = `${report.reportId}-${stage.id}`;
            if (!currentNotifications[notifId]) {
              currentNotifications[notifId] = {
                notificationId: notifId,
                userId,
                title: stage.title,
                message: stage.message,
                type: stage.type,
                reportId: report.reportId,
                isRead: false,
                createdAt: stage.time,
                aiEngine: stage.aiEngine,
                whyExplanation: stage.whyExplanation,
                needsAction: stage.needsAction,
                actionType: stage.actionType,
                category: report.issueCategory,
                department: report.departmentAssigned,
                ward: report.location.ward
              };
              updated = true;
            } else {
              // Update status-related mutable fields (like needsAction)
              const existing = currentNotifications[notifId]!;
              if (existing.needsAction !== stage.needsAction) {
                currentNotifications[notifId] = {
                  ...existing,
                  needsAction: stage.needsAction
                };
                updated = true;
              }
            }
          });
        });

        // 2. Add predictive recommendations and achievements
        const resolvedReportsCount = reports.filter((r) => r.citizenId === userId && (r.status === "resolved" || r.status === "closed")).length;

        // Predictive AI Civic Intelligence Event
        const riskId = `${userId}-predictive-risk`;
        if (!currentNotifications[riskId]) {
          currentNotifications[riskId] = {
            notificationId: riskId,
            userId,
            title: "📊 Predictive Risk: Water Pressure Drop",
            message: "📊 Civic Intelligence predicts a 75% probability of local water pressure drop tomorrow due to pipeline maintenance. Storing water is recommended.",
            type: "ai_suggestion",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 3600 * 2), // 2 hours ago
            aiEngine: "civic_intelligence",
            whyExplanation: "Correlating active valve repairs on Mainline-4 with ward consumption forecasts.",
            needsAction: false,
            actionType: "ask_copilot"
          };
          updated = true;
        }

        // Civic Achievement Event
        if (resolvedReportsCount >= 2) {
          const achId = `${userId}-civic-achievement-guardian`;
          if (!currentNotifications[achId]) {
            currentNotifications[achId] = {
              notificationId: achId,
              userId,
              title: "🏆 Civic Guardian Milestone Achieved!",
              message: `🏆 Congratulations! You've helped resolve ${resolvedReportsCount} issues in Bengaluru. Thank you for keeping your neighborhood safe.`,
              type: "ai_suggestion",
              isRead: false,
              createdAt: new Date(Date.now() - 1000 * 3600 * 5), // 5 hours ago
              needsAction: false,
              actionType: "ask_copilot"
            };
            updated = true;
          }
        }

        // Civic Copilot suggestion
        const copilotId = `${userId}-copilot-voice-recommendation`;
        if (!currentNotifications[copilotId]) {
          currentNotifications[copilotId] = {
            notificationId: copilotId,
            userId,
            title: "🤖 Copilot Tip: Voice Reporting",
            message: "🤖 Try saying 'Large pothole on MG Road' next time. Civic Copilot will auto-categorize and draft the report for you.",
            type: "ai_suggestion",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 3600 * 24), // 1 day ago
            aiEngine: "civic_copilot",
            whyExplanation: "Analysis of average typing speeds indicates voice input reduces reporting friction by 40%.",
            needsAction: false,
            actionType: "ask_copilot"
          };
          updated = true;
        }

        // City Announcement
        const annId = `${userId}-announcement-community-fair`;
        if (!currentNotifications[annId]) {
          currentNotifications[annId] = {
            notificationId: annId,
            userId,
            title: "📢 Annual Ward 7 Community Fair",
            message: "📢 Connect with municipal heads and discuss ward improvements this Saturday at Central Park, 10 AM.",
            type: "nearby_alert",
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 3600 * 48), // 2 days ago
            needsAction: false,
            actionType: "open_map"
          };
          updated = true;
        }

        // Nearby Critical Alert (MG Road power line)
        const nearbyAlertId = `${userId}-nearby-alert-powerline`;
        if (!currentNotifications[nearbyAlertId]) {
          currentNotifications[nearbyAlertId] = {
            notificationId: nearbyAlertId,
            userId,
            title: "⚠️ Nearby Critical Safety Hazard",
            message: "⚠️ Live high-tension power line reported fallen 200m from MG Road. BESCOM crew dispatched on high emergency.",
            type: "nearby_alert",
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
            needsAction: false,
            actionType: "open_map"
          };
          updated = true;
        }

        if (updated) {
          set({ notifications: currentNotifications, initialized: true });
        }
      }
    }),
    {
      name: "cityos-notifications-store",
    }
  )
);
