import type { Department } from "@/types";

export const mockDepartments: Department[] = [
  {
    departmentId: "bwssb-water",
    departmentName: "BWSSB Water Works",
    departmentHead: "Ramesh Kumar",
    email: "waterworks@bwssb.gov.in",
    phone: "1916",
    activeIssues: 23,
    resolvedIssues: 142,
    averageResolutionTime: 18,
    resolutionRate: 86,
  },
  {
    departmentId: "bbmp-roads",
    departmentName: "BBMP Roads & Infrastructure",
    departmentHead: "Anjali Singh",
    email: "roads@bbmp.gov.in",
    phone: "080-22221111",
    activeIssues: 45,
    resolvedIssues: 201,
    averageResolutionTime: 36,
    resolutionRate: 82,
  },
  {
    departmentId: "bescom",
    departmentName: "BESCOM Electricity",
    departmentHead: "Suresh Babu",
    email: "helpdesk@bescom.org",
    phone: "1912",
    activeIssues: 17,
    resolvedIssues: 178,
    averageResolutionTime: 8,
    resolutionRate: 91,
  },
  {
    departmentId: "bbmp-sanitation",
    departmentName: "BBMP Sanitation",
    departmentHead: "Vikram Rao",
    email: "sanitation@bbmp.gov.in",
    phone: "080-22222222",
    activeIssues: 31,
    resolvedIssues: 115,
    averageResolutionTime: 24,
    resolutionRate: 79,
  },
  {
    departmentId: "bwssb-drainage",
    departmentName: "BWSSB Drainage",
    departmentHead: "Meera Nair",
    email: "drainage@bwssb.gov.in",
    phone: "080-22223333",
    activeIssues: 12,
    resolvedIssues: 67,
    averageResolutionTime: 12,
    resolutionRate: 85,
  },
  {
    departmentId: "bbmp-parks",
    departmentName: "BBMP Parks",
    departmentHead: "Kavita Reddy",
    email: "parks@bbmp.gov.in",
    phone: "080-22224444",
    activeIssues: 8,
    resolvedIssues: 43,
    averageResolutionTime: 48,
    resolutionRate: 77,
  },
];

export function getDepartmentByName(name: string): Department | undefined {
  return mockDepartments.find((d) => d.departmentName === name);
}
