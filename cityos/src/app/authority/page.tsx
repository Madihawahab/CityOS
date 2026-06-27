import type { Metadata } from "next";
import { APP_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = { title: "Dashboard" };

export default function AuthorityDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-headline-md font-bold text-on-surface">Authority Dashboard</h1>
      <p className="mt-2 text-body-md text-on-surface-variant">
        Phase 3 will implement the full Authority Portal. Foundation is ready.
      </p>
    </div>
  );
}
