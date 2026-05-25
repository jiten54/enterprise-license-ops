/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { DollarSign, ShieldAlert, BadgeCent, TrendingDown, Users } from "lucide-react";
import { DashboardStats } from "../types";

interface KPICardsProps {
  stats: DashboardStats;
  activeAlertCount: number;
}

export const KPICards: React.FC<KPICardsProps> = ({ stats, activeAlertCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Monthly Bill */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex items-center justify-between transition-all duration-200 hover:shadow-md">
        <div>
          <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Current Monthly Spend</p>
          <p className="text-2xl font-bold font-sans text-gray-900 mt-1">
            ${stats.totalMonthlySpend.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
            <BadgeCent className="w-3.5 h-3.5" />
            <span>Active seat billing only</span>
          </div>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

      {/* Immediate Reclaim Savings */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex items-center justify-between transition-all duration-200 hover:shadow-md">
        <div>
          <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Potential Savings</p>
          <p className="text-2xl font-bold font-sans text-emerald-600 mt-1">
            ${stats.potentialMonthlySavings.toLocaleString()}
            <span className="text-xs font-normal text-gray-400 ml-1">/ mo</span>
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
            <span>Based on {stats.inactiveSeatsCount} idle seats</span>
          </div>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
          <TrendingDown className="w-6 h-6" />
        </div>
      </div>

      {/* Seat Headroom Ratio */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex items-center justify-between transition-all duration-200 hover:shadow-md">
        <div>
          <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Avg License Allocation</p>
          <p className="text-2xl font-bold font-sans text-gray-900 mt-1">
            {stats.activeLicensesRatio}%
          </p>
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                stats.activeLicensesRatio > 90 
                  ? "bg-rose-500" 
                  : stats.activeLicensesRatio > 75 
                    ? "bg-amber-500" 
                    : "bg-indigo-600"
              }`}
              style={{ width: `${stats.activeLicensesRatio}%` }}
            />
          </div>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Active Overuse Alerts */}
      <div className={`border rounded-xl p-5 shadow-xs flex items-center justify-between transition-all duration-200 hover:shadow-md ${
        activeAlertCount > 0 
          ? "bg-rose-50/50 border-rose-100 text-rose-900" 
          : "bg-white border-gray-100 text-gray-900"
      }`}>
        <div>
          <p className={`text-xs font-mono uppercase tracking-wider ${activeAlertCount > 0 ? "text-rose-600" : "text-gray-400"}`}>Active Overuse Alerts</p>
          <p className="text-2xl font-bold font-sans mt-1">
            {activeAlertCount}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs">
            <ShieldAlert className={`w-3.5 h-3.5 ${activeAlertCount > 0 ? "text-rose-500 animate-pulse" : "text-gray-400"}`} />
            <span className={activeAlertCount > 0 ? "text-rose-700 font-medium" : "text-gray-500"}>
              {activeAlertCount > 0 ? "Threshold limit breaches detected" : "All limits healthy"}
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${activeAlertCount > 0 ? "bg-rose-100 text-rose-600" : "bg-gray-50 text-gray-500"}`}>
          <ShieldAlert className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
