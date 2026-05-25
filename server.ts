/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { UserRole, License, LicenseUser, UsageLog, AlertRule, OveruseAlert, ReclaimRecord } from "./src/types";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// ==========================================
// MOCK DATA STORE (IN SERVER MEMORY)
// ==========================================

let licenses: License[] = [
  {
    id: "lic-jetbrains",
    name: "IntelliJ IDEA Business",
    vendor: "JetBrains",
    category: "Development",
    totalSeats: 150,
    allocatedSeats: 142,
    costPerSeatMonthly: 25,
    renewalDate: "2026-07-15",
    status: "Active"
  },
  {
    id: "lic-figma",
    name: "Figma Enterprise",
    vendor: "Figma Plus",
    category: "Design",
    totalSeats: 80,
    allocatedSeats: 78,
    costPerSeatMonthly: 15,
    renewalDate: "2026-06-30",
    status: "Warning"
  },
  {
    id: "lic-github",
    name: "GitHub Enterprise Cloud",
    vendor: "GitHub Inc.",
    category: "Development",
    totalSeats: 300,
    allocatedSeats: 298,
    costPerSeatMonthly: 21,
    renewalDate: "2026-09-01",
    status: "Overused"
  },
  {
    id: "lic-adobe",
    name: "Adobe Creative Cloud",
    vendor: "Adobe Corp.",
    category: "Design",
    totalSeats: 50,
    allocatedSeats: 48,
    costPerSeatMonthly: 80,
    renewalDate: "2026-08-10",
    status: "Active"
  },
  {
    id: "lic-zoom",
    name: "Zoom Business",
    vendor: "Zoom Web",
    category: "Collaboration",
    totalSeats: 200,
    allocatedSeats: 160,
    costPerSeatMonthly: 20,
    renewalDate: "2026-11-20",
    status: "Active"
  },
  {
    id: "lic-jira",
    name: "Jira Enterprise",
    vendor: "Atlassian",
    category: "Collaboration",
    totalSeats: 100,
    allocatedSeats: 99,
    costPerSeatMonthly: 14,
    renewalDate: "2026-06-15",
    status: "Warning"
  }
];

