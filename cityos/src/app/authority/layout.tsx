import type { Metadata } from "next";
import { AuthoritySideNav, AuthorityBottomNav } from "@/components/layout/AuthorityNav";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";
import { PortalErrorBoundary } from "@/components/errors/PortalErrorBoundary";
import { APP_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: { default: `${APP_NAME} — Authority Portal`, template: `%s | ${APP_NAME}` },
};

export default function AuthorityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoModeBanner />
      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <div className="hidden md:block">
          <AuthoritySideNav />
        </div>
        {/* Page content */}
        <main className="flex-1 min-w-0 bg-background mb-16 md:mb-0">
          <PortalErrorBoundary portalName="authority">
            {children}
          </PortalErrorBoundary>
        </main>
      </div>
      {/* Bottom nav (mobile only) */}
      <AuthorityBottomNav />
    </div>
  );
}
