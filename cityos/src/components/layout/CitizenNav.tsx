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
    <header className="flex justify-between items-center px-4 md:px-12 py-4 w-full fixed top-0 z-50 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-slate-800 shadow-sm safe-top h-16 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-blue-600 dark:text-blue-400 text-title-lg font-bold">
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
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold border border-blue-100/50 dark:border-blue-900/30"
                  : "text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
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
        <Link href="/notifications" className="relative p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-full cursor-pointer active:scale-95 duration-200">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400" style={{ fontSize: 24 }} aria-hidden="true">
            notifications
          </span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/help" className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-full cursor-pointer active:scale-95 duration-200">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400" style={{ fontSize: 24 }} aria-hidden="true">
            help
          </span>
        </Link>
        {user && (
          <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500/20 cursor-pointer active:scale-95 duration-200 flex items-center justify-center">
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
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center pt-2 pb-safe px-4 bg-white dark:bg-[#111827] border-t border-gray-205 dark:border-slate-800 shadow-[0px_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0px_-4px_20px_rgba(0,0,0,0.25)] rounded-t-lg md:hidden transition-colors duration-200"
      aria-label="Main navigation"
    >
      {navItems.map(({ href, icon, label }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all active:scale-90 duration-150",
              isActive
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold"
                : "text-slate-550 dark:text-slate-455 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
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
            <span className="text-[10px] font-medium leading-[14px] tracking-[0.1px] mt-0.5">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