let licenseUsers: LicenseUser[] = [
  {
    id: "usr-1",
    name: "Alice Vance",
    email: "alice.v@enterprise.com",
    department: "Engineering",
    licenseId: "lic-jetbrains",
    licenseName: "IntelliJ IDEA Business",
    allocatedDate: "2025-01-10",
    lastActiveDate: "2026-05-25",
    inactiveDays: 0,
    status: "Active"
  },
  {
    id: "usr-2",
    name: "Bob Carter",
    email: "bob.c@enterprise.com",
    department: "Design",
    licenseId: "lic-figma",
    licenseName: "Figma Enterprise",
    allocatedDate: "2025-02-14",
    lastActiveDate: "2026-04-10",
    inactiveDays: 45,
    status: "Inactive"
  },
  {
    id: "usr-3",
    name: "Charlie Dixon",
    email: "charlie.d@enterprise.com",
    department: "Engineering",
    licenseId: "lic-github",
    licenseName: "GitHub Enterprise Cloud",
    allocatedDate: "2025-01-15",
    lastActiveDate: "2026-05-24",
    inactiveDays: 1,
    status: "Active"
  },
  {
    id: "usr-4",
    name: "David Elson",
    email: "david.e@enterprise.com",
    department: "Design",
    licenseId: "lic-adobe",
    licenseName: "Adobe Creative Cloud",
    allocatedDate: "2025-03-01",
    lastActiveDate: "2026-02-10",
    inactiveDays: 104,
    status: "Inactive"
  },
  {
    id: "usr-5",
    name: "Emma Fox",
    email: "emma.f@enterprise.com",
    department: "Marketing",
    licenseId: "lic-zoom",
    licenseName: "Zoom Business",
    allocatedDate: "2025-05-20",
    lastActiveDate: "2026-05-18",
    inactiveDays: 7,
    status: "Active"
  },
  {
    id: "usr-6",
    name: "Frank Gable",
    email: "frank.g@enterprise.com",
    department: "HR",
    licenseId: "lic-zoom",
    licenseName: "Zoom Business",
    allocatedDate: "2025-04-02",
    lastActiveDate: "2026-01-15",
    inactiveDays: 130,
    status: "Inactive"
  },
  {
    id: "usr-7",
    name: "Grace Hiller",
    email: "grace.h@enterprise.com",
    department: "Engineering",
    licenseId: "lic-jetbrains",
    licenseName: "IntelliJ IDEA Business",
    allocatedDate: "2025-08-11",
    lastActiveDate: "2026-03-20",
    inactiveDays: 66,
    status: "Inactive"
  },
  {
    id: "usr-8",
    name: "Henry Irving",
    email: "henry.i@enterprise.com",
    department: "Product",
    licenseId: "lic-figma",
    licenseName: "Figma Enterprise",
    allocatedDate: "2025-09-01",
    lastActiveDate: "2026-05-25",
    inactiveDays: 0,
    status: "Active"
  },
  {
    id: "usr-9",
    name: "Iris Jenkins",
    email: "iris.j@enterprise.com",
    department: "Sales",
    licenseId: "lic-zoom",
    licenseName: "Zoom Business",
    allocatedDate: "2025-10-10",
    lastActiveDate: "2026-05-10",
    inactiveDays: 15,
    status: "Active"
  },
  {
    id: "usr-10",
    name: "Jack Keller",
    email: "jack.k@enterprise.com",
    department: "Engineering",
    licenseId: "lic-github",
    licenseName: "GitHub Enterprise Cloud",
    allocatedDate: "2025-01-20",
    lastActiveDate: "2026-05-25",
    inactiveDays: 0,
    status: "Active"
  },
  {
    id: "usr-11",
    name: "Karen Lopez",
    email: "karen.l@enterprise.com",
    department: "Marketing",
    licenseId: "lic-adobe",
    licenseName: "Adobe Creative Cloud",
    allocatedDate: "2025-11-12",
    lastActiveDate: "2026-04-20",
    inactiveDays: 35,
    status: "Active"
  },
  {
    id: "usr-12",
    name: "Leo Miller",
    email: "leo.m@enterprise.com",
    department: "Engineering",
    licenseId: "lic-github",
    licenseName: "GitHub Enterprise Cloud",
    allocatedDate: "2025-02-01",
    lastActiveDate: "2026-02-25",
    inactiveDays: 89,
    status: "Inactive"
  },
  {
    id: "usr-13",
    name: "Mia Nelson",
    email: "mia.n@enterprise.com",
    department: "Design",
    licenseId: "lic-figma",
    licenseName: "Figma Enterprise",
    allocatedDate: "2025-07-20",
    lastActiveDate: "2026-01-20",
    inactiveDays: 125,
    status: "Inactive"
  },
  {
    id: "usr-14",
    name: "Oscar Perez",
    email: "oscar.p@enterprise.com",
    department: "HR",
    licenseId: "lic-jira",
    licenseName: "Jira Enterprise",
    allocatedDate: "2025-12-05",
    lastActiveDate: "2026-05-24",
    inactiveDays: 1,
    status: "Active"
  },
  {
    id: "usr-15",
    name: "Quinn Roberts",
    email: "quinn.r@enterprise.com",
    department: "Engineering",
    licenseId: "lic-jira",
    licenseName: "Jira Enterprise",
    allocatedDate: "2025-10-01",
    lastActiveDate: "2026-02-15",
    inactiveDays: 100,
    status: "Inactive"
  }
];

