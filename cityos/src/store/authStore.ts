import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types";
import { demo } from "@/config/demo";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  // Demo mode helpers
  loginAsDemo: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({ user: null, isAuthenticated: false, isLoading: false }),

      loginAsDemo: (role: UserRole) => {
        const demoUserMap: Record<UserRole, User> = {
          citizen: {
            userId: demo.users.citizen.id,
            fullName: demo.users.citizen.name,
            email: demo.users.citizen.email,
            role: demo.users.citizen.role,
            phone: undefined,
            profilePhoto: demo.users.citizen.profilePhoto,
            anonymousDefault: false,
            createdAt: new Date("2026-01-01"),
            lastLogin: new Date(),
          },
          authority: {
            userId: demo.users.authority.id,
            fullName: demo.users.authority.name,
            email: demo.users.authority.email,
            role: demo.users.authority.role,
            phone: undefined,
            profilePhoto: demo.users.authority.profilePhoto,
            department: demo.users.authority.department,
            anonymousDefault: false,
            createdAt: new Date("2026-01-01"),
            lastLogin: new Date(),
          },
          admin: {
            userId: demo.users.admin.id,
            fullName: demo.users.admin.name,
            email: demo.users.admin.email,
            role: demo.users.admin.role,
            phone: undefined,
            profilePhoto: demo.users.admin.profilePhoto,
            anonymousDefault: false,
            createdAt: new Date("2026-01-01"),
            lastLogin: new Date(),
          },
        };
        const demoUser = demoUserMap[role];
        set({ user: demoUser, isAuthenticated: true, isLoading: false });
      },
    }),
    {
      name: "cityos-auth",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
