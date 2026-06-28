"use client";

import { useEffect } from "react";
import { AuthoritySideNav, AuthorityBottomNav } from "@/components/layout/AuthorityNav";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";
import { PortalErrorBoundary } from "@/components/errors/PortalErrorBoundary";
import { useAuthStore } from "@/store/authStore";

export default function AuthorityLayout({ children }: { children: React.ReactNode }) {
  const { user, loginAsDemo } = useAuthStore();

  useEffect(() => {
    // If no user is logged in, or the user is not an authority, log in as demo authority
    if (!user || user.role !== "authority") {
      loginAsDemo("authority");
    }
  }, [user, loginAsDemo]);

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0f1c] text-slate-100 font-sans">
      <DemoModeBanner />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (desktop/tablet) */}
        <div className="hidden md:block h-full">
          <AuthoritySideNav />
        </div>
        {/* Page content */}
        <main className="flex-1 min-w-0 bg-[#0a0f1c] mb-16 md:mb-0 overflow-y-auto">
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