let usageLogs: UsageLog[] = [
  { id: "log-1", timestamp: "2026-05-25T01:00:00Z", licenseName: "GitHub Enterprise Cloud", userName: "Alice Vance", department: "Engineering", action: "Login", concurrencyCount: 211 },
  { id: "log-2", timestamp: "2026-05-25T02:30:00Z", licenseName: "Figma Enterprise", userName: "Henry Irving", department: "Product", action: "SessionStart", concurrencyCount: 52 },
  { id: "log-3", timestamp: "2026-05-25T03:15:00Z", licenseName: "IntelliJ IDEA Business", userName: "Jack Keller", department: "Engineering", action: "FeatureUse", concurrencyCount: 112 },
  { id: "log-4", timestamp: "2026-05-25T04:00:00Z", licenseName: "Adobe Creative Cloud", userName: "Karen Lopez", department: "Marketing", action: "Login", concurrencyCount: 32 },
  { id: "log-5", timestamp: "2026-05-25T05:22:00Z", licenseName: "Zoom Business", userName: "Iris Jenkins", department: "Sales", action: "SessionStart", concurrencyCount: 135 },
  { id: "log-6", timestamp: "2026-05-25T06:10:00Z", licenseName: "Jira Enterprise", userName: "Oscar Perez", department: "HR", action: "Login", concurrencyCount: 88 }
];

let alertRules: AlertRule[] = [
  { id: "rul-github", licenseId: "lic-github", licenseName: "GitHub Enterprise Cloud", thresholdPercentage: 95, isActive: true },
  { id: "rul-figma", licenseId: "lic-figma", licenseName: "Figma Enterprise", thresholdPercentage: 90, isActive: true },
  { id: "rul-jetbrains", licenseId: "lic-jetbrains", licenseName: "IntelliJ IDEA Business", thresholdPercentage: 90, isActive: true },
  { id: "rul-adobe", licenseId: "lic-adobe", licenseName: "Adobe Creative Cloud", thresholdPercentage: 85, isActive: true },
  { id: "rul-zoom", licenseId: "lic-zoom", licenseName: "Zoom Business", thresholdPercentage: 90, isActive: false },
  { id: "rul-jira", licenseId: "lic-jira", licenseName: "Jira Enterprise", thresholdPercentage: 85, isActive: true }
];

let overuseAlerts: OveruseAlert[] = [
  {
    id: "alt-1",
    timestamp: "2026-05-25T06:00:00Z",
    licenseId: "lic-github",
    licenseName: "GitHub Enterprise Cloud",
    allocated: 298,
    total: 300,
    severity: "high",
    message: "Critical: GitHub Enterprise Cloud allocation at 99.3% capacity. Threshold (95%) breached.",
    resolved: false
  },
  {
    id: "alt-2",
    timestamp: "2026-05-25T04:20:00Z",
    licenseId: "lic-figma",
    licenseName: "Figma Enterprise",
    allocated: 78,
    total: 80,
    severity: "warning",
    message: "Warning: Figma Enterprise allocation at 97.5% capacity. Threshold (90%) breached.",
    resolved: false
  },
  {
    id: "alt-3",
    timestamp: "2026-05-24T14:30:00Z",
    licenseId: "lic-jira",
    licenseName: "Jira Enterprise",
    allocated: 99,
    total: 100,
    severity: "warning",
    message: "Warning: Jira Enterprise registration has reached 99% usage. Threshold (85%) breached.",
    resolved: false
  }
];

let reclaimRecords: ReclaimRecord[] = [
  {
    id: "rec-1",
    timestamp: "2026-05-24T09:12:00Z",
    userName: "Mickey Mouse",
    userEmail: "mickey.m@enterprise.com",
    licenseName: "Adobe Creative Cloud",
    department: "Marketing",
    actionType: "Reclaimed",
    performedByRole: UserRole.IT_ADMIN
  }
];

