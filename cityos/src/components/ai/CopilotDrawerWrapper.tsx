"use client";

import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { CopilotDrawer } from "@/components/ai/CopilotDrawer";

/**
 * Renders the CopilotDrawer connected to the global app store.
 * Must be a client component. Placed at the layout level.
 */
export function CopilotDrawerWrapper() {
  const isCopilotOpen = useAppStore((s) => s.isCopilotOpen);
  const closeCopilot = useAppStore((s) => s.closeCopilot);

  return (
    <CopilotDrawer
      isOpen={isCopilotOpen}
      onClose={closeCopilot}
    />
  );
}
