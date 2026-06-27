import type { User, UserRole } from "@/types";

export const mockUsers: User[] = [
  // ── Citizens ───────────────────────────────────────────────────────────────
  {
    userId: "demo-citizen-1",
    fullName: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    phone: "+91-98765-43210",
    role: "citizen",
    anonymousDefault: false,
    createdAt: new Date("2026-01-15"),
    lastLogin: new Date(),
  },
  {
    userId: "demo-citizen-2",
    fullName: "Arjun Mehta",
    email: "arjun.mehta@outlook.com",
    phone: "+91-87654-32109",
    role: "citizen",
    anonymousDefault: false,
    createdAt: new Date("2026-02-01"),
    lastLogin: new Date(Date.now() - 2 * 3600000),
  },
  {
    userId: "demo-citizen-3",
    fullName: "Sunita Patel",
    email: "sunita.patel@gmail.com",
    phone: "+91-76543-21098",
    role: "citizen",
    anonymousDefault: true, // Senior citizen, prefers privacy
    createdAt: new Date("2026-03-10"),
    lastLogin: new Date(Date.now() - 24 * 3600000),
  },
  // ── Authority Officers ─────────────────────────────────────────────────────
  {
    userId: "demo-authority-1",
    fullName: "Ramesh Kumar",
    email: "ramesh.kumar@bwssb.gov.in",
    phone: "+91-80-2222-3333",
    role: "authority",
    department: "BWSSB Water Works",
    anonymousDefault: false,
    createdAt: new Date("2026-01-01"),
    lastLogin: new Date(Date.now() - 1 * 3600000),
  },
  {
    userId: "demo-authority-2",
    fullName: "Anjali Singh",
    email: "anjali.singh@bbmp.gov.in",
    phone: "+91-80-2222-4444",
    role: "authority",
    department: "BBMP Roads & Infrastructure",
    anonymousDefault: false,
    createdAt: new Date("2026-01-01"),
    lastLogin: new Date(Date.now() - 3 * 3600000),
  },
  {
    userId: "demo-authority-3",
    fullName: "Vikram Rao",
    email: "vikram.rao@bbmp.gov.in",
    phone: "+91-80-2222-5555",
    role: "authority",
    department: "BBMP Sanitation",
    anonymousDefault: false,
    createdAt: new Date("2026-01-01"),
    lastLogin: new Date(Date.now() - 8 * 3600000),
  },
  // ── Admin ──────────────────────────────────────────────────────────────────
  {
    userId: "demo-admin-1",
    fullName: "Dr. Anand Krishnan",
    email: "anand.krishnan@bbmp.gov.in",
    phone: "+91-80-2222-1000",
    role: "admin",
    department: "BBMP — City Operations",
    anonymousDefault: false,
    createdAt: new Date("2026-01-01"),
    lastLogin: new Date(),
  },
];

export function getUserById(id: string): User | undefined {
  return mockUsers.find((u) => u.userId === id);
}

export function getUsersByRole(role: UserRole): User[] {
  return mockUsers.filter((u) => u.role === role);
}