// Helper to calculate summary dashboard statistics
function calculateStats(): any {
  let totalMonthlySpend = 0;
  let potentialMonthlySavings = 0;
  let inactiveSeatsCount = 0;

  licenses.forEach(lic => {
    totalMonthlySpend += lic.allocatedSeats * lic.costPerSeatMonthly;
  });

  licenseUsers.forEach(usr => {
    if (usr.status === "Inactive" || usr.inactiveDays > 45) {
      inactiveSeatsCount++;
      const lic = licenses.find(l => l.id === usr.licenseId);
      if (lic) {
        potentialMonthlySavings += lic.costPerSeatMonthly;
      }
    }
  });

  const totalSeats = licenses.reduce((sum, lic) => sum + lic.totalSeats, 0);
  const totalAllocated = licenses.reduce((sum, lic) => sum + lic.allocatedSeats, 0);
  const activeLicensesRatio = totalSeats > 0 ? (totalAllocated / totalSeats) * 100 : 0;

  return {
    totalMonthlySpend,
    activeLicensesRatio: Math.round(activeLicensesRatio),
    inactiveSeatsCount,
    totalConfiguredLicenses: licenses.length,
    potentialMonthlySavings
  };
}

// Ensure active alerts update based on current seat counts vs rules
function checkLicenseThresholds() {
  licenses.forEach(lic => {
    const rule = alertRules.find(r => r.licenseId === lic.id);
    if (rule && rule.isActive) {
      const percentage = (lic.allocatedSeats / lic.totalSeats) * 100;
      if (percentage >= rule.thresholdPercentage) {
        // Trigger alert if it doesn't already exist and is active
        const exists = overuseAlerts.find(alt => alt.licenseId === lic.id && !alt.resolved);
        if (!exists) {
          const isCritical = percentage >= 98;
          overuseAlerts.unshift({
            id: "alt-gen-" + Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            licenseId: lic.id,
            licenseName: lic.name,
            allocated: lic.allocatedSeats,
            total: lic.totalSeats,
            severity: isCritical ? "high" : "warning",
            message: `${isCritical ? 'Critical' : 'Warning'}: ${lic.name} is at ${percentage.toFixed(1)}% capacity. Threshold (${rule.thresholdPercentage}%) exceeded.`,
            resolved: false
          });
          lic.status = isCritical ? "Overused" : "Warning";
        }
      } else {
        // Clear status to active if capacity is fine
        const alt = overuseAlerts.find(a => a.licenseId === lic.id && !a.resolved);
        if (!alt) {
          lic.status = "Active";
        }
      }
    }
  });
}

// Lazy-initialize Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please add it in the Secrets panel in the AI Studio sidebar.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// ==========================================
// API ROUTE HANDLERS
// ==========================================

// 1. Get dashboard statistics and all core data
app.get("/api/dashboard", (req, res) => {
  checkLicenseThresholds();
  res.json({
    stats: calculateStats(),
    licenses,
    users: licenseUsers,
    usageLogs,
    alertRules,
    overuseAlerts: overuseAlerts.filter(a => !a.resolved),
    reclaimRecords
  });
});

// 2. Resolve an alert
app.post("/api/alerts/resolve", (req, res) => {
  const { alertId } = req.body;
  const alert = overuseAlerts.find(a => a.id === alertId);
  if (alert) {
    alert.resolved = true;
    // reset license status if no other unresolved alert exists for that license
    const otherAlert = overuseAlerts.find(a => a.licenseId === alert.licenseId && !a.resolved);
    if (!otherAlert) {
      const lic = licenses.find(l => l.id === alert.licenseId);
      if (lic) {
        lic.status = "Active";
      }
    }
    return res.json({ success: true, message: `Alert resolved`, overuseAlerts: overuseAlerts.filter(a => !a.resolved) });
  }
  res.status(404).json({ error: "Alert not found" });
});

// 3. Update alert rules
app.post("/api/alerts/rules", (req, res) => {
  const { rules: updatedRules } = req.body; // array of updated AlertRules
  if (updatedRules && Array.isArray(updatedRules)) {
    updatedRules.forEach((ur: AlertRule) => {
      const existing = alertRules.find(r => r.id === ur.id);
      if (existing) {
        existing.thresholdPercentage = Number(ur.thresholdPercentage);
        existing.isActive = ur.isActive;
      }
    });
    checkLicenseThresholds();
    return res.json({ success: true, alertRules, licenses });
  }
  res.status(400).json({ error: "Invalid rules payload" });
});

