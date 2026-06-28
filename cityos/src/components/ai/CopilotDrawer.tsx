"use client";

import { useState, useRef, useEffect, useMemo, type FormEvent } from "react";
import { cn } from "@/lib/utils/cn";
import { Drawer } from "@/components/ui/Drawer";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/authStore";
import type { CopilotMessage } from "@/types";

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string;
}

export function CopilotDrawer({ isOpen, onClose, reportId }: CopilotDrawerProps) {
  const user = useAuthStore((s) => s.user);
  const citizenName = user?.fullName ?? "Priya Sharma";

  const welcomeMessage = useMemo(() => ({
    role: "assistant" as const,
    content: `Hello, ${citizenName} 👋\n\nHow can CityOS help you today?`,
    timestamp: new Date(),
  }), [citizenName]);

  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([welcomeMessage]);
    }, 0);
    return () => clearTimeout(timer);
  }, [welcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const triggerMessage = async (text: string) => {
    const userMsg: CopilotMessage = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6),
          reportId,
        }),
      });

      const data = await res.json() as { response: string };
      const aiMsg: CopilotMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having a brief connectivity issue. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    await triggerMessage(trimmed);
  };

  const handleSuggestionClick = async (prompt: string) => {
    if (isLoading) return;
    await triggerMessage(prompt);
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="CivicCopilot" side="right">
      <div className="flex h-full flex-col">
        {/* AI label */}
        <div className="flex items-center gap-2 border-b border-outline-variant/20 px-6 py-3 bg-primary-light/20">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>smart_toy</span>
          <span className="text-label-md font-medium text-primary">CityOS Intelligence Layer</span>
          <span className="ml-auto h-2 w-2 rounded-full bg-secondary animate-pulse" aria-label="Active" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" role="log" aria-live="polite" aria-label="CivicCopilot conversation">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex items-start gap-3", msg.role === "user" && "flex-row-reverse")}>
              {msg.role === "assistant" ? (
                <div className="flex-shrink-0 rounded-full bg-primary p-2">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }} aria-hidden="true">smart_toy</span>
                </div>
              ) : (
                <Avatar name={user?.fullName ?? "You"} size="sm" className="flex-shrink-0" />
              )}
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-body-md whitespace-pre-line",
                msg.role === "assistant"
                  ? "bg-surface-low text-on-surface rounded-tl-sm"
                  : "bg-primary text-white rounded-tr-sm"
              )}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Suggested Prompts (Chips displayed before first query) */}
          {messages.length === 1 && !isLoading && (
            <div className="grid grid-cols-1 gap-2 pt-2 px-1">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1 px-1">Suggested Prompts:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Explain my report",
                  "Why is my issue High Priority?",
                  "Show nearby issues",
                  "When will this be resolved?",
                  "Generate a complaint letter",
                  "Explain today's recommendations",
                ].map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(prompt)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-[10.5px] font-bold text-slate-700 dark:text-slate-300 rounded-lg border border-gray-250 dark:border-slate-800 transition-colors text-left hover:border-blue-500/30 cursor-pointer"
                  >
                    • {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 rounded-full bg-primary p-2">
                <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }} aria-hidden="true">smart_toy</span>
              </div>
              <div className="flex items-center gap-1 rounded-2xl bg-surface-low px-4 py-3 rounded-tl-sm">
                <span className="h-2 w-2 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="border-t border-outline-variant/30 px-4 py-4">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask CivicCopilot anything..."
              className="input-base flex-1 text-sm bg-transparent border border-outline-variant/30 rounded-full px-4 py-2 text-on-surface outline-none"
              aria-label="Message CivicCopilot"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="touch-target flex-shrink-0 rounded-full bg-primary text-white hover:bg-primary-hover p-2 transition-colors disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Send message"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }} aria-hidden="true">send</span>
            </button>
          </div>
          <p className="mt-2 text-center text-label-md text-on-surface-variant text-[10px]">
            AI responses are for information only — not official decisions
          </p>
        </form>
      </div>
    </Drawer>
  );
}

// ─── Copilot FAB ──────────────────────────────────────────────────────────────

interface CopilotFABProps {
  onClick: () => void;
  hasUnread?: boolean;
  className?: string;
}

export function CopilotFAB({ onClick, hasUnread = false, className }: CopilotFABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center",
        "rounded-full bg-primary text-white shadow-dark-lg hover:bg-primary-hover",
        "transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
      aria-label="Open CivicCopilot AI assistant"
    >
      <span className="material-symbols-outlined" style={{ fontSize: 24 }} aria-hidden="true">smart_toy</span>
      {hasUnread && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-secondary border-2 border-white" aria-label="New AI insights" />
      )}
    </button>
  );
}
