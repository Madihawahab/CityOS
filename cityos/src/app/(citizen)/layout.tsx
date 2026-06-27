import type { Metadata } from "next";
import { CitizenTopNav } from "@/components/layout/CitizenNav";
import { CitizenBottomNav } from "@/components/layout/CitizenNav";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";
import { CopilotDrawerWrapper } from "@/components/ai/CopilotDrawerWrapper";
import { PortalErrorBoundary } from "@/components/errors/PortalErrorBoundary";
import { ReportsStoreInitializer } from "@/components/layout/ReportsStoreInitializer";
import { APP_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: { default: `${APP_NAME} — Citizen Portal`, template: `%s | ${APP_NAME}` },
};

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <ReportsStoreInitializer />
      <DemoModeBanner />
      <CitizenTopNav />
      {/* Top nav height = 64px */}
      <div className="flex-1 mt-16 mb-16">
        <PortalErrorBoundary portalName="citizen">
          {children}
        </PortalErrorBoundary>
      </div>
      <CitizenBottomNav />
      <CopilotDrawerWrapper />
    </div>
  );
}
