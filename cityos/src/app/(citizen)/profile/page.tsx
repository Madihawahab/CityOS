"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useReportsStore } from "@/store/reportsStore";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";

export default function ProfilePage() {
  const router = useRouter();
  const reports = useReportsStore((s) => s.reports);
  const logout = useAuthStore((s) => s.logout);
  const { isEditing, setIsEditing, error, updateProfile, user } = useProfileUpdate();

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

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Profile Card */}
        <section className="bg-white rounded-lg shadow-sm border border-outline-variant/30 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-surface-container shadow-sm bg-surface-container flex items-center justify-center">
              {user?.profilePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  className="w-full h-full object-cover" 
                  alt={user.fullName} 
                  src={user.profilePhoto} 
                />
              ) : (
                <span className="material-symbols-outlined text-6xl text-outline-variant">person</span>
              )}
            </div>
          </div>
          
          <div className="flex-grow text-center md:text-left space-y-4">
            {isEditing ? (
              <div className="space-y-3 max-w-md mx-auto md:mx-0">
                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-outline uppercase tracking-wider mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary outline-none"
                  />
                </div>
                {error && <p className="text-error text-xs font-bold">{error}</p>}
              </div>
            ) : (
              <div>
                <h1 className="text-headline-lg font-bold text-on-surface">{user?.fullName ?? "Priya Sharma"}</h1>
                <p className="text-on-surface-variant font-body-md text-body-md flex items-center justify-center md:justify-start gap-2 mt-1">
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">mail</span>
                  {user?.email ?? "priya@demo.cityos.in"}
                </p>
                <p className="text-on-surface-variant font-body-md text-body-md flex items-center justify-center md:justify-start gap-2 mt-1">
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">phone</span>
                  {phone || "Add phone number"}
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-center md:justify-start pt-2">
              <button 
                onClick={handleEditToggle}
                className="bg-primary text-white font-label-md text-label-md px-6 py-3 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-sm flex items-center gap-2 focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">edit</span>
                {isEditing ? "Save Changes" : "Edit Profile"}
              </button>
              {isEditing && (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="bg-white border border-outline text-on-surface font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-surface-low transition-all active:scale-95 focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Community Statistics */}
        <section className="space-y-4">
          <h2 className="font-title-lg text-title-lg font-bold text-on-surface px-2">Your Civic Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-outline-variant/30 border-l-4 border-l-primary">
              <span className="material-symbols-outlined text-primary mb-2" aria-hidden="true">report_problem</span>
              <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-bold">Issues Reported</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{reportedCount}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-outline-variant/30 border-l-4 border-l-secondary">
              <span className="material-symbols-outlined text-secondary mb-2" aria-hidden="true">thumb_up</span>
              <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-bold">Issues Supported</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{supportedCount}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-outline-variant/30 border-l-4 border-l-tertiary" style={{ borderLeftColor: "#784b00" }}>
              <span className="material-symbols-outlined text-tertiary mb-2" aria-hidden="true" style={{ color: "#784b00" }}>task_alt</span>
              <p className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider font-bold">Issues Resolved</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{resolvedCount}</p>
            </div>
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="bg-white rounded-lg shadow-sm border border-outline-variant/30 p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" aria-hidden="true">shield_person</span>
            <h2 className="font-title-lg text-title-lg font-bold text-on-surface">Privacy Settings</h2>
          </div>
          
          <div className="space-y-4">
            <label className="block font-label-md text-on-surface-variant font-bold">Default Reporting Mode</label>
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
                      ? "border-primary bg-primary/5 active-radio" 
                      : "border-outline-variant/50 hover:bg-surface-container-low"
                  }`}
                >
                  <input 
                    type="radio"
                    name="default_reporting"
                    checked={defaultPrivacy === opt.id}
                    onChange={() => setDefaultPrivacy(opt.id as "public" | "anonymous" | "community")}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <div className="ml-4 flex-grow cursor-pointer">
                    <span className="block font-label-md font-bold text-on-surface">{opt.title}</span>
                    <span className="text-xs text-on-surface-variant">{opt.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-on-surface-variant font-body-md text-body-md italic bg-surface-container p-4 rounded-lg flex items-start gap-3 border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-xl" aria-hidden="true">info</span>
              <p>
                Protected Anonymous keeps your identity hidden while CityOS securely verifies your report to prevent abuse.
              </p>
            </div>
          </div>
        </section>

        {/* Preferences & Support Links list */}
        <section className="bg-white rounded-lg shadow-sm border border-outline-variant/30 overflow-hidden divide-y divide-outline-variant/20">
          <div className="p-6">
            <h2 className="font-title-lg text-title-lg font-bold text-on-surface">Preferences &amp; Support</h2>
          </div>
          
          <button 
            onClick={() => router.push("/notifications")}
            className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors group focus:bg-surface-container-low focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors">notifications</span>
              <span className="font-body-lg text-body-lg text-on-surface font-medium">Notifications</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </button>

          <div className="w-full flex items-center justify-between p-4 group">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-on-surface-variant">language</span>
              <span className="font-body-lg text-body-lg text-on-surface font-medium">Language</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded">English</span>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </div>
          </div>

          <div className="w-full flex items-center justify-between p-4 group">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-on-surface-variant">accessibility</span>
              <span className="font-body-lg text-body-lg text-on-surface font-medium">Accessibility</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </div>

          <div className="w-full flex items-center justify-between p-4 group">
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-on-surface-variant">info</span>
              <span className="font-body-lg text-body-lg text-on-surface font-medium">About CityOS</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-error/5 transition-colors group focus:bg-error/5 focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-error">logout</span>
              <span className="font-body-lg text-body-lg text-error font-medium">Logout</span>
            </div>
          </button>
        </section>

      </main>
    </div>
  );
}
