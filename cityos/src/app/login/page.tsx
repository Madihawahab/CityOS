import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginContent } from "./LoginContent";
import { APP_NAME } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Sign In",
  description: `Sign in to ${APP_NAME} — Bengaluru's AI civic operating system`,
};

/**
 * Login page wrapper — Suspense is required by Next.js when using useSearchParams()
 * in a Client Component that is exported as a page.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-[3px] border-t-primary border-surface-container animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
