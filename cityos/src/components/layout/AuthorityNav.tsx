"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/authStore";
import { useNotifications } from "@/hooks/useNotifications";
import { APP_NAME } from "@/lib/utils/constants";

const AUTHORITY_NAV_ITEMS = [
  { href: "/authority", icon: "dashboard", label: "Dashboard" },
  { href: "/authority/performance", icon: "leaderboard", label: "Department Performance" },
  { href: "/authority/notifications", icon: "notifications", label: "Notifications" },
  { href: "/authority/settings", icon: "settings", label: "Settings" },
  { href: "/authority/help", icon: "help", label: "Help & Support" },
];

export function AuthoritySideNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { unreadCount } = useNotifications();

  // Fallback to demo user if not logged in
  const userName = user?.fullName || "Ramesh Kumar";
  const userDept = user?.department || "Water Works Dept.";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "RK";

  return (
    <aside
      className="w-64 flex-shrink-0 bg-[#0a0f1c] border-r border-slate-800 flex flex-col h-full"
      aria-label="Authority navigation"
    >
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none text-white">{APP_NAME}</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Authority Portal</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto" aria-label="Authority sections">
        {AUTHORITY_NAV_ITEMS.map(({ href, icon, label }) => {
          const isActive = href === "/authority" ? pathname === "/authority" : pathname.startsWith(href);
          const showBadge = label === "Notifications" && unreadCount > 0;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors border",
                isActive
                  ? "bg-blue-600/10 text-blue-400 border-blue-600/20"
                  : "text-slate-400 hover:bg-white/5 border-transparent"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined flex-shrink-0"
                  style={{ fontSize: 20 }}
                  aria-hidden="true"
                >
                  {icon}
                </span>
                {label}
              </div>
              {showBadge && (
                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Dynamic User Profile Card at Bottom */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center font-bold text-xs text-blue-200">
              {userInitials}
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0a0f1c]"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold truncate text-white">{userName}</h4>
            <p className="text-[10px] text-slate-500 truncate">{userDept}</p>
          </div>
          <button className="text-slate-500 hover:text-white" aria-label="More user options">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

/**
 * Mobile/Tablet bottom nav for Authority Portal
 */
export function AuthorityBottomNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1c] border-t border-slate-800 safe-bottom md:hidden"
      aria-label="Authority navigation"
    >
      <div className="grid grid-cols-5">
        {AUTHORITY_NAV_ITEMS.map(({ href, icon, label }) => {
          const isActive = href === "/authority" ? pathname === "/authority" : pathname.startsWith(href);
          const showBadge = label === "Notifications" && unreadCount > 0;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] relative",
                isActive ? "text-blue-400" : "text-slate-400"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }} aria-hidden="true">
                {icon}
              </span>
              <span className="text-[10px] font-medium">{label}</span>
              {showBadge && (
                <span className="absolute top-1 right-3 bg-blue-600 text-white text-[8px] px-1 py-0.2 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
