import type { Metadata } from "next";
import { APP_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = { title: "Overview" };

export default function AdminOverviewPage() {
  return (
    <div className="p-6">
      <h1 className="text-headline-md font-bold text-on-surface">Admin Overview</h1>
      <p className="mt-2 text-body-md text-on-surface-variant">
        Phase 4 will implement the full Admin Portal. Foundation is ready.
      </p>
    </div>
  );
}