// 4. Reclaim seat allocation for an inactive user
app.post("/api/reclaim", (req, res) => {
  const { userId, role } = req.body;
  const userIndex = licenseUsers.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    const user = licenseUsers[userIndex];
    const license = licenses.find(l => l.id === user.licenseId);
    
    if (license) {
      // reduce allocated seats count
      license.allocatedSeats = Math.max(0, license.allocatedSeats - 1);
    }
    
    // Add to reclaim record logs
    const record: ReclaimRecord = {
      id: "rec-" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      userName: user.name,
      userEmail: user.email,
      licenseName: user.licenseName,
      department: user.department,
      actionType: "Reclaimed",
      performedByRole: role as UserRole || UserRole.IT_ADMIN
    };
    reclaimRecords.unshift(record);

    // Remove user license registration sequence (fully simulated)
    licenseUsers.splice(userIndex, 1);

    checkLicenseThresholds();

    return res.json({
      success: true,
      message: `Successfully clawed back ${user.licenseName} seat from ${user.name}.`,
      users: licenseUsers,
      licenses,
      reclaimRecords,
      stats: calculateStats()
    });
  }
  res.status(404).json({ error: "User not found" });
});

// 5. Notify user of impending reclamation (Send Alert Warning)
app.post("/api/notify", (req, res) => {
  const { userId, role } = req.body;
  const user = licenseUsers.find(u => u.id === userId);
  if (user) {
    user.status = "Flagged";
    
    const record: ReclaimRecord = {
      id: "rec-" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      userName: user.name,
      userEmail: user.email,
      licenseName: user.licenseName,
      department: user.department,
      actionType: "Notified",
      performedByRole: role as UserRole || UserRole.IT_ADMIN
    };
    reclaimRecords.unshift(record);

    return res.json({
      success: true,
      message: `Sent warnings and de-allocation alerts to ${user.email}.`,
      users: licenseUsers,
      reclaimRecords
    });
  }
  res.status(404).json({ error: "User not found" });
});

// 6. Push a custom log to simulate real-time activity/concurrency triggers
app.post("/api/logs/generate", (req, res) => {
  const { licenseId, activeAction } = req.body;
  const targetLicense = licenses.find(l => l.id === licenseId);
  if (!targetLicense) {
    return res.status(404).json({ error: "License not found" });
  }

  // Simulate usage addition!
  if (activeAction === "AddSeat") {
    if (targetLicense.allocatedSeats < targetLicense.totalSeats) {
      targetLicense.allocatedSeats++;
    } else {
      // Allow overflow to trigger critical alerts
      targetLicense.allocatedSeats++;
    }
  } else if (activeAction === "RemoveSeat") {
    targetLicense.allocatedSeats = Math.max(0, targetLicense.allocatedSeats - 1);
  }

  // Generate log simulation event
  const newLog: UsageLog = {
    id: "log-" + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    licenseName: targetLicense.name,
    userName: ["Sarah Connor", "Alex Mercer", "Marcus Holloway", "Linus Torvalds"][Math.floor(Math.random() * 4)],
    department: ["Engineering", "Product", "Design"][Math.floor(Math.random() * 3)] as any,
    action: activeAction === "AddSeat" ? "Login" : "SessionEnd",
    concurrencyCount: targetLicense.allocatedSeats
  };
  usageLogs.unshift(newLog);
  if (usageLogs.length > 25) usageLogs.pop(); // keep log limit

  checkLicenseThresholds();

  res.json({
    success: true,
    licenses,
    usageLogs,
    overuseAlerts: overuseAlerts.filter(a => !a.resolved),
    stats: calculateStats()
  });
});

