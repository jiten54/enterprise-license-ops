/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserRole, LicenseUser, License } from "../types";
import { Trash2, Send, AlertCircle, Sparkles, Filter, CheckCircle2 } from "lucide-react";

interface ReclaimFinderProps {
  users: LicenseUser[];
  licenses: License[];
  currentRole: UserRole;
  onReclaim: (userId: string) => Promise<void>;
  onNotify: (userId: string) => Promise<void>;
}

export const ReclaimFinder: React.FC<ReclaimFinderProps> = ({
  users,
  licenses,
  currentRole,
  onReclaim,
  onNotify
}) => {
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [minIdleDays, setMinIdleDays] = useState<number>(30);
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Filter users based on idle time and department selection
  const inactiveUsers = users.filter(usr => {
    // idle filters
    if (usr.inactiveDays < minIdleDays) return false;
    // status can be anything unless active users are excluded (we want to show inactive/flagged)
    if (selectedDept !== "All" && usr.department !== selectedDept) return false;
    return true;
  });

  // Sort by highest idle days first to flag most severe first
  const sortedInactiveUsers = [...inactiveUsers].sort((a, b) => b.inactiveDays - a.inactiveDays);

  const handleAction = async (userId: string, type: "reclaim" | "notify") => {
    setActioningId(userId);
    try {
      if (type === "reclaim") {
        await onReclaim(userId);
      } else {
        await onNotify(userId);
      }
    } finally {
      setActioningId(null);
    }
  };

  const getCostForUser = (licenseId: string) => {
    return licenses.find(l => l.id === licenseId)?.costPerSeatMonthly || 0;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <h3 className="font-sans font-semibold text-gray-800 text-lg flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-indigo-500" />
            Dormant Account Reclaim Suite (RBAC)
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Audit inactive accounts, reclaim seats, and allocate assets to active backlogs safely.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department filter */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-gray-700 outline-hidden font-medium cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Product">Product</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
            </select>
          </div>

          {/* Idle Days filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-gray-400">Min Idle:</span>
            <select
              value={minIdleDays}
              onChange={(e) => setMinIdleDays(Number(e.target.value))}
              className="bg-transparent text-gray-700 outline-hidden font-semibold cursor-pointer"
            >
              <option value={15}>&gt; 15 Days</option>
              <option value={30}>&gt; 30 Days</option>
              <option value={60}>&gt; 60 Days</option>
              <option value={90}>&gt; 90 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Access Permission Banner based on Role */}
      <div className="mb-4 text-xs flex items-center gap-2 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-indigo-800 font-sans">
        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
        <div>
          <span>Acting Persona: <strong>{currentRole === UserRole.IT_ADMIN ? "IT Infrastructure Admin" : currentRole === UserRole.DEPT_HEAD ? "Department Head" : "Finance Procurement Director"}</strong>. </span>
          {currentRole === UserRole.IT_ADMIN && (
            <span className="text-indigo-600">You hold absolute authorization credentials to de-provision licenses instantly.</span>
          )}
          {currentRole === UserRole.DEPT_HEAD && (
            <span className="text-gray-500">You can flag and issue pending notifications count but direct clawbacks require System Admin escalation.</span>
          )}
          {currentRole === UserRole.FINANCE_MANAGER && (
            <span className="text-gray-500">You can audit cost weights and submit automated checklists to legal procurement.</span>
          )}
        </div>
      </div>

      {sortedInactiveUsers.length === 0 ? (
        <div className="text-center py-8 p-6 border-2 border-dashed border-gray-100 rounded-lg">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 animate-bounce" />
          <p className="text-gray-500 font-medium text-sm">No dormant accounts fit these filters!</p>
          <p className="text-xs text-gray-400 mt-1">Excellent license configuration hygiene.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">User Details</th>
                <th className="py-2.5 px-3">License & Cost</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Idle Duration</th>
                <th className="py-2.5 px-3">Lifecycle Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedInactiveUsers.map((usr) => {
                const isFlagged = usr.status === "Flagged";
                const userCost = getCostForUser(usr.licenseId);

                return (
                  <tr 
                    key={usr.id} 
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors duration-150 text-sm align-middle"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-800">{usr.name}</div>
                      <div className="text-xs text-gray-400">{usr.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-gray-700 font-medium">{usr.licenseName}</div>
                      <div className="text-xs text-gray-500 font-mono">${userCost}/month</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-xs text-gray-600 font-medium">
                        {usr.department}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-800 font-mono">{usr.inactiveDays} days</div>
                      <div className="text-xs text-gray-400">Last active: {usr.lastActiveDate}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                        isFlagged 
                          ? "bg-amber-50 border-amber-200 text-amber-700 font-mono" 
                          : "bg-rose-50 border-rose-100 text-rose-600"
                      }`}>
                        <AlertCircle className="w-3 h-3" />
                        {isFlagged ? "Warning Issued" : "Idle Pending"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex gap-2 justify-end">
                        {/* Notify button: accessible to IT Admin & Dept Heads */}
                        <button
                          disabled={
                            actioningId !== null || 
                            currentRole === UserRole.FINANCE_MANAGER || 
                            isFlagged
                          }
                          onClick={() => handleAction(usr.id, "notify")}
                          title="Send Slack / Email Reclamation Warning"
                          className={`flex items-center gap-1 py-1 px-2.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                            isFlagged 
                              ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" 
                              : currentRole === UserRole.FINANCE_MANAGER
                                ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-white border-amber-200 text-amber-600 hover:bg-amber-50"
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isFlagged ? "Notified" : "Notify Link"}</span>
                        </button>

                        {/* Reclaim seat: Only IT Admin can actually do this */}
                        <button
                          disabled={actioningId !== null || currentRole !== UserRole.IT_ADMIN}
                          onClick={() => handleAction(usr.id, "reclaim")}
                          className={`flex items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                            currentRole === UserRole.IT_ADMIN
                              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                              : "bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed"
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Clawback</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
