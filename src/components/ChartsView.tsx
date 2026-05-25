/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Cell
} from "recharts";
import { License, UsageLog } from "../types";
import { AlertTriangle, Activity } from "lucide-react";

interface ChartsViewProps {
  licenses: License[];
  usageLogs: UsageLog[];
}

export const ChartsView: React.FC<ChartsViewProps> = ({ licenses, usageLogs }) => {
  // Format data for the capacity bar chart
  const capacityData = licenses.map(lic => ({
    name: lic.name.split(" ")[0] || lic.name, // short name
    Allocated: lic.allocatedSeats,
    Available: Math.max(0, lic.totalSeats - lic.allocatedSeats),
    totalSeats: lic.totalSeats,
    percentageUsed: Math.round((lic.allocatedSeats / lic.totalSeats) * 100)
  }));

  // Reverse usage logs so they show sequentially left to right
  const sortedLogs = [...usageLogs]
    .reverse()
    .slice(-10) // last 10 log datapoints
    .map(log => ({
      time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      license: log.licenseName.split(" ")[0],
      activeSeats: log.concurrencyCount
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* 1. License Allocation Integrity Bar Chart */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-indigo-500" />
            <h3 className="font-sans font-semibold text-gray-800">Seat Capacity Allocation Balance</h3>
          </div>
          <span className="text-xs font-mono text-gray-450">Total vs Allocated</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={capacityData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2D333B" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#94A3B8', fontSize: 11 }} 
                stroke="#2D333B" 
              />
              <YAxis 
                tick={{ fill: '#94A3B8', fontSize: 11 }} 
                stroke="#2D333B" 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: "#16191E", border: "1px solid #2D333B", borderRadius: "8px", color: "#F8FAFC" }}
                itemStyle={{ fontSize: 12 }}
                labelStyle={{ fontWeight: "bold", fontSize: 12, marginBottom: 4 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              <Bar dataKey="Allocated" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]}>
                {capacityData.map((entry, index) => {
                  const isRedZone = entry.percentageUsed >= 90;
                  return (
                    <Cell key={`cell-${index}`} fill={isRedZone ? "#EF4444" : "#3B82F6"} />
                  );
                })}
              </Bar>
              <Bar dataKey="Available" stackId="a" fill="#1E293B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Real-time Concurrency Streams Line Chart */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="font-sans font-semibold text-gray-800">Simulator Concurrency Timeline</h3>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] text-emerald-600 font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>LIVE FLUIDITY FEED</span>
          </div>
        </div>
        <div className="h-64 w-full">
          {sortedLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-100 rounded-lg">
              <p className="text-gray-400 text-sm">Waiting for simulator trigger events...</p>
              <p className="text-xs text-gray-300 mt-1">Add or release seats below to draw a waveform trajectory</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={sortedLogs}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2D333B" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: '#94A3B8', fontSize: 11 }} 
                  stroke="#2D333B" 
                />
                <YAxis 
                  tick={{ fill: '#94A3B8', fontSize: 11 }} 
                  stroke="#2D333B" 
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#16191E", border: "1px solid #2D333B", borderRadius: "8px", color: "#F8FAFC" }}
                  itemStyle={{ fontSize: 12 }}
                  labelStyle={{ fontWeight: "bold", fontSize: 12, marginBottom: 4 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Line
                  name="Concurrency Count"
                  type="monotone"
                  dataKey="activeSeats"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 1 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