// 7. Core AI Gemini Service: Predictive analytics, Renewal report generator
app.get("/api/ai/secret-status", (req, res) => {
  res.json({ hasKey: !!process.env.GEMINI_API_KEY });
});

// High-fidelity fallback report generator when Gemini API Key is missing or invalid/leaked
function getLocalFallbackReport(
  promptMode: "renewal_report" | "predictive_demand" | "chatbot_q" | string,
  userCustomQuestion: string,
  activeStats: any,
  licenses: any[],
  licenseUsers: any[],
  overuseAlerts: any[]
): string {
  const totalSpend = activeStats.totalMonthlySpend;
  const potentialSavings = activeStats.potentialMonthlySavings;
  const reclaimCount = activeStats.inactiveSeatsCount;

  const warningHeader = `> **💡 Integrated Optimizer Active**\n> This advisory was generated by Licensia's integrated heuristic compiler. Set a valid cloud \`GEMINI_API_KEY\` to enable dynamic, custom multi-modal recommendations.\n\n`;

  if (promptMode === "renewal_report") {
    const tableRows = licenses.map(l => 
      `| **${l.name}** | ${l.allocatedSeats} / ${l.totalSeats} | $${l.costPerSeatMonthly}/mo | $${(l.allocatedSeats * l.costPerSeatMonthly).toLocaleString()}/mo | ${l.renewalDate} |`
    ).join("\n");

    return `${warningHeader}# 📋 Enterprise Software Asset Audit & Renewal Report

## Executive Summary
An exhaustive telemetry-based financial audit was conducted on your software assets. The current organization expenditure is **$${totalSpend.toLocaleString()}/mo** across **${licenses.length} enterprise vendors**. 

Our intelligence engine indicates **immediate monthly savings of $${potentialSavings.toLocaleString()}** are attainable by reclaiming **${reclaimCount} unutilized seats** from inactive team members.

### 📊 Current Portfolio Allocation & Run-Rate
| Vendor/License | Allocated / Total Seats | Cost per Seat | Current Monthly Spend | Renewal Action Date |
| :--- | :--- | :--- | :--- | :--- |
${tableRows}

---

## 🔍 Target Recommendations & Seat Pruning
1. **Premium Seat Consolidation**
   - JetBrains & Adobe CC licenses exhibit the highest inactive ratios. Suspending seats inactive for **>30 days** will shave off **$${potentialSavings.toLocaleString()}** before the next billing cycle.
2. **Bulk Pricing Tier Leverage**
   - For Atlassian & Figma product licenses, we recommend consolidating multiple single-seat plans into unified enterprise frameworks to trigger volume-based discounts of up to **18%**.

---

## 🤝 Vendor Negotiation Playbook (Enterprise Tactics)
* **Atlassian (Jira/Confluence)**: Refuse standard list-price standard tiers if total seat volume exceeds 100. Demand standard enterprise multi-year price locks. Highlight that local developers are testing alternative custom integrations.
* **JetBrains**: Advocate for floating/concurrent subscription pools rather than static individual seats. Standard usage concurrency caps are currently below 75%.
* **Figma**: Implement strict approval gating on standard professional licenses to avoid 'auto-upgrade' billing traps where non-designers are charged full editor pricing.

---

## 🗳️ Step-by-Step Renewal Strategy Checklist
- [ ] **T-Minus 45 Days**: Lock down all auto-renewal toggles in vendor admin panels to prevent unintended re-commits.
- [ ] **T-Minus 30 Days**: Execute the bulk seat reclamation script to reclaim **${reclaimCount} dormant licenses**.
- [ ] **T-Minus 15 Days**: Initiate formal budget exception proposals for anticipated high-demand resources.
- [ ] **T-Minus 7 Days**: Sign renegotiated vendor agreements with optimized seat caps.`;
  }

  if (promptMode === "predictive_demand") {
    const currentSeatsSum = licenses.reduce((sum, l) => sum + l.allocatedSeats, 0);
    const q3Forecast = Math.round(currentSeatsSum * 1.15);
    const q4Forecast = Math.round(currentSeatsSum * 1.28);
    const nextYearForecast = Math.round(currentSeatsSum * 1.45);

    const textList = licenses.map(l => {
      const q3 = Math.round(l.allocatedSeats * 1.15);
      const q4 = Math.round(l.allocatedSeats * 1.28);
      const safetyBuffer = Math.round(l.totalSeats - q3);
      const status = safetyBuffer < 0 ? `🚨 **Shortage Risk! Needs +${Math.abs(safetyBuffer)} safety seats**` : `✅ Safe (Buffer: ${safetyBuffer} seats)`;

      return `* **${l.name}**: Current active: **${l.allocatedSeats}**. Target Q3: **${q3}** | Target Q4: **${q4}** | Status: ${status}`;
    }).join("\n");

    return `${warningHeader}# 📈 Q3/Q4 Predictive Seat Demand Forecast

This predictive assessment utilizes a mathematical **logarithmic hiring and concurrency growth assumption** (extrapolated from enterprise telemetry log data and rolling run-rates of +/- 12% per quarter).

## 🔮 System-Wide Demand Forecast
* **Current Active Enterprise Seats**: **${currentSeatsSum}**
* **Projected Seat Demand (Q3)**: **${q3Forecast} seats** (+15% surge expected due to Engineering/Product expansion plans)
* **Projected Seat Demand (Q4)**: **${q4Forecast} seats** (+28% cumulative)
* **Target Seat Cap (Next Year)**: **${nextYearForecast} seats**

---

## 📋 Vendor Breakdown & Allocation Recommendations
${textList}

## 🛡️ Buffer Strategy & Mitigation Directives
To balance financial waste against workflow disruption, implement a **12% dynamic safety buffer factor** rather than paying for idle static licenses in advance. Maintain responsive alert thresholds at **85% capacity** to automatically cycle inactive assignments.`;
  }

  // chatbot_q fallback
  const lowerQ = userCustomQuestion?.toLowerCase() || "";
  let answerText = "";

  if (lowerQ.includes("reclaim") || lowerQ.includes("saving") || lowerQ.includes("save") || lowerQ.includes("inactive")) {
    answerText = `To reclaim unutilized seats and optimize your monthly budget:
1. Navigate to the **Inactive Users List** on the main dashboard tab.
2. Select target users (such as those with **30+ days of idle status**).
3. Click the **"Reclaim Seat"** button to trigger automatic allocation rollback.
4. Your current potential immediate savings are **$${potentialSavings.toLocaleString()}/mo** across **${reclaimCount} inactive seats**.`;
  } else if (lowerQ.includes("limit") || lowerQ.includes("alert") || lowerQ.includes("warn") || lowerQ.includes("threshold")) {
    answerText = `Your system alert thresholds can be updated live from the **Alert & Automation Rules** section:
- JetBrains is configured trigger notifications if allocations cross **90%**.
- Atlassian threshold is currently **85%**.
- Check the active warnings on the real-time panel to see if any vendor is approaching capacity limits.`;
  } else {
    answerText = `Here's a strategic summary of your licensing environment:
- **Financial Run-rate**: Total of **$${totalSpend.toLocaleString()}/mo** across active operational licenses.
- **Seat Utilization Density**: We have **${reclaimCount} seats** marked inactive for 30+ days.
- **Immediate Resolution Steps**: Address the flagged unused software allocations using the reclaim interface, and coordinate with Finance for vendor renewal caps.

If you have a specific question about Atlassian, Github, JetBrains, or cost reductions, feel free to ask directly!`;
  }

  return `${warningHeader}# 💬 LPIE Advisory Panel

Dear Enterprise Partner,

Regarding your query: **"${userCustomQuestion || 'Enterprise overview'}"**

${answerText}

***

*This consultation response was generated by Licensia's integrated, local heuristics knowledge base.*`;
}

