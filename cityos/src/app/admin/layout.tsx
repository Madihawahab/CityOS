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
    <div className="flex min-h-screen flex-col">
      <DemoModeBanner />
      <div className="flex flex-1">
        <AdminSideNav />
        <main className="flex-1 min-w-0 bg-background overflow-auto">
          <PortalErrorBoundary portalName="admin">
            {children}
          </PortalErrorBoundary>
        </main>
      </div>
    </div>
  );
}
