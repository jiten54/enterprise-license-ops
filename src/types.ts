/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  IT_ADMIN = "IT_ADMIN",
  FINANCE_MANAGER = "FINANCE_MANAGER",
  DEPT_HEAD = "DEPT_HEAD"
}

export interface License {
  id: string;
  name: string;
  vendor: string;
  category: "Design" | "Development" | "Collaboration" | "Office";
  totalSeats: number;
  allocatedSeats: number;
  costPerSeatMonthly: number; // in USD
  renewalDate: string;
  status: "Active" | "Warning" | "Overused";
}

export interface LicenseUser {
  id: string;
  name: string;
  email: string;
  department: "Engineering" | "Design" | "Product" | "Sales" | "Marketing" | "HR";
  licenseId: string;
  licenseName: string;
  allocatedDate: string;
  lastActiveDate: string;
  inactiveDays: number;
  status: "Active" | "Inactive" | "Flagged";
}

export interface UsageLog {
  id: string;
  timestamp: string;
  licenseName: string;
  userName: string;
  department: string;
  action: "Login" | "FeatureUse" | "SessionStart" | "SessionEnd";
  concurrencyCount: number;
}

export interface AlertRule {
  id: string;
  licenseId: string;
  licenseName: string;
  thresholdPercentage: number; // e.g., 90%
  isActive: boolean;
}

export interface OveruseAlert {
  id: string;
  timestamp: string;
  licenseId: string;
  licenseName: string;
  allocated: number;
  total: number;
  severity: "high" | "warning";
  message: string;
  resolved: boolean;
}

export interface ReclaimRecord {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  licenseName: string;
  department: string;
  actionType: "Reclaimed" | "Notified";
  performedByRole: UserRole;
}

export interface DashboardStats {
  totalMonthlySpend: number;
  activeLicensesRatio: number;
  inactiveSeatsCount: number;
  totalConfiguredLicenses: number;
  potentialMonthlySavings: number;
}
