import type { Metadata } from "next";
import { AdminSideNav } from "@/components/layout/AdminNav";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";
import { PortalErrorBoundary } from "@/components/errors/PortalErrorBoundary";
import { APP_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: { default: `${APP_NAME} — Admin Portal`, template: `%s | ${APP_NAME}` },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0a0f1c] text-slate-200">
      <DemoModeBanner />
      <div className="flex flex-1 overflow-hidden">
        <AdminSideNav />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <PortalErrorBoundary portalName="admin">
            {children}
          </PortalErrorBoundary>
        </div>
      </div>
    </div>
  );
}
