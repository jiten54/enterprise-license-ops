/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AlertRule } from "../types";
import { ShieldAlert, Save, RefreshCw } from "lucide-react";

interface ConfigRulesProps {
  rules: AlertRule[];
  onSaveRules: (updatedRules: AlertRule[]) => Promise<void>;
}

export const ConfigRules: React.FC<ConfigRulesProps> = ({ rules, onSaveRules }) => {
  const [localRules, setLocalRules] = useState<AlertRule[]>(rules);
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // Update a rule's percentage
  const handlePercentChange = (id: string, value: number) => {
    setLocalRules(prev =>
      prev.map(r => (r.id === id ? { ...r, thresholdPercentage: Math.max(50, Math.min(100, value)) } : r))
    );
  };

  // Toggle a rule's active state
  const handleToggleActive = (id: string) => {
    setLocalRules(prev =>
      prev.map(r => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await onSaveRules(localRules);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-150">
        <div>
          <h3 className="font-sans font-semibold text-gray-800 text-base flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-500" />
            Overuse Alert Guardrail Rules
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure safety threshold percentages per vendor to trigger seat warnings.
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
            success 
              ? "bg-emerald-600 text-white" 
              : "bg-indigo-650 hover:bg-indigo-720 text-white cursor-pointer shadow-xs"
          }`}
        >
          {saving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{success ? "Configurations Saved!" : "Save Alert Rules"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {localRules.map((rule) => {
          return (
            <div 
              key={rule.id} 
              className={`p-4 border rounded-xl flex items-center justify-between transition-all duration-200 ${
                rule.isActive 
                  ? "border-gray-150 bg-white" 
                  : "border-gray-150 bg-gray-50/50 grayscale opacity-60"
              }`}
            >
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-800">{rule.licenseName}</span>
                </div>
                
                {/* Threshold Slider control */}
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={rule.thresholdPercentage}
                    disabled={!rule.isActive}
                    onChange={(e) => handlePercentChange(rule.id, Number(e.target.value))}
                    className="flex-1 h-1.5 bg-gray-150 rounded-lg appearance-none cursor-pointer accent-indigo-600 outline-hidden"
                  />
                  <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2 py-0.5 border border-gray-185 rounded-md min-w-[42px] text-center">
                    {rule.thresholdPercentage}%
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono font-semibold text-gray-400 uppercase tracking-widest mb-1">
                  Alerts
                </span>
                <button
                  onClick={() => handleToggleActive(rule.id)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    rule.isActive ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      rule.isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
