/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  UserRole, 
  License, 
  LicenseUser, 
  UsageLog, 
  AlertRule, 
  OveruseAlert, 
  ReclaimRecord, 
  DashboardStats 
} from "./types";
import { KPICards } from "./components/KPICards";
import { ChartsView } from "./components/ChartsView";
import { ReclaimFinder } from "./components/ReclaimFinder";
import { AiPlanner } from "./components/AiPlanner";
import { ConfigRules } from "./components/ConfigRules";
import { 
  Database, 
  ShieldAlert, 
  RefreshCw, 
  AlertTriangle, 
  FileText, 
  Users, 
  Cpu, 
  Clock, 
  PlusCircle, 
  MinusCircle, 
  LifeBuoy
} from "lucide-react";

export default function App() {
  // Global dashboard states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [users, setUsers] = useState<LicenseUser[]>([]);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [overuseAlerts, setOveruseAlerts] = useState<OveruseAlert[]>([]);
  const [reclaimRecords, setReclaimRecords] = useState<ReclaimRecord[]>([]);
  
  // App parameters
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.IT_ADMIN);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [simulatorLicenseId, setSimulatorLicenseId] = useState<string>("lic-github");

  // Fetch initial dashboard bundle
  const loadDashboardData = async () => {
    try {
      const resp = await fetch("/api/dashboard");
      const data = await resp.json();
      if (resp.ok) {
        setStats(data.stats);
        setLicenses(data.licenses);
        setUsers(data.users);
        setUsageLogs(data.usageLogs);
        setAlertRules(data.alertRules);
        setOveruseAlerts(data.overuseAlerts);
        setReclaimRecords(data.reclaimRecords);
      }
    } catch (err) {
      console.error("Could not fetch dashboard bundle:", err);
    }
  };

  // Check Gemini API status
  const checkApiKeyStatus = async () => {
    try {
      const resp = await fetch("/api/ai/secret-status");
      const data = await resp.json();
      setHasApiKey(data.hasKey);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadDashboardData(), checkApiKeyStatus()]);
      setLoading(false);
    };
    init();
  }, []);

  // --- ACTIONS ---

  // Reclaim seat handler
  const handleReclaim = async (userId: string) => {
    try {
      const resp = await fetch("/api/reclaim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: currentRole })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setUsers(data.users);
        setLicenses(data.licenses);
        setReclaimRecords(data.reclaimRecords);
        setStats(data.stats);
        // refresh alerts too
        await loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Notify user handler
  const handleNotify = async (userId: string) => {
    try {
      const resp = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: currentRole })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setUsers(data.users);
        setReclaimRecords(data.reclaimRecords);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Resolve alert handler
  const handleResolveAlert = async (alertId: string) => {
    try {
      const resp = await fetch("/api/alerts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setOveruseAlerts(data.overuseAlerts);
        // refresh data to sync colors
        await loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update threshold rule constraints handler
  const handleUpdateRules = async (rules: AlertRule[]) => {
    try {
      const resp = await fetch("/api/alerts/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setAlertRules(data.alertRules);
        setLicenses(data.licenses);
        await loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated Concurrency & allocation growth logs
  const handleSimulateLogAction = async (action: "AddSeat" | "RemoveSeat") => {
    try {
      const resp = await fetch("/api/logs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseId: simulatorLicenseId,
          activeAction: action
        })
      });
      const data = await resp.json();
      if (resp.ok && data.success) {
        setLicenses(data.licenses);
        setUsageLogs(data.usageLogs);
        setOveruseAlerts(data.overuseAlerts);
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Convert status color
  const getLicenseStatusColor = (status: License["status"]) => {
    if (status === "Overused") return "bg-rose-500";
    if (status === "Warning") return "bg-amber-500";
    return "bg-emerald-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-bold tracking-tight">Booting License Analytics Service...</p>
        <p className="text-slate-400 text-xs mt-1">Initializing full-stack telemetry database inside container</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12 antialiased">
      {/* 1. TOP UTILITY STRIP HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Service Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md">
              <Cpu className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                License Usage Analytics Console
              </h1>
              <p className="text-xs text-slate-400 font-medium">Enterprise Software Assets, Alerts, and AI Renewal Controls</p>
            </div>
          </div>

          {/* Operational RBAC Controls & UTC Clock */}
          <div className="flex flex-wrap items-center gap-3">
            {/* UTC clock */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-slate-500 text-xs font-mono font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>UTC : 2026-05-25 07:14:24</span>
            </div>

            {/* Persona Switcher (RBAC) */}
            <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200 rounded-xl p-1 text-xs">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 font-bold py-0.5">Role:</span>
              <button
                onClick={() => setCurrentRole(UserRole.IT_ADMIN)}
                className={`py-1 px-2.5 rounded-lg font-semibold transition-all select-none ${
                  currentRole === UserRole.IT_ADMIN 
                    ? "bg-indigo-600 text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                IT Admin
              </button>
              <button
                onClick={() => setCurrentRole(UserRole.FINANCE_MANAGER)}
                className={`py-1 px-2.5 rounded-lg font-semibold transition-all select-none ${
                  currentRole === UserRole.FINANCE_MANAGER 
                    ? "bg-indigo-600 text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Finance Mgr
              </button>
              <button
                onClick={() => setCurrentRole(UserRole.DEPT_HEAD)}
                className={`py-1 px-2.5 rounded-lg font-semibold transition-all select-none ${
                  currentRole === UserRole.DEPT_HEAD 
                    ? "bg-indigo-600 text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Dept Head
              </button>
            </div>

            {/* Force Reload */}
            <button
              onClick={loadDashboardData}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
              title="Refresh Telemetry Metrics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. CHASSIS CONTAINER ELEMENT */}
      <main className="max-w-7xl mx-auto px-6 mt-6">

        {/* ==========================================
            CRITICAL REAL-TIME LIMIT ALARMS DISPLAY
            ========================================== */}
        {overuseAlerts.length > 0 && (
          <div className="mb-6 bg-rose-50 border border-rose-100 rounded-xl p-4 shadow-sm animate-pulse/20">
            <h4 className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Active Overuse Capacity Threshold Warnings ({overuseAlerts.length})</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {overuseAlerts.map(alt => (
                <div key={alt.id} className="bg-white border border-rose-100 rounded-lg p-3 flex items-start justify-between gap-3 shadow-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${alt.severity === "high" ? "bg-rose-600 animate-ping" : "bg-amber-500"}`}></span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{new Date(alt.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-1">{alt.message}</p>
                    <p className="text-[10px] text-rose-500 font-semibold mt-1">Allocation: {alt.allocated} of {alt.total} seats.</p>
                  </div>
                  
                  <button
                    onClick={() => handleResolveAlert(alt.id)}
                    className="text-[10px] font-bold py-1 px-2.5 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-md transition-all shrink-0"
                  >
                    Silence Alarm
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. CORE STATISTICS HIGHLIGHT MATRIX */}
        {stats && <KPICards stats={stats} activeAlertCount={overuseAlerts.length} />}

        {/* ==========================================
            INTERACTIVE CONCURRENCY TRIGGER SIMULATOR
            ========================================== */}
        <div className="bg-white border border-slate-150 rounded-xl p-5 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-sans font-bold text-slate-800 text-sm flex items-center gap-2">
                <Database className="w-4.5 h-4.5 text-indigo-500" />
                Seat Simulation Controls (Verify Warnings & Real-time Logs)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate active personnel assignments. Overstretch allocated limits to watch alarms trigger instantly!
              </p>
            </div>
            
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Select license */}
              <select
                value={simulatorLicenseId}
                onChange={(e) => setSimulatorLicenseId(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg py-1.5 px-3 text-xs font-semibold outline-hidden cursor-pointer"
              >
                {licenses.map(lic => (
                  <option key={lic.id} value={lic.id}>
                    {lic.name} ({lic.allocatedSeats}/{lic.totalSeats} seats)
                  </option>
                ))}
              </select>

              {/* Action Trigger Buttons */}
              <div className="flex gap-1 bg-slate-100 rounded-lg p-1 border border-slate-200/55">
                <button
                  onClick={() => handleSimulateLogAction("AddSeat")}
                  className="flex items-center gap-1 py-1 px-2.5 rounded-md bg-white hover:bg-slate-50 hover:text-indigo-600 text-xs font-bold text-slate-700 transition"
                  title="Simulate adding seat usage"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Assign Seat</span>
                </button>
                <button
                  onClick={() => handleSimulateLogAction("RemoveSeat")}
                  className="flex items-center gap-1 py-1 px-2.5 rounded-md bg-white hover:bg-slate-50 hover:text-rose-600 text-xs font-bold text-slate-700 transition"
                  title="Simulate releasing seat usage"
                >
                  <MinusCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Release Seat</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. STATISTICS VISUALIZERS */}
        <ChartsView licenses={licenses} usageLogs={usageLogs} />

        {/* ==========================================
            ACTIVE LICENSE ALLOCATIONS REGISTER
            ========================================== */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs mb-6">
          <h3 className="font-sans font-semibold text-slate-800 text-base flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-500" />
            Configured License Headroom Directory
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {licenses.map(lic => {
              const usedPercentage = Math.round((lic.allocatedSeats / lic.totalSeats) * 100);
              return (
                <div key={lic.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/40 relative overflow-hidden flex flex-col justify-between">
                  {/* Status pills dot overlay */}
                  <span className={`absolute top-0 right-0 h-1.5 w-full ${getLicenseStatusColor(lic.status)}`} />
                  
                  <div className="mt-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">{lic.category}</span>
                        <h4 className="font-semibold text-slate-800 text-sm font-sans tracking-tight leading-snug">{lic.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Vendor: {lic.vendor}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        lic.status === 'Overused' 
                          ? 'bg-rose-100 text-rose-700 animate-pulse' 
                          : lic.status === 'Warning' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {lic.status}
                      </span>
                    </div>

                    {/* Costing values per year */}
                    <div className="flex gap-4 items-center mt-3 text-xs bg-white border border-slate-150/50 p-2.5 rounded-lg text-slate-600 font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Seat Fee</span>
                        <strong className="text-slate-700">${lic.costPerSeatMonthly}/mo</strong>
                      </div>
                      <div className="border-l border-slate-150 h-6 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Total Bill</span>
                        <strong className="text-indigo-600">${(lic.allocatedSeats * lic.costPerSeatMonthly).toLocaleString()}/mo</strong>
                      </div>
                    </div>

                    {/* Headroom Capacity limits bar indicator */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-slate-500 font-medium">Headroom Occupancy</span>
                        <span className={`font-mono font-bold ${usedPercentage >= 95 ? "text-rose-600" : "text-slate-700"}`}>{usedPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200/85 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            usedPercentage >= 95 
                              ? "bg-rose-500" 
                              : usedPercentage >= 85 
                                ? "bg-amber-500" 
                                : "bg-indigo-600"
                          }`}
                          style={{ width: `${Math.min(100, usedPercentage)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 font-semibold">
                        <span>{lic.allocatedSeats} Assigned Seats</span>
                        <span>{lic.totalSeats} Available Limit</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 mt-4 pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Renewal: <strong className="text-slate-500 font-mono">{lic.renewalDate}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. INACTIVE DORMANT USER ALLOCATIONS */}
        <ReclaimFinder
          users={users}
          licenses={licenses}
          currentRole={currentRole}
          onReclaim={handleReclaim}
          onNotify={handleNotify}
        />

        {/* 6. AI WORKSPACE AND RECOMMENDATIONS ENGINE (GEMINI-3.5-FLASH CO-LEADER) */}
        <AiPlanner hasApiKey={hasApiKey} />

        {/* 7. OVERUSE ALERTS TOGGLE CONFIG RUNTIME */}
        <ConfigRules rules={alertRules} onSaveRules={handleUpdateRules} />

        {/* ==========================================
            SIMUTATION AUDIT TRACKS LOGS BLOCK
            ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* A. Reclaims & Notices Audit Track Logs */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
            <h3 className="font-sans font-semibold text-slate-800 text-sm flex items-center gap-2 mb-4 text-indigo-900 border-b border-slate-100 pb-2.5">
              <Users className="w-4 h-4 text-indigo-500" />
              Reclaim & Notice Ops Audit Trail
            </h3>
            
            <div className="max-h-[220px] overflow-y-auto space-y-3 pr-2">
              {reclaimRecords.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">No reclaim actions compiled yet.</p>
              ) : (
                reclaimRecords.map((record) => (
                  <div key={record.id} className="text-xs p-3 bg-slate-50/80 border border-slate-200/50 rounded-lg flex items-start gap-3">
                    <span className={`px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                      record.actionType === "Reclaimed" 
                        ? "bg-rose-100 text-rose-700" 
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {record.actionType}
                    </span>
                    <div className="flex-1">
                      <p className="text-slate-700">
                        License seat <strong>{record.licenseName}</strong> clawed back from <strong>{record.userName}</strong> ({record.department}).
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>Audited By: <strong className="text-slate-550">{record.performedByRole}</strong></span>
                        <span>•</span>
                        <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* B. Log Events Stream */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs">
            <h3 className="font-sans font-semibold text-slate-800 text-sm flex items-center gap-2 mb-4 text-indigo-900 border-b border-slate-100 pb-2.5">
              <Database className="w-4 h-4 text-indigo-500" />
              Real-time Simulation Event Activity Stream
            </h3>
            <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-2">
              {usageLogs.map((log) => {
                const isWarningAction = log.action === "Login" || log.action === "FeatureUse";
                return (
                  <div key={log.id} className="text-xs p-2.5 hover:bg-slate-50/70 border-b border-slate-50 font-mono flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isWarningAction ? "bg-indigo-500" : "bg-slate-350"}`} />
                      <div>
                        <span className="text-slate-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className="font-semibold text-slate-700 ml-1">{log.userName}</span>
                        <span className="text-slate-500"> ({log.department})</span>
                        <span className="text-slate-400"> executed </span>
                        <span className="text-indigo-600 font-bold">{log.action}</span>
                      </div>
                    </div>
                    <span className="text-right text-slate-400 shrink-0 font-bold text-[10px] bg-slate-100 px-1 rounded">
                      Peak: {log.concurrencyCount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER CO-OPERATION DESIGN */}
      <footer className="max-w-7xl mx-auto px-6 mt-12 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-150 pt-6">
        <p className="font-medium">
          License Usage Analytics Dashboard — CERN Telemetry Procurement Tooling Suite
        </p>
        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-[10px] text-indigo-600 font-mono font-bold">
          <LifeBuoy className="w-3 h-3" />
          <span>PORT INGRESS SECURITY GUARANTEED ILLEGIBLE OUTSIDE INTERNALS</span>
        </div>
      </footer>
    </div>
  );
}
