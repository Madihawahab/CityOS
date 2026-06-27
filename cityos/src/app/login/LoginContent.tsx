"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { logger } from "@/lib/logger/logger";
import { APP_NAME, APP_TAGLINE } from "@/lib/utils/constants";
import type { UserRole } from "@/types";

const DEMO_ROLES: Array<{
  role: UserRole;
  label: string;
  dept?: string;
  icon: string;
  description: string;
}> = [
  { role: "citizen", label: "Priya Sharma", icon: "person", description: "Report civic issues and track resolutions" },
  { role: "authority", label: "Ramesh Kumar", dept: "BWSSB Water Works", icon: "badge", description: "Manage work queue and upload repair evidence" },
  { role: "admin", label: "Dr. Anand Krishnan", dept: "BBMP Admin", icon: "admin_panel_settings", description: "City-wide analytics and AI mission control" },
];

function setDemoCookie(role: string) {
  if (typeof document !== "undefined") {
    document.cookie = `cityos-demo-role=${role}; path=/; max-age=86400; SameSite=Lax`;
  }
}

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginAsDemo = useAuthStore((s) => s.loginAsDemo);
  const [loading, setLoading] = useState<UserRole | null>(null);

  const from = searchParams.get("from") ?? "/";

  const handleDemoLogin = async (role: UserRole) => {
    setLoading(role);
    setDemoCookie(role);
    loginAsDemo(role);
    logger.auth("DEMO_LOGIN", role);
    await new Promise((r) => setTimeout(r, 500));
    const redirect = role === "admin" ? "/admin" : role === "authority" ? "/authority"
      : (from === "/" || from.startsWith("/authority") || from.startsWith("/admin")) ? "/" : from;
    router.push(redirect);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden" style={{ backgroundColor: "var(--color-on-surface)" }}>
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: `${(i + 1) * 15}%`, height: `${(i + 1) * 15}%`, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            />
          ))}
        </div>

        <div className="relative text-center space-y-8 max-w-md">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--color-primary)" }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: 32 }} aria-hidden="true">location_city</span>
            </div>
            <span className="text-4xl font-black text-white">{APP_NAME}</span>
          </div>
          <p className="text-xl font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{APP_TAGLINE}</p>
          <div className="space-y-3 text-left">
            {[
              { icon: "image_search", label: "Report Intelligence", desc: "AI analyses every civic report" },
              { icon: "verified_user", label: "Trust Engine", desc: "96% accuracy fraud detection" },
              { icon: "route", label: "Decision Intelligence", desc: "Instant department routing" },
              { icon: "fact_check", label: "Resolution Intelligence", desc: "Verifies repair evidence" },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(0,74,198,0.25)" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "var(--color-primary-light)" }} aria-hidden="true">{icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login */}
      <div className="flex flex-1 flex-col items-center justify-center p-8" style={{ backgroundColor: "var(--color-background)" }}>
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: "var(--color-primary)" }}>
              <span className="material-symbols-outlined text-white" style={{ fontSize: 26 }} aria-hidden="true">location_city</span>
            </div>
            <h1 className="text-headline-md font-bold" style={{ color: "var(--color-on-surface)" }}>{APP_NAME}</h1>
          </div>

          <div>
            <h2 className="text-headline-md font-bold" style={{ color: "var(--color-on-surface)" }}>Welcome back</h2>
            <p className="mt-1 text-body-md" style={{ color: "var(--color-on-surface-variant)" }}>
              Select a role to explore CityOS
            </p>
          </div>

          {/* Demo Role Cards */}
          <div className="space-y-3">
            <p className="text-label-md font-semibold uppercase tracking-wider" style={{ color: "var(--color-on-surface-variant)" }}>
              Select Demo Role
            </p>
            {DEMO_ROLES.map(({ role, label, dept, icon, description }) => (
              <button
                key={role}
                onClick={() => handleDemoLogin(role)}
                disabled={loading !== null}
                className="w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-all"
                style={{
                  border: "2px solid var(--color-outline-variant)",
                  backgroundColor: "white",
                  cursor: loading !== null ? "not-allowed" : "pointer",
                  opacity: loading !== null ? 0.6 : 1,
                }}
                aria-label={`Login as ${label} (${role})`}
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: role === "citizen" ? "var(--color-primary-light)" :
                      role === "authority" ? "rgba(0,108,73,0.1)" : "var(--color-on-surface)",
                    color: role === "citizen" ? "var(--color-primary)" :
                      role === "authority" ? "var(--color-secondary)" : "white",
                  }}>
                  {loading === role ? (
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: 22 }}>progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }} aria-hidden="true">{icon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-md font-semibold" style={{ color: "var(--color-on-surface)" }}>{label}</p>
                  <p className="text-label-md" style={{ color: "var(--color-on-surface-variant)" }}>{dept ?? description}</p>
                </div>
                <span className="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                  style={{ backgroundColor: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
                  {role}
                </span>
              </button>
            ))}
          </div>

          <p className="text-center text-label-md" style={{ color: "var(--color-on-surface-variant)" }}>
            CityOS — Bengaluru&apos;s AI Civic Operating System
          </p>
        </div>
      </div>
    </div>
  );
}
