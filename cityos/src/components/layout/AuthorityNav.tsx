"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/authStore";
import { APP_NAME } from "@/lib/utils/constants";

const AUTHORITY_NAV_ITEMS = [
  { href: "/authority", icon: "dashboard", label: "Dashboard" },
  { href: "/authority/queue", icon: "format_list_bulleted", label: "Work Queue" },
  { href: "/authority/map", icon: "map", label: "Area Map" },
  { href: "/authority/resolved", icon: "check_circle", label: "Resolved" },
  { href: "/authority/profile", icon: "person", label: "Profile" },
];

export function AuthoritySideNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className="flex flex-col w-64 flex-shrink-0 border-r border-outline-variant/30 bg-white h-full"
      aria-label="Authority navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-outline-variant/30">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
          <span className="material-symbols-outlined text-white" style={{ fontSize: 18 }} aria-hidden="true">location_city</span>
        </div>
        <div>
          <div className="text-title-md font-bold text-on-surface">{APP_NAME}</div>
          <div className="text-label-md text-on-surface-variant">Authority Portal</div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-4 space-y-1" aria-label="Authority sections">
        {AUTHORITY_NAV_ITEMS.map(({ href, icon, label }) => {
          const isActive = href === "/authority" ? pathname === "/authority" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-body-md font-medium transition-all",
                isActive
                  ? "bg-primary-light text-primary"
                  : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
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
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      {user && (
        <div className="border-t border-outline-variant/30 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-surface-low p-3">
            <Avatar name={user.fullName} size="sm" />
            <div className="min-w-0">
              <p className="text-body-md font-semibold text-on-surface truncate">{user.fullName}</p>
              <p className="text-label-md text-on-surface-variant truncate">{user.department}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

/**
 * Mobile bottom nav for Authority Portal
 */
export function AuthorityBottomNav() {
  const pathname = usePathname();
  const mobileItems = AUTHORITY_NAV_ITEMS.slice(0, 4);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-outline-variant/30 safe-bottom md:hidden" aria-label="Authority navigation">
      <div className={`grid grid-cols-${mobileItems.length}`}>
        {mobileItems.map(({ href, icon, label }) => {
          const isActive = href === "/authority" ? pathname === "/authority" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={cn("flex flex-col items-center justify-center gap-1 py-2 min-h-[56px]", isActive ? "text-primary" : "text-on-surface-variant")} aria-current={isActive ? "page" : undefined}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }} aria-hidden="true">{icon}</span>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
