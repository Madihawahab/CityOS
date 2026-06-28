"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useReportsStore } from "@/store/reportsStore";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import { useAppStore } from "@/store/appStore";

export default function ProfilePage() {
  const router = useRouter();
  const reports = useReportsStore((s) => s.reports);
  const logout = useAuthStore((s) => s.logout);
  const loginAsDemo = useAuthStore((s) => s.loginAsDemo);
  const { isEditing, setIsEditing, error, updateProfile, user } = useProfileUpdate();
  
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  // Local state for profile form fields
  const [fullName, setFullName] = useState(user?.fullName ?? "Priya Sharma");
  const [email, setEmail] = useState(user?.email ?? "priya@demo.cityos.in");
  const [phone, setPhone] = useState(user?.phone ?? "+91 98765 43210");

  // Reporting mode preference (Public, Anonymous, Council)
  const [defaultPrivacy, setDefaultPrivacy] = useState<"public" | "anonymous" | "community">("anonymous");

  // Calculate statistics from reports cache
  const allReports = Object.values(reports);
  const userReports = allReports.filter((r) => r.citizenId === (user?.userId ?? "demo-citizen-1"));

  const reportedCount = userReports.length || 12;
  const resolvedCount = userReports.filter((r) => r.status === "resolved" || r.status === "closed").length || 9;
  const supportedCount = userReports.reduce((acc, curr) => acc + (curr.communitySupport ?? 0), 0) || 42;

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      updateProfile({ fullName, email, phone });
    } else {
      setIsEditing(true);
    }
  };

  const handleRoleSwitch = (role: "citizen" | "authority" | "admin") => {
    loginAsDemo(role);
    if (role === "citizen") router.push("/profile");
    else if (role === "authority") router.push("/authority");
    else if (role === "admin") router.push("/admin");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0F1C] pb-24 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Profile Card */}
        <section className="bg-white dark:bg-[#111827] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-sm bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
              {user?.profilePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  className="w-full h-full object-cover" 
                  alt={user.fullName} 
                  src={user.profilePhoto} 
                />
              ) : (
                <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-550">person</span>
              )}
            </div>
          </div>
          
          <div className="flex-grow text-center md:text-left space-y-4">
            {isEditing ? (
              <div className="space-y-3 max-w-md mx-auto md:mx-0">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-body-md bg-white dark:bg-[#1e293b] text-slate-900 dark:text-slate-100 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-body-md bg-white dark:bg-[#1e293b] text-slate-900 dark:text-slate-100 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 dark:border-slate-700 rounded-lg p-2 text-body-md bg-white dark:bg-[#1e293b] text-slate-900 dark:text-slate-100 focus:border-primary outline-none"
                  />
                </div>
                {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
              </div>
            ) : (
              <div>
                <h1 className="text-headline-lg font-bold text-slate-900 dark:text-white">{user?.fullName ?? "Priya Sharma"}</h1>
                <p className="text-slate-550 dark:text-slate-400 font-body-md text-body-md flex items-center justify-center md:justify-start gap-2 mt-1">
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">mail</span>
                  {user?.email ?? "priya@demo.cityos.in"}
                </p>
                <p className="text-slate-550 dark:text-slate-400 font-body-md text-body-md flex items-center justify-center md:justify-start gap-2 mt-1">
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">phone</span>
                  {phone || "Add phone number"}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-center md:justify-start pt-2">
              <button 
                onClick={handleEditToggle}
                className="bg-blue-600 text-white font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm flex items-center gap-2 focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">edit</span>
                {isEditing ? "Save Changes" : "Edit Profile"}
              </button>
              {isEditing && (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-750 text-slate-700 dark:text-slate-200 font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 focus:outline-none"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Community Statistics */}
        <section className="space-y-4">
          <h2 className="font-title-lg text-title-lg font-bold text-slate-900 dark:text-white px-2">Your Civic Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 border-l-4 border-l-blue-600">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 mb-2" aria-hidden="true">report_problem</span>
              <p className="text-slate-500 dark:text-slate-400 font-label-md text-label-md uppercase tracking-wider font-bold">Issues Reported</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{reportedCount}</p>
            </div>
            <div className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 border-l-4 border-l-emerald-600">
              <span className="material-symbols-outlined text-emerald-600 mb-2" aria-hidden="true">thumb_up</span>
              <p className="text-slate-500 dark:text-slate-400 font-label-md text-label-md uppercase tracking-wider font-bold">Issues Supported</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{supportedCount}</p>
            </div>
            <div className="bg-white dark:bg-[#111827] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-800 border-l-4 border-l-amber-600">
              <span className="material-symbols-outlined text-amber-600 mb-2" aria-hidden="true">task_alt</span>
              <p className="text-slate-500 dark:text-slate-400 font-label-md text-label-md uppercase tracking-wider font-bold">Issues Resolved</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{resolvedCount}</p>
            </div>
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="bg-white dark:bg-[#111827] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" aria-hidden="true">shield_person</span>
            <h2 className="font-title-lg text-title-lg font-bold text-slate-900 dark:text-white">Privacy Settings</h2>
          </div>
          
          <div className="space-y-4">
            <label className="block font-label-md text-slate-500 dark:text-slate-400 font-bold">Default Reporting Mode</label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { id: "public", title: "Public", desc: "Visible to all community members." },
                { id: "anonymous", title: "Protected Anonymous ⭐ Recommended", desc: "Identity hidden from the public, verified securely." },
                { id: "community", title: "Community Report", desc: "Direct report to local council representatives." }
              ].map((opt) => (
                <div 
                  key={opt.id}
                  onClick={() => setDefaultPrivacy(opt.id as "public" | "anonymous" | "community")}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-primary ${
                    defaultPrivacy === opt.id 
                      ? "border-blue-600 dark:border-blue-400 bg-blue-50/5 dark:bg-blue-900/10" 
                      : "border-gray-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <input 
                    type="radio"
                    name="default_reporting"
                    checked={defaultPrivacy === opt.id}
                    onChange={() => setDefaultPrivacy(opt.id as "public" | "anonymous" | "community")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-4 flex-grow cursor-pointer">
                    <span className="block font-label-md font-bold text-slate-900 dark:text-white">{opt.title}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-slate-600 dark:text-slate-400 font-body-md text-body-md italic bg-slate-50 dark:bg-slate-900 p-4 rounded-lg flex items-start gap-3 border border-gray-200 dark:border-slate-800">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl" aria-hidden="true">info</span>
              <p>
                Protected Anonymous keeps your identity hidden while CityOS securely verifies your report to prevent abuse.
              </p>
            </div>
          </div>
        </section>

        {/* Theme Settings (MD3 Styled) */}
        <section className="bg-white dark:bg-[#111827] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" aria-hidden="true">palette</span>
            <h2 className="font-title-lg text-title-lg font-bold text-slate-900 dark:text-white">Theme Settings</h2>
          </div>
          <p className="text-xs text-slate-550 dark:text-slate-400">Choose how CityOS looks on your device:</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 border ${
                theme === "light"
                  ? "bg-blue-600/10 border-blue-500/30 text-blue-600 dark:text-blue-450 font-semibold"
                  : "bg-transparent border-gray-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span>☀️</span> Light Mode
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 border ${
                theme === "dark"
                  ? "bg-blue-600/10 border-blue-500/30 text-blue-600 dark:text-blue-450 font-semibold"
                  : "bg-transparent border-gray-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span>🌙</span> Dark Mode
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 border ${
                theme === "system"
                  ? "bg-blue-600/10 border-blue-500/30 text-blue-600 dark:text-blue-450 font-semibold"
                  : "bg-transparent border-gray-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span>💻</span> System Default
            </button>
          </div>
        </section>

        {/* Portal Switcher (Demo Mode) */}
        <section className="bg-white dark:bg-[#111827] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" aria-hidden="true">swap_horiz</span>
            <h2 className="font-title-lg text-title-lg font-bold text-slate-900 dark:text-white">Portal Switcher (Demo Mode)</h2>
          </div>
          <p className="text-xs text-slate-550 dark:text-slate-400">Switch roles in real-time to view different user paths for the CityOS simulation:</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleRoleSwitch("citizen")}
              className="py-2.5 bg-blue-600 text-white border border-blue-600 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all active:scale-95"
            >
              Citizen Portal
            </button>
            <button
              onClick={() => handleRoleSwitch("authority")}
              className="py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
              Authority Portal
            </button>
            <button
              onClick={() => handleRoleSwitch("admin")}
              className="py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
              Admin Portal
            </button>
          </div>
        </section>

        {/* Preferences & Support Links list */}
        <section className="bg-white dark:bg-[#111827] rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden divide-y divide-gray-150 dark:divide-slate-800">
          <div className="p-6">
            <h2 className="font-title-lg text-title-lg font-bold text-slate-900 dark:text-white">Preferences &amp; Support</h2>
          </div>
          
          <button 
            onClick={() => router.push("/notifications")}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors group focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">notifications</span>
              <span className="font-body-lg text-body-lg text-slate-800 dark:text-slate-200 font-medium">Notifications</span>
            </div>
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">chevron_right</span>
          </button>

          <div className="w-full flex items-center justify-between p-4 group">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">language</span>
              <span className="font-body-lg text-body-lg text-slate-800 dark:text-slate-200 font-medium">Language</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-gray-200 dark:border-slate-800">English</span>
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">chevron_right</span>
            </div>
          </div>

          <div className="w-full flex items-center justify-between p-4 group">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">accessibility</span>
              <span className="font-body-lg text-body-lg text-slate-800 dark:text-slate-200 font-medium">Accessibility</span>
            </div>
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">chevron_right</span>
          </div>

          <div className="w-full flex items-center justify-between p-4 group">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">info</span>
              <span className="font-body-lg text-body-lg text-slate-800 dark:text-slate-200 font-medium">About CityOS</span>
            </div>
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">chevron_right</span>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-red-650">logout</span>
              <span className="font-body-lg text-body-lg text-red-650 font-medium">Logout</span>
            </div>
          </button>
        </section>

      </main>
    </div>
  );
}
