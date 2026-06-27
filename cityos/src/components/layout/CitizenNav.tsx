"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/authStore";
import { useNotifications } from "@/hooks/useNotifications";

export function CitizenTopNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { unreadCount } = useNotifications();

  const navItems = [
    { href: "/", icon: "dashboard", label: "Dashboard" },
    { href: "/map", icon: "map", label: "Live Map" },
    { href: "/reports/new", icon: "add_circle", label: "Report" },
    { href: "/reports", icon: "history", label: "My Reports" },
    { href: "/profile", icon: "person", label: "Profile" },
  ];

  return (
    <header className="flex justify-between items-center px-4 md:px-12 py-4 w-full fixed top-0 z-50 bg-white border-b border-outline-variant/30 shadow-sm safe-top h-16">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-primary text-title-lg font-bold">
          CityOS
        </Link>
      </div>

      {/* Desktop/Tablet Middle Navigation */}
      <nav className="hidden md:flex items-center gap-2" aria-label="Desktop navigation">
        {navItems.map(({ href, icon, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-label-md text-label-md transition-colors active:scale-95 duration-150",
                isActive
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                aria-hidden="true"
              >
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/notifications" className="relative p-2 hover:bg-surface-high transition-colors rounded-full cursor-pointer active:scale-95 duration-200">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 24 }} aria-hidden="true">
            notifications
          </span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/help" className="p-2 hover:bg-surface-high transition-colors rounded-full cursor-pointer active:scale-95 duration-200">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 24 }} aria-hidden="true">
            help
          </span>
        </Link>
        {user && (
          <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-light cursor-pointer active:scale-95 duration-200 flex items-center justify-center">
            <Avatar name={user.fullName} imageUrl={user.profilePhoto} size="md" className="w-full h-full" />
          </Link>
        )}
      </div>
    </header>
  );
}

/**
 * Citizen Portal — bottom navigation bar (mobile)
 */
export function CitizenBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: "dashboard", label: "Dashboard" },
    { href: "/map", icon: "map", label: "Live Map" },
    { href: "/reports/new", icon: "add_circle", label: "Report" },
    { href: "/reports", icon: "history", label: "My Reports" },
    { href: "/profile", icon: "person", label: "Profile" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-safe px-4 bg-surface-container shadow-[0px_-4px_20px_rgba(30,41,59,0.05)] rounded-t-lg md:hidden"
      aria-label="Main navigation"
    >
      {navItems.map(({ href, icon, label }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center px-5 py-1 rounded-full transition-all active:scale-90 duration-150",
              isActive
                ? "bg-secondary-container text-on-secondary-container"
                : "text-on-surface-variant hover:bg-surface-container-highest"
            )}
            aria-label={label}
            aria-current={isActive ? "page" : undefined}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 24, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              aria-hidden="true"
            >
              {icon}
            </span>
            <span className="text-[12px] font-medium leading-[16px] tracking-[0.1px]">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
