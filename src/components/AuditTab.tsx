/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AlertTriangle, Play, HelpCircle, FileText, CheckCircle2, ChevronRight, CornerDownRight, Clock, ShieldCheck, Flame, Sparkles, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AuditReport, SourceFile } from "../types";

interface AuditTabProps {
  auditReport: AuditReport | null;
  loading: boolean;
  onRunAudit: (address: string) => void;
  contractAddress: string;
  setContractAddress: (address: string) => void;
  files: SourceFile[];
  setFiles: (files: SourceFile[]) => void;
  sidebarOpen?: boolean;
  isAiFallback?: boolean;
}

export default function AuditTab({
  auditReport,
  loading,
  onRunAudit,
  contractAddress,
  setContractAddress,
  files,
  setFiles,
  sidebarOpen,
  isAiFallback,
}: AuditTabProps) {
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);

  const [triageLoading, setTriageLoading] = useState<boolean>(false);
  const [triageError, setTriageError] = useState<string | null>(null);
  const [triageResult, setTriageResult] = useState<{ title: string; reasoning: string }[] | null>(null);

  const [activeFindingsTab, setActiveFindingsTab] = useState<"findings" | "fix-order">("findings");
  const [expandedTriageIndices, setExpandedTriageIndices] = useState<Record<number, boolean>>({});

  const [suggestedFixes, setSuggestedFixes] = useState<Record<string, { originalCode: string; correctedCode: string }>>({});
  const [suggestedFixLoading, setSuggestedFixLoading] = useState<Record<string, boolean>>({});
  const [suggestedFixError, setSuggestedFixError] = useState<Record<string, string | null>>({});
  const [copiedFixId, setCopiedFixId] = useState<string | null>(null);

  const presets = [
    { name: "Monad Lending Pool", address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" },
    { name: "Parallel AMM Swap", address: "0x1111111254fb6c44bac0bed2854e76f90643097d" }
  ];

  React.useEffect(() => {
    setTriageResult(null);
    setTriageError(null);
    setTriageLoading(false);
    setActiveFindingsTab("findings");
    setExpandedTriageIndices({});
    setSuggestedFixes({});
    setSuggestedFixLoading({});
    setSuggestedFixError({});
    setCopiedFixId(null);
  }, [auditReport]);

  const handleCopyFix = (e: React.MouseEvent, id: string, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedFixId(id);
    setTimeout(() => {
      setCopiedFixId(null);
    }, 2000);
  };

  const handleSuggestFix = async (e: React.MouseEvent, finding: any) => {
    e.stopPropagation();
    const id = finding.id;
    setSuggestedFixLoading(prev => ({ ...prev, [id]: true }));
    setSuggestedFixError(prev => ({ ...prev, [id]: null }));

    try {
      const file = files.find(f => f.path === finding.filePath);
      const fileContent = file ? file.content : "";

      // Extract target variable name dynamically from finding properties to prevent mixups
      let variableName = "";
      if (finding.codeSnippet) {
        const cleanedSnippet = finding.codeSnippet.replace(";", "").trim();
        const parts = cleanedSnippet.split(/\s+/);
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.match(/^[a-zA-Z_]\w*$/)) {
          variableName = lastPart;
        } else {
          const m = cleanedSnippet.match(/(\w+)\s*;/);
          if (m) variableName = m[1];
        }
      }

      // Explicit fallback parsing of the description to find the exact state variable
      if (!variableName) {
        const descMatch = finding.description.match(/(?:variable|state variable|counter)\s+['"`]?([a-zA-Z_]\w*)['"`]?/i);
        if (descMatch) {
          variableName = descMatch[1];
        } else if (finding.id.includes("totalPoolDeposits")) {
          variableName = "totalPoolDeposits";
        } else if (finding.id.includes("globalTxCount")) {
          variableName = "globalTxCount";
        } else if (finding.id.includes("owner")) {
          variableName = "owner";
        } else if (finding.id.includes("globalVolumeUSD")) {
          variableName = "globalVolumeVolumeUSD";
        }
      }

      const response = await fetch("/api/suggest-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          findingTitle: finding.title,
          findingDescription: finding.description,
          codeSnippet: finding.codeSnippet || "",
          fileContent: fileContent,
          filePath: finding.filePath,
          line: finding.line,
          variableName: variableName,
          message: finding.description,
          relevantCodeLines: finding.codeSnippet || ""
        })
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();
      if (data.success && data.originalCode && data.correctedCode) {
        setSuggestedFixes(prev => ({
          ...prev,
          [id]: {
            originalCode: data.originalCode,
            correctedCode: data.correctedCode
          }
        }));
      } else {
        throw new Error(data.error || "Fix suggestion unavailable");
      }
    } catch (error) {
      console.error("Suggest fix error:", error);
      setSuggestedFixError(prev => ({ ...prev, [id]: "Fix suggestion unavailable" }));
    } finally {
      setSuggestedFixLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const getFindingSeverityByTitle = (title: string): string => {
    if (!auditReport || !auditReport.findings) return "low";
    const clean = (t: string) => t.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const found = auditReport.findings.find(f => clean(f.title) === clean(title));
    return found ? found.severity : "low";
  };

  const toggleTriageExpand = (idx: number) => {
    setExpandedTriageIndices(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleTriage = async () => {
    if (!auditReport || !auditReport.findings || auditReport.findings.length === 0) return;
    setTriageLoading(true);
    setTriageError(null);

    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ findings: auditReport.findings })
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.triage)) {
        setTriageResult(data.triage);
        setActiveFindingsTab("fix-order");
      } else {
        throw new Error(data.error || "Triage failed");
      }
    } catch (error) {
      console.error("Triage execution failed:", error);
      setTriageError("Triage unavailable, try again");
    } finally {
      setTriageLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAiFallback) {
      console.log("Static Analysis Fallback Active: The Gemini AI model is currently experiencing heavy volume or quota limits. A secure, highly deterministic local static analyzer has executed security checks for you.");
    }
  }, [isAiFallback]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "high": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "low": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "gas": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-[#0D0F14]">
      {/* Top action header */}
      <div className="p-6 bg-[#14171E] border-b border-[#222631] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className={`flex items-center gap-3 transition-all duration-300 ${sidebarOpen ? "" : "pl-14"}`}>
          <svg className="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 4H18C24.627 4 30 9.373 30 16C30 22.627 24.627 28 18 28H6V4ZM11 8V24H18C22.418 24 26 20.418 26 16C26 11.582 22.418 8 18 8H11Z" fill="#0088FF" />
            <path d="M14 12H17C19.209 12 21 13.791 21 16C21 18.209 19.209 20 17 20H14V12Z" fill="#00A6FF" />
          </svg>
          <div>
            <h2 className="text-lg font-display font-bold text-white mb-0.5 flex items-center gap-2">
              EVM Parallel Security Auditor
            </h2>
            <p className="text-xs text-gray-500 max-w-xl">
              Identify parallel execution contention state locks and critical smart contract loopholes.
            </p>
          </div>
        </div>
      </div>

      {/* Main interface area split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Address form and code viewer */}
        <div className="flex-1 flex flex-col border-r border-[#222631] overflow-hidden">
          {/* Target contract input form */}
          <div className="p-5 border-b border-[#222631] bg-[#0D0F14]">
            <label className="block text-xs font-mono font-bold text-[#0088FF] uppercase tracking-wider mb-2">
              Select Sample Contract to Audit
            </label>
            <div className="flex flex-col md:flex-row gap-3">
              <select
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="flex-1 bg-[#14171E] border border-[#222631] rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#0088FF] transition-colors cursor-pointer"
              >
                <option value="" disabled className="text-gray-600">-- Choose a curated vulnerability template --</option>
                {presets.map((preset) => (
                  <option key={preset.address} value={preset.address} className="bg-[#14171E] text-white">
                    {preset.name} ({preset.address.slice(0, 6)}...{preset.address.slice(-4)})
                  </option>
                ))}
              </select>
              <button
                onClick={() => onRunAudit(contractAddress)}
                disabled={loading || !contractAddress}
                className="bg-[#0088FF] hover:bg-[#1A8CFF] disabled:opacity-50 text-white font-display font-bold px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer transition-all shrink-0"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Begin Audit
                  </>
                )}
              </button>
            </div>
            
            {/* Confident, honest label near input area */}
            <p className="mt-3 text-[11px] text-gray-500 leading-normal flex items-start gap-2 font-sans select-none">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0088FF] shrink-0 mt-1.5"></span>
              <span>Demo mode: analyzing curated sample contracts representative of common Monad vulnerability patterns.</span>
            </p>
          </div>

          {/* Code panel header / tabs */}
          {files.length > 0 ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="bg-[#14171E] border-b border-[#222631] flex overflow-x-auto">
                {files.map((file, idx) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFileIdx(idx)}
                    className={`px-4 py-3 border-r border-[#222631] font-mono text-xs flex items-center gap-2 shrink-0 cursor-pointer ${
                      selectedFileIdx === idx
                        ? "bg-[#0D0F14] border-b-2 border-b-[#0088FF] text-white font-semibold"
                        : "text-gray-500 hover:text-gray-300 bg-[#14171E]/50"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-gray-500" />
                    {file.name}
                  </button>
                ))}
              </div>

              {/* Code viewer workspace */}
              <div className="flex-1 bg-[#0D0F14] p-5 font-mono text-xs overflow-auto leading-relaxed select-text relative">
                {files[selectedFileIdx].content.split("\n").map((lineContent, i) => {
                  const lineNum = i + 1;
                  // Highlight if part of selected finding
                  const isHighlighted = auditReport?.findings.some(
                    f => f.id === selectedFindingId && f.filePath === files[selectedFileIdx].path && f.line === lineNum
                  );

                  return (
                    <div 
                      key={i} 
                      className={`flex group hover:bg-white/5 transition-colors ${
                        isHighlighted ? "bg-[#0088FF]/10 border-l-2 border-l-[#0088FF] -ml-5 pl-4" : ""
                      }`}
                    >
                      <span className="w-10 text-gray-600 select-none text-right pr-4 text-[10px]">{lineNum}</span>
                      <pre className="text-gray-300 whitespace-pre">{lineContent}</pre>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-[#0D0F14]">
              <div className="w-14 h-14 rounded-full bg-[#202533]/30 flex items-center justify-center mb-4 border border-[#222631]/50">
                <HelpCircle className="w-6 h-6 text-[#0088FF] animate-pulse" />
              </div>
              <h3 className="font-display font-bold text-base text-white mb-2">No Curated Contract Selected</h3>
              <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
                Select one of our curated Monad vulnerability templates from the dropdown above to view and audit its verified contract files.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Audit Report findings */}
        <div className="w-full lg:w-96 flex flex-col bg-[#14171E] overflow-hidden shrink-0">
          <div className="p-4 border-b border-[#222631] bg-[#14171E] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-xs text-[#0088FF] tracking-wider uppercase">
                Audit Findings & Score
              </span>
              {auditReport && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">
                    Score: <span className={`font-bold ${auditReport.score >= 80 ? "text-emerald-400" : "text-red-400"}`}>{auditReport.score}/100</span>
                  </span>
                  <button
                    onClick={handleTriage}
                    disabled={triageLoading}
                    className="bg-[#0088FF]/10 hover:bg-[#0088FF]/20 border border-[#0088FF]/30 disabled:opacity-50 text-[#0088FF] font-mono text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded cursor-pointer transition-colors shrink-0"
                  >
                    {triageLoading ? "Triaging..." : "Triage Findings"}
                  </button>
                </div>
              )}
            </div>
            {triageError && (
              <div className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1.5 rounded font-mono select-none">
                {triageError}
              </div>
            )}
          </div>

          {auditReport ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Score card summary banner */}
              <div className="p-4 rounded-xl bg-[#202533]/20 border border-[#222631] relative overflow-hidden">
                <div className="absolute right-3 top-3 w-16 h-16 rounded-full border border-[#222631] flex items-center justify-center flex-col select-none bg-[#14171E]">
                  <span className="text-lg font-mono font-bold text-white leading-none">{auditReport.score}</span>
                  <span className="text-[8px] font-mono uppercase text-gray-500 font-semibold tracking-wider">Score</span>
                </div>
                
                <h4 className="font-display font-bold text-sm text-white mb-1 truncate pr-16">{auditReport.name}</h4>
                <p className="text-[10px] text-gray-500 mb-3 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Audited on {new Date(auditReport.timestamp).toLocaleTimeString()}
                </p>

                {/* Severity Breakdown stats pill items */}
                <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-1">
                    <div className="text-xs font-bold text-red-400">{auditReport.stats.critical}</div>
                    <div className="text-[7px] text-gray-500 uppercase font-semibold">Critical</div>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-1">
                    <div className="text-xs font-bold text-orange-400">{auditReport.stats.high}</div>
                    <div className="text-[7px] text-gray-500 uppercase font-semibold">High</div>
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-1">
                    <div className="text-xs font-bold text-cyan-400">{auditReport.stats.gas}</div>
                    <div className="text-[7px] text-gray-500 uppercase font-semibold">Bottleneck</div>
                  </div>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex bg-[#0D0F14]/60 p-1 rounded-xl border border-[#222631]">
                <button
                  onClick={() => setActiveFindingsTab("findings")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-medium transition-all duration-200 cursor-pointer text-center ${
                    activeFindingsTab === "findings"
                      ? "bg-[#202533] text-[#0088FF] shadow-sm font-semibold border border-[#222631]/60"
                      : "text-gray-400 hover:text-white border border-transparent"
                  }`}
                >
                  All Findings ({auditReport.findings.length})
                </button>
                <button
                  onClick={() => setActiveFindingsTab("fix-order")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-medium transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 text-center ${
                    activeFindingsTab === "fix-order"
                      ? "bg-[#202533] text-[#0088FF] shadow-sm font-semibold border border-[#222631]/60"
                      : "text-gray-400 hover:text-white border border-transparent"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Fix Order {triageResult ? `(${triageResult.length})` : ""}
                </button>
              </div>

              {/* Tab Panel 1: Original Findings List */}
              {activeFindingsTab === "findings" && (
                <div className="space-y-3">
                  {auditReport.findings.map((finding) => (
                    <div
                      key={finding.id}
                      onClick={() => {
                        setSelectedFindingId(finding.id);
                        // Try to switch to file where finding occurs
                        const fileIdx = files.findIndex(f => f.path === finding.filePath);
                        if (fileIdx !== -1) {
                          setSelectedFileIdx(fileIdx);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                        selectedFindingId === finding.id
                          ? "bg-[#202533]/40 border-[#0088FF] shadow-md"
                          : "bg-[#0D0F14] border-[#222631] hover:border-[#222631]/80 hover:bg-[#0D0F14]/80"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[9px] font-mono uppercase font-bold tracking-wider border rounded-md px-1.5 py-0.5 ${getSeverityColor(finding.severity)}`}>
                          {finding.severity}
                        </span>
                        {finding.line && (
                          <span className="text-[10px] font-mono text-gray-500">
                            Line {finding.line}
                          </span>
                        )}
                      </div>

                      <h5 className="font-display font-semibold text-xs text-white mb-1.5 leading-snug">
                        {finding.title}
                      </h5>
                      
                      <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                        {finding.description}
                      </p>

                      {selectedFindingId === finding.id && (
                        <div className="border-t border-[#222631] pt-3 mt-3 space-y-3">
                          <div className="space-y-2">
                            <div className="text-[10px] font-mono font-bold text-[#0088FF] uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Remediation Recommendation
                            </div>
                            <p className="text-[10.5px] text-gray-300 bg-[#14171E] border border-[#222631] rounded-lg p-2.5 leading-normal select-text whitespace-pre-line font-mono font-light">
                              {finding.remediation}
                            </p>
                          </div>

                          {/* Suggest Fix Section */}
                          <div className="space-y-3 pt-2 border-t border-[#222631]/60">
                            <button
                              onClick={(e) => handleSuggestFix(e, finding)}
                              disabled={suggestedFixLoading[finding.id]}
                              className="w-full bg-[#0088FF]/10 hover:bg-[#0088FF]/20 border border-[#0088FF]/30 disabled:opacity-50 text-[#0088FF] font-mono text-[10px] uppercase tracking-wider font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                            >
                              {suggestedFixLoading[finding.id] ? (
                                <>
                                  <span className="w-3 h-3 border-2 border-[#0088FF]/30 border-t-[#0088FF] rounded-full animate-spin"></span>
                                  <span>Generating Fix...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-[#0088FF]" />
                                  <span>Suggest Fix</span>
                                </>
                              )}
                            </button>

                            {suggestedFixError[finding.id] && (
                              <div className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-lg font-mono text-center">
                                {suggestedFixError[finding.id]}
                              </div>
                            )}

                            {/* Before / After Comparison */}
                            {suggestedFixes[finding.id] && (
                              <div className="space-y-3 pt-2">
                                {/* Vulnerable Code (Original) */}
                                <div className="space-y-1">
                                  <div className="text-[9px] font-mono font-bold text-red-400/85 uppercase tracking-wider">
                                    Vulnerable Code
                                  </div>
                                  <pre className="line-through opacity-50 bg-[#0D0F14] border border-[#222631] text-gray-400 rounded-lg p-2.5 font-mono text-[10.5px] leading-relaxed overflow-x-auto select-text whitespace-pre">
                                    {suggestedFixes[finding.id].originalCode}
                                  </pre>
                                </div>

                                {/* Corrected Code (Patched) */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                      <Check className="w-3.5 h-3.5" />
                                      Suggested Corrective Patch
                                    </div>
                                    <button
                                      onClick={(e) => handleCopyFix(e, finding.id, suggestedFixes[finding.id].correctedCode)}
                                      className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono uppercase font-semibold px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer select-none"
                                    >
                                      {copiedFixId === finding.id ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400" />
                                          Copied!
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          Copy Fix
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <pre className="bg-[#0D0F14] border border-emerald-500/30 shadow-md shadow-emerald-500/5 text-emerald-300 rounded-lg p-2.5 font-mono text-[10.5px] leading-relaxed overflow-x-auto select-text whitespace-pre">
                                    {suggestedFixes[finding.id].correctedCode}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab Panel 2: Recommended Fix Order Section */}
              {activeFindingsTab === "fix-order" && (
                <div className="space-y-3">
                  {triageResult && triageResult.length > 0 ? (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#0088FF]/5 to-[#0088FF]/10 border border-[#0088FF]/20 space-y-3">
                      <h4 className="font-display font-bold text-xs text-[#0088FF] uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#0088FF]" />
                        Recommended Fix Order
                      </h4>
                      <ol className="space-y-2">
                        {triageResult.map((item, index) => {
                          const severity = getFindingSeverityByTitle(item.title);
                          const isExpanded = !!expandedTriageIndices[index];
                          return (
                            <li key={index} className="border border-[#222631] bg-[#0D0F14] rounded-xl overflow-hidden transition-all duration-200 hover:border-[#0088FF]/40">
                              <button
                                onClick={() => toggleTriageExpand(index)}
                                className="w-full flex items-center justify-between text-left gap-3 p-3 cursor-pointer select-none"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0088FF]/10 text-[#0088FF] font-mono text-[10px] font-bold shrink-0">
                                    {index + 1}
                                  </span>
                                  <span className="font-semibold text-xs text-white leading-snug truncate">
                                    {item.title}
                                  </span>
                                  <span className={`text-[8px] font-mono uppercase font-bold tracking-wider border rounded-md px-1.5 py-0.5 shrink-0 ${getSeverityColor(severity)}`}>
                                    {severity}
                                  </span>
                                </div>
                                <ChevronRight className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90 text-[#0088FF]" : ""}`} />
                              </button>
                              
                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                  >
                                    <div className="border-t border-[#222631] p-3 text-[11px] text-gray-400 leading-relaxed font-light bg-[#14171E] whitespace-pre-line select-text">
                                      {item.reasoning}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-[#202533]/10 border border-[#222631] rounded-xl">
                      <ShieldCheck className="w-10 h-10 text-gray-600 mb-3 animate-pulse" />
                      <h4 className="font-display font-semibold text-xs text-white mb-1.5">No Fix Order Generated</h4>
                      <p className="text-[11px] text-gray-500 max-w-[240px] leading-relaxed mb-4">
                        Generate a secure recommended fix order categorized by real-world exploit risk.
                      </p>
                      <button
                        onClick={handleTriage}
                        disabled={triageLoading}
                        className="bg-[#0088FF]/10 hover:bg-[#0088FF]/20 border border-[#0088FF]/30 disabled:opacity-50 text-[#0088FF] font-mono text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded cursor-pointer transition-colors"
                      >
                        {triageLoading ? "Triaging..." : "Triage Findings"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
              <AlertTriangle className="w-8 h-8 text-gray-600 mb-3" />
              <p className="text-xs">No analysis has been executed yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