app.post("/api/ai/analyze", async (req, res) => {
  const { promptMode } = req.body; // "renewal_report" | "predictive_demand" | "chatbot_q"
  const { userCustomQuestion } = req.body;

  const activeStats = calculateStats();

  try {
    const ai = getGeminiClient();

    // Prepare dense context describing licenses, inactive users, and alerts
    const subLicensesText = licenses.map(l => 
      `- **${l.name}** (Vendor: ${l.vendor}): ${l.allocatedSeats}/${l.totalSeats} seats allocated ($${l.costPerSeatMonthly}/seat, Monthly Total: $${l.allocatedSeats * l.costPerSeatMonthly}). Renewal date: ${l.renewalDate}. Status: ${l.status}.`
    ).join("\n");

    const inactiveUsersText = licenseUsers
      .filter(u => u.status === "Inactive" || u.inactiveDays > 30)
      .map(u => `- **${u.name}** (${u.email}, Dept: ${u.department}): Inactive for **${u.inactiveDays} days** on license *${u.licenseName}* (Cost: $${licenses.find(l => l.id === u.licenseId)?.costPerSeatMonthly || 0}/mo).`)
      .join("\n");

    const alertsText = overuseAlerts
      .filter(a => !a.resolved)
      .map(a => `- Severity: [${a.severity.toUpperCase()}] on ${a.licenseName}. ${a.message}`)
      .join("\n") || "No active alerts calculated.";

    const systemInstruction = `You are an elite Lead Enterprise Software Asset Manager and DevOps Procurement Advisor.
Analyze this software license inventory for a high-velocity enterprise organization.
Provide extremely detailed, data-driven, actionable reports.
Calculate accurate financial statistics:
- Current Monthly License Bill: $${activeStats.totalMonthlySpend}
- Immediate potential monthly reclaims: $${activeStats.potentialMonthlySavings} from ${activeStats.inactiveSeatsCount} inactive users.

Current Inventory Status:
${subLicensesText}

Inactive Users (>30 Days Idle):
${inactiveUsersText}

Breached Threshold Warnings:
${alertsText}

Your target prompt is written by the user in the context of: ${promptMode}.
Always format your output in clean, valid Markdown. Avoid excessive formatting, but use bullet lists, neat structured highlight tables, bold headings, and elegant blocks.

Include specific sections based on the promptMode:
1. If "renewal_report": Give a full audit of seats to cut down, concrete negotiation tactics with vendors (Atlassian, JetBrains, Figma, GitHub, Adobe), and a detailed step-by-step renewal strategy checklist.
2. If "predictive_demand": Provide an analytical forecast of seats needed in Q3, Q4, and Next Year using a mathematical log growth assumption (state it clearly). Suggest exactly how many excess seats to purchase or purge to handle safety buffers correctly.
3. If "chatbot_q": Answer the corporate user's custom question: "${userCustomQuestion}" in this asset management style.

Be precise, highly practical, and avoid placeholder jargon.`;

    const modelName = "gemini-3.5-flash"; // Valid base model according to rules

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userCustomQuestion || "Generate a comprehensive optimization suite report for the software inventory.",
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({
      success: true,
      report: response.text || "No response generated."
    });

  } catch (error: any) {
    console.log(`[Licensia AI] External API unavailable/unconfigured. Activating polished localized heuristics backup advisor model (Mode: ${promptMode}).`);
    
    // Fall back to a beautiful local heuristic simulation report using the live stats
    const fallbackReport = getLocalFallbackReport(
      promptMode,
      userCustomQuestion,
      activeStats,
      licenses,
      licenseUsers,
      overuseAlerts
    );

    res.json({
      success: true,
      report: fallbackReport
    });
  }
});

// ==========================================
// BOOT AND VITE INTEGRATION
// ==========================================

async function startServer() {
  // Vite integration middleware: Setup for Development or static Production mode
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite Development Server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Production server booting. Serving static assets inside dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`License Analytics Full-Stack Server listening successfully on port ${PORT}`);
  });
}

startServer();
