/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, Brain, RefreshCw, Send, CheckSquare, MessageSquare, AlertCircle, FileText, Compass } from "lucide-react";

interface AiPlannerProps {
  hasApiKey: boolean;
}

export const AiPlanner: React.FC<AiPlannerProps> = ({ hasApiKey }) => {
  const [activeTab, setActiveTab] = useState<"renewal" | "prediction" | "copilot">("renewal");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorString, setErrorString] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  
  // Custom Copilot chatbot state
  const [customQuestion, setCustomQuestion] = useState<string>("");
  const [chatLog, setChatLog] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: "Hello! I am Aero, your AI Software Asset Procurement Assistant. Ask me a question like: 'How can we structure Atlassian seat renewals to save 15%?' or 'Draft an email script negotiating a Figma pricing tier rollback.'"
    }
  ]);

  // Handle preset report generations
  const triggerAiAnalysis = async (mode: "renewal_report" | "predictive_demand" | "chatbot_q", customQ?: string) => {
    setLoading(true);
    setErrorString(null);
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptMode: mode,
          userCustomQuestion: customQ
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (mode === "chatbot_q" && customQ) {
          setChatLog(prev => [
            ...prev,
            { sender: "bot", text: data.report }
          ]);
        } else {
          setAiReport(data.report);
        }
      } else {
        throw new Error(data.error || "Generation endpoint returned failure");
      }
    } catch (err: any) {
      console.error(err);
      setErrorString(err.message || "Could not generate report. Please verify your GEMINI_API_KEY.");
    } finally {
      setLoading(false);
    }
  };

  // Run initial renewal report when tab mounts
  useEffect(() => {
    if (activeTab === "renewal" && !aiReport) {
      triggerAiAnalysis("renewal_report");
    } else if (activeTab === "prediction" && !aiReport) {
      triggerAiAnalysis("predictive_demand");
    }
  }, [activeTab]);

  const handleSendCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || loading) return;

    const userQ = customQuestion;
    setChatLog(prev => [...prev, { sender: "user", text: userQ }]);
    setCustomQuestion("");
    
    await triggerAiAnalysis("chatbot_q", userQ);
  };

  // Pre-configured questions cards for fast user input
  const presetPrompts = [
    "Draft an Adobe Creative Cloud downgrade email request.",
    "Show JetBrains seat negotiation tactics.",
    "Is a 10% reserve overflow normal for GitHub Cloud?"
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <h3 className="font-sans font-semibold text-gray-800 text-lg flex items-center gap-2">
            <Brain className="w-5.5 h-5.5 text-indigo-600 animate-pulse" />
            AI Workspace & Portfolio Optimization
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Generates predictive demand forecasts, automates contract negotiations, and audits unused software weight.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1 bg-gray-50 border border-gray-200/50 rounded-lg p-1.5 self-start">
          <button
            onClick={() => { setActiveTab("renewal"); setAiReport(null); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold select-none transition-all duration-200 ${
              activeTab === "renewal" 
                ? "bg-white text-indigo-700 shadow-xs" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>AI Renewal Report</span>
          </button>
          
          <button
            onClick={() => { setActiveTab("prediction"); setAiReport(null); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold select-none transition-all duration-200 ${
              activeTab === "prediction" 
                ? "bg-white text-indigo-700 shadow-xs" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Demand Predictions</span>
          </button>

          <button
            onClick={() => setActiveTab("copilot")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold select-none transition-all duration-200 ${
              activeTab === "copilot" 
                ? "bg-white text-indigo-700 shadow-xs" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Aero Copilot</span>
          </button>
        </div>
      </div>

      {/* Warnings / API info */}
      {!hasApiKey && (
        <div className="mb-4 text-xs flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-100 rounded-lg text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Gemini API Key Missing:</span> If you are viewing the preview without completing key configuration inside Settings, AI tasks will fail. Provide a valid <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">GEMINI_API_KEY</code> in your environment parameters.
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 1: RENEWAL REPORT
          ========================================== */}
      {activeTab === "renewal" && (
        <div>
          <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
            <span>AUDIT TYPE: CONTRACTUAL RESCHEDULING & ROLLBACK STRATEGIES</span>
            <button
              onClick={() => triggerAiAnalysis("renewal_report")}
              disabled={loading}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Re-analyze</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium text-sm">Auditing seat accounts and billing logs...</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">Generating custom Atlassian, Adobe, Figma optimization strategies back-end on Gemini-3.5-flash.</p>
            </div>
          ) : errorString ? (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-sm flex gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-semibold">Unable to compile report</p>
                <p className="text-xs text-rose-700 mt-1">{errorString}</p>
                <button
                  onClick={() => triggerAiAnalysis("renewal_report")}
                  className="mt-2 text-xs font-semibold text-rose-900 underline"
                >
                  Retry request
                </button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none text-gray-700 text-sm leading-relaxed p-5 bg-gradient-to-br from-indigo-50/20 to-gray-50/20 border border-gray-100 rounded-xl max-h-[450px] overflow-y-auto">
              {aiReport ? (
                <div className="markdown-body space-y-4">
                  {aiReport.split("\n\n").map((para, idx) => {
                    if (para.startsWith("###")) {
                      return <h4 key={idx} className="text-sm font-mono font-bold text-indigo-900 border-l-2 border-indigo-500 pl-2 mt-4 uppercase tracking-wider">{para.replace(/###/g, "").trim()}</h4>;
                    }
                    if (para.startsWith("##")) {
                      return <h3 key={idx} className="text-base font-bold text-gray-900 border-b border-gray-150 pb-1 mt-6">{para.replace(/##/g, "").trim()}</h3>;
                    }
                    if (para.startsWith("-") || para.startsWith("*")) {
                      return (
                        <ul key={idx} className="list-disc list-inside space-y-1.5 ml-1 pl-1 text-[13px] text-gray-650">
                          {para.split("\n").map((li, lIdx) => (
                            <li key={lIdx} className="leading-normal">{li.replace(/^[\s-*]+/, "").trim()}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={idx} className="text-[13px] text-gray-650 leading-relaxed font-sans">{para}</p>;
                  })}
                </div>
              ) : (
                <p className="text-gray-450 italic">AI Report analysis empty.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 2: DEMAND PREDICTION
          ========================================== */}
      {activeTab === "prediction" && (
        <div>
          <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
            <span>MODEL TYPE: MATHEMATICAL SEAT GROWTH & ALLOCATION SAFETY COEFFICIENTS</span>
            <button
              onClick={() => triggerAiAnalysis("predictive_demand")}
              disabled={loading}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Re-forecast</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium text-sm">Interpolating growth trend models on Gemini...</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">Simulating license demand bounds for upcoming business quarters Q3 and Q4.</p>
            </div>
          ) : errorString ? (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-sm flex gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-semibold">Unable to compile forecast</p>
                <p className="text-xs text-rose-700 mt-1">{errorString}</p>
                <button
                  onClick={() => triggerAiAnalysis("predictive_demand")}
                  className="mt-2 text-xs font-semibold text-rose-900 underline"
                >
                  Retry request
                </button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none text-gray-700 text-sm leading-relaxed p-5 bg-gradient-to-br from-indigo-50/20 to-gray-50/20 border border-gray-100 rounded-xl max-h-[450px] overflow-y-auto">
              {aiReport ? (
                <div className="markdown-body space-y-4">
                  {aiReport.split("\n\n").map((para, idx) => {
                    if (para.startsWith("###")) {
                      return <h4 key={idx} className="text-sm font-mono font-bold text-indigo-900 border-l-2 border-indigo-500 pl-2 mt-4 uppercase tracking-wider">{para.replace(/###/g, "").trim()}</h4>;
                    }
                    if (para.startsWith("##")) {
                      return <h3 key={idx} className="text-base font-bold text-gray-900 border-b border-gray-150 pb-1 mt-6">{para.replace(/##/g, "").trim()}</h3>;
                    }
                    if (para.startsWith("-") || para.startsWith("*")) {
                      return (
                        <ul key={idx} className="list-disc list-inside space-y-1.5 ml-1 pl-1 text-[13px] text-gray-650">
                          {para.split("\n").map((li, lIdx) => (
                            <li key={lIdx} className="leading-normal">{li.replace(/^[\s-*]+/, "").trim()}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={idx} className="text-[13px] text-gray-655 leading-relaxed font-sans">{para}</p>;
                  })}
                </div>
              ) : (
                <p className="text-gray-450 italic">AI Demand projection analysis empty.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 3: AERO NEGOTIATOR COPILOT CHAT
          ========================================== */}
      {activeTab === "copilot" && (
        <div className="flex flex-col h-[400px] border border-gray-100 rounded-xl overflow-hidden bg-gray-50/30">
          {/* Chat log body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-sm">
            {chatLog.map((chat, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${
                  chat.sender === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  chat.sender === "user" ? "bg-indigo-600 text-white" : "bg-neutral-800 text-indigo-400"
                }`}>
                  {chat.sender === "user" ? "ME" : "AI"}
                </div>
                <div className={`p-3 rounded-xl leading-relaxed text-[13px] shadow-xs ${
                  chat.sender === "user" 
                    ? "bg-indigo-650 text-white rounded-tr-none" 
                    : "bg-white border border-gray-100 rounded-tl-none text-gray-700 whitespace-pre-line"
                }`}>
                  {chat.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-neutral-800 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                  AI
                </div>
                <div className="bg-white border border-gray-100 rounded-xl rounded-tl-none p-3 shadow-xs text-xs text-gray-400 flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Aero is analyzing configuration rules...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick preset chips */}
          <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 flex-wrap items-center">
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Fast Presets:</span>
            {presetPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => { setCustomQuestion(p); }}
                className="text-[11px] bg-indigo-50 hover:bg-indigo-150 border border-indigo-100 text-indigo-750 px-2 py-0.5 rounded-full transition-all"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form onSubmit={handleSendCustomQuestion} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask anything about renewals, pricing rollback, bulk tiers, seat reclaim criteria..."
              disabled={loading}
              className="flex-1 text-sm border border-gray-200 focus:border-indigo-500 rounded-lg px-3.5 py-2 outline-hidden transition-all text-gray-700"
            />
            <button
              type="submit"
              disabled={loading || !customQuestion.trim()}
              className={`bg-indigo-650 hover:bg-indigo-710 text-white rounded-lg px-4 flex items-center justify-center text-sm font-semibold transition-all ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
