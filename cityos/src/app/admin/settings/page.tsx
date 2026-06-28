"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, logout, loginAsDemo } = useAuthStore();
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const userName = user?.fullName || "Admin User";
  const userEmail = user?.email || "admin@demo.cityos.in";

  const handleRoleSwitch = (role: "citizen" | "authority" | "admin") => {
    loginAsDemo(role);
    if (role === "citizen") router.push("/profile");
    else if (role === "authority") router.push("/authority/settings");
    else if (role === "admin") router.push("/admin/settings");
  };

  return (
    <div className="p-8 space-y-8 bg-[#0a0f1c] min-h-screen text-slate-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-slate-400 text-sm">Configure portal preferences and switch portal views.</p>
        </div>
      </header>

      {/* Settings Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Profile Card (col-span-4) */}
        <div className="col-span-12 md:col-span-4 space-y-6">
          <section className="bg-[#12192c] border border-slate-800/50 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-indigo-900 flex items-center justify-center font-extrabold text-2xl text-indigo-200">
              {userName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">{userName}</h3>
              <p className="text-xs text-slate-500">City Operations Supervisor</p>
            </div>
            <div className="w-full border-t border-slate-800/80 pt-4 text-xs text-left space-y-2 text-slate-400">
              <p><span className="font-semibold text-slate-355">Email:</span> {userEmail}</p>
              <p><span className="font-semibold text-slate-300">Role:</span> System Admin</p>
              <p><span className="font-semibold text-slate-300">Status:</span> Connected (Demo Mode)</p>
            </div>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 py-2 rounded-xl text-xs font-semibold transition-colors mt-4"
            >
              Sign Out of Portal
            </button>
          </section>

          {/* Portal Switcher (Demo Mode) */}
          <section className="bg-[#12192c] border border-slate-800/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-slate-350 border-b border-slate-850 pb-2">Portal Switcher (Demo)</h3>
            <p className="text-[10px] text-slate-500">Switch roles in real-time to view different user paths for the CityOS simulation:</p>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleRoleSwitch("citizen")}
                className="w-full py-2 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition-all"
              >
                Citizen Portal
              </button>
              <button
                onClick={() => handleRoleSwitch("authority")}
                className="w-full py-2 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition-all"
              >
                Authority Portal
              </button>
              <button
                onClick={() => handleRoleSwitch("admin")}
                className="w-full py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold transition-all"
              >
                Admin Portal
              </button>
            </div>
          </section>

          {/* Theme Settings (Demo Mode) */}
          <section className="bg-[#12192c] border border-slate-800/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-slate-300 border-b border-slate-800 pb-2">Theme Settings</h3>
            <p className="text-[10px] text-slate-500">Choose your visual appearance profile for the portal:</p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                onClick={() => setTheme("light")}
                className={`w-full py-2 rounded-xl font-bold transition-all border ${
                  theme === "light"
                    ? "bg-blue-600/25 border-blue-500/40 text-blue-400 font-semibold"
                    : "bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-200"
                }`}
              >
                ☀️ Light Mode
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`w-full py-2 rounded-xl font-bold transition-all border ${
                  theme === "dark"
                    ? "bg-blue-600/25 border-blue-500/40 text-blue-400 font-semibold"
                    : "bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-200"
                }`}
              >
                🌙 Dark Mode
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`w-full py-2 rounded-xl font-bold transition-all border ${
                  theme === "system"
                    ? "bg-blue-600/25 border-blue-500/40 text-blue-450 font-semibold"
                    : "bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-200"
                }`}
              >
                💻 System Default
              </button>
            </div>
          </section>
        </div>

        {/* Preferences Cards (col-span-8) */}
        <div className="col-span-12 md:col-span-8 space-y-6">
          {/* Notifications Card */}
          <section className="bg-[#12192c] border border-slate-800/50 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-slate-300 border-b border-slate-850 pb-2">Admin Alerts Configuration</h3>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200">System Outage Notifications</p>
                  <p className="text-[10px] text-slate-500">Notify immediately if any AI modules report error state.</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700 text-blue-600 w-4 h-4" />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-850">
                <div>
                  <p className="font-semibold text-slate-200">Critical Ward Vulnerability Alerts</p>
                  <p className="text-[10px] text-slate-500">Alert when any ward&apos;s vulnerability score exceeds 80.</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700 text-blue-600 w-4 h-4" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
