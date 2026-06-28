"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/authStore";

const ADMIN_NAV_ITEMS = [
  { href: "/admin", icon: "⊞", label: "Dashboard" },
  { href: "/admin/report-oversight", icon: "☰", label: "Report Oversight" },
  { href: "/admin/analytics", icon: "📊", label: "Analytics & Predictions" },
  { href: "/admin/mission-control", icon: "⚙️", label: "AI Mission Control" },
  { href: "/admin/settings", icon: "⚙️", label: "Settings" },
];

export function AdminSideNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className="w-64 flex-shrink-0 bg-[#070c1a] border-r border-slate-800 flex flex-col h-full text-slate-200 font-sans"
      aria-label="Admin navigation"
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-bold text-white">CityOS</h1>
          <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Admin Portal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-2" aria-label="Admin sections">
        {ADMIN_NAV_ITEMS.map(({ href, icon, label }) => {
          const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center px-3 py-2 text-sm rounded-lg transition-colors group",
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-600/30 font-medium"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="mr-3 text-lg opacity-70" aria-hidden="true">
                {icon}
              </span>
              <span>{label}</span>
              {href === "/admin/mission-control" && (
                <span className="ml-auto h-2 w-2 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* AI System Status */}
      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider">AI SYSTEM STATUS</span>
        </div>
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-[10px] text-green-500 font-medium">
            <span className="mr-2">●</span> All Systems Operational
          </div>
          <div className="space-y-1.5 pl-3">
            {[
              "Report Intelligence",
              "Trust Engine",
              "Decision Intelligence",
              "Resolution Intelligence",
              "Civic Intelligence",
              "Civic Copilot",
            ].map((engine) => (
              <div key={engine} className="flex items-center text-[10px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" aria-hidden="true" />
                <span>{engine}</span>
              </div>
            ))}
          </div>
        </div>
        <Link
          href="/admin/mission-control"
          className="w-full text-left text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center justify-between"
        >
          <span>View AI Mission Control</span>
          <span>→</span>
        </Link>
      </div>

      {/* User Section */}
      {user && (
        <div className="border-t border-slate-800 p-4 bg-[#0a0f1d]/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
              {user.fullName.split(" ").map((n) => n[0]).join("").substring(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.department ?? "City Operations"}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
