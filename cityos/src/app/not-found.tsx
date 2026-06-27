import Link from "next/link";
import type { Metadata } from "next";
import { APP_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-8 text-center bg-background">
      {/* Large visual */}
      <div className="relative">
        <div className="text-[120px] font-black text-surface-container leading-none select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-primary-light p-4">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: 48 }}
              aria-hidden="true"
            >
              location_off
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 max-w-sm">
        <h1 className="text-headline-md font-bold text-on-surface">
          Page not found
        </h1>
        <p className="text-body-md text-on-surface-variant">
          This page doesn&apos;t exist in {APP_NAME}. It may have been moved or the link
          is incorrect.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-colors min-h-[48px]"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">home</span>
          Return to Home
        </Link>
        <Link
          href="/reports"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-outline px-6 py-3 text-sm font-semibold text-on-surface hover:bg-surface-low transition-colors min-h-[48px]"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">list_alt</span>
          My Reports
        </Link>
      </div>
    </div>
  );
}
