"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/authStore";
import { APP_NAME } from "@/lib/utils/constants";

const ADMIN_NAV_ITEMS = [
  { href: "/admin", icon: "dashboard", label: "Overview" },
  { href: "/admin/reports", icon: "analytics", label: "All Reports" },
  { href: "/admin/departments", icon: "corporate_fare", label: "Departments" },
  { href: "/admin/ai-mission-control", icon: "smart_toy", label: "AI Mission Control" },
  { href: "/admin/audit", icon: "security", label: "Audit Log" },
  { href: "/admin/predictions", icon: "trending_up", label: "Predictions" },
];

export function AdminSideNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className="flex flex-col w-72 flex-shrink-0 border-r border-outline-variant/30 bg-on-surface min-h-screen"
      aria-label="Admin navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }} aria-hidden="true">location_city</span>
        </div>
        <div>
          <div className="text-title-md font-bold text-inverse-on-surface">{APP_NAME}</div>
          <div className="text-label-md text-inverse-on-surface/60">Admin Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1" aria-label="Admin sections">
        {ADMIN_NAV_ITEMS.map(({ href, icon, label }) => {
          const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-body-md font-medium transition-all",
                isActive
                  ? "bg-primary text-white"
                  : "text-inverse-on-surface/70 hover:bg-white/10 hover:text-inverse-on-surface"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className="material-symbols-outlined flex-shrink-0"
                style={{ fontSize: 20, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                aria-hidden="true"
              >
                {icon}
              </span>
              {label}
              {href === "/admin/ai-mission-control" && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-secondary animate-pulse" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* City Intelligence Status */}
      <div className="px-4 pb-4">
        <div className="rounded-xl bg-white/10 p-3 space-y-2">
          <div className="flex items-center gap-2 text-label-md font-semibold text-inverse-on-surface">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }} aria-hidden="true">smart_toy</span>
            Intelligence Layer
          </div>
          {["Report Intelligence", "Trust Engine", "Decision AI", "Resolution AI"].map((engine) => (
            <div key={engine} className="flex items-center justify-between text-label-md">
              <span className="text-inverse-on-surface/70">{engine}</span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden="true" />
                <span className="text-secondary font-medium">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User */}
      {user && (
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={user.fullName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-body-md font-semibold text-inverse-on-surface truncate">{user.fullName}</p>
              <p className="text-label-md text-inverse-on-surface/60 truncate">{user.department ?? "Admin"}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
