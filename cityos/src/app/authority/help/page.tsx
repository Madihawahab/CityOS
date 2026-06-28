"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

const FAQS = [
  {
    question: "How do I upload repair evidence?",
    answer: "Open a task in your Work Queue, select the issue, and click 'Submit Repair Evidence'. Upload the after-repair photo, add descriptive repair notes, and press submit. Resolution Intelligence will analyze the images and resolve the ticket.",
  },
  {
    question: "What does the AI Priority Score represent?",
    answer: "It is a dynamic value between 0 and 100 calculated by the Trust and Decision engines. It aggregates factors such as proximity to schools/hospitals, community support count, severity rating, and duplicate merges to prioritize urgent dispatches.",
  },
  {
    question: "What happens if GPS validation fails during verification?",
    answer: "Resolution Intelligence checks metadata of uploaded photos against the reported location. If it detects a mismatch, it recommends the team to verify the site coordinates or request updated evidence, marking the ticket as pending review.",
  },
  {
    question: "How do I escalate an issue to another department?",
    answer: "If a water leak causes road damage, resolve the water leak first. The BBMP Roads and Infrastructure department will automatically receive a linked repair order to restore asphalt via the Decision Intelligence system.",
  },
];

export default function AuthorityHelpPage() {
  const user = useAuthStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const departmentName = user?.department || "BWSSB Water Works";

  return (
    <div className="p-8 space-y-8 bg-[#0a0f1c] min-h-screen text-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Help &amp; Support</h2>
          <p className="text-slate-400 text-sm">Authority operator guides, FAQs, and agency contact details.</p>
        </div>
        <Link
          href="/authority"
          className="text-xs text-blue-500 hover:underline flex items-center gap-1 focus:outline-none"
        >
          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
          Back to Dashboard
        </Link>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* FAQs (col-span-8) */}
        <section className="col-span-12 md:col-span-8 space-y-6">
          <div className="bg-[#12192c] border border-slate-800/50 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-300">Frequently Asked Questions</h3>

            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search operational documentation..."
                className="w-full bg-[#1a2337]/50 border border-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl text-xs placeholder:text-slate-600 text-white pl-9 pr-4 py-2 focus:outline-none"
              />
            </div>

            <div className="space-y-4 pt-2">
              {filteredFaqs.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No FAQ matches your search query.</p>
              ) : (
                filteredFaqs.map((faq, i) => (
                  <div key={i} className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200">{faq.question}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{faq.answer}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Agency Contacts (col-span-4) */}
        <section className="col-span-12 md:col-span-4 bg-[#12192c] border border-slate-800/50 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-300 border-b border-slate-800 pb-2 mb-4">Agency Hotlines</h3>
            <div className="space-y-4 text-xs text-left">
              <div>
                <p className="font-bold text-slate-400">BBMP Central Control Room</p>
                <p className="font-semibold text-blue-400 mt-0.5">080-22221111</p>
                <p className="text-[10px] text-slate-500">For road, flooding, &amp; sanitation escalations.</p>
              </div>
              <div className="pt-2 border-t border-slate-800/60">
                <p className="font-bold text-slate-400">BWSSB Water Desk</p>
                <p className="font-semibold text-blue-400 mt-0.5">1916 (Toll-Free)</p>
                <p className="text-[10px] text-slate-500">For pipeline leaks &amp; drainage blocks.</p>
              </div>
              <div className="pt-2 border-t border-slate-800/60">
                <p className="font-bold text-slate-400">BESCOM Electricity Dispatch</p>
                <p className="font-semibold text-blue-400 mt-0.5">1912</p>
                <p className="text-[10px] text-slate-500">For transformer faults &amp; line snaps.</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#1a2337]/50 border border-slate-800 rounded-xl mt-4">
            <p className="text-[10px] text-slate-500 leading-relaxed text-center">
              Logged in as <span className="font-semibold text-slate-300">{user?.fullName}</span> assigned to {departmentName}.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
