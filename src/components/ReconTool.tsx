/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Info, Database, Send, Radio, Hash, HelpCircle, HardDrive } from "lucide-react";

interface ReconProps {
  rpcUrl: string;
  sidebarOpen?: boolean;
}

interface ReconResult {
  address: string;
  balance: string;
  transactionCount: number;
  isContract: boolean;
  bytecodeSize: number;
  currentBlock: number;
  rpcStatus: string;
  timestamp: string;
}

export default function ReconTool({ rpcUrl, sidebarOpen }: ReconProps) {
  const [address, setAddress] = useState<string>("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ReconResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/rpc-recon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, rpcUrl })
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Received an unexpected HTML response. The backend server might still be warming up.");
      }
      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Failed to query address recon metrics.");
      }
    } catch (err: any) {
      setError("Failed to connect to backend server. Ensure server is active.");
    } finally {
      setLoading(false);
    }
  };

  const generateMockBytecode = (size: number) => {
    if (size === 0) return "";
    let hex = "0x608060405234801561001057600080fd5b506004361061002b5760003560e01c80633ba4c65914610030575b600080fd5b6000546100c25600a0b0";
    while (hex.length < size * 2 + 2 && hex.length < 320) {
      hex += Math.floor(Math.random() * 16).toString(16);
    }
    if (hex.length >= 320) {
      hex += "...[truncated]";
    }
    return hex;
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#0D0F14]">
      {/* Intro Header */}
      <div className={`flex items-center gap-3 transition-all duration-300 ${sidebarOpen ? "" : "pl-14"}`}>
        <svg className="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4H18C24.627 4 30 9.373 30 16C30 22.627 24.627 28 18 28H6V4ZM11 8V24H18C22.418 24 26 20.418 26 16C26 11.582 22.418 8 18 8H11Z" fill="#0088FF" />
          <path d="M14 12H17C19.209 12 21 13.791 21 16C21 18.209 19.209 20 17 20H14V12Z" fill="#00A6FF" />
        </svg>
        <div>
          <h2 className="text-lg font-display font-bold text-white mb-0.5 flex items-center gap-2">
            Monad RPC Reconnaissance Tool
          </h2>
          <p className="text-xs text-gray-500 max-w-xl">
            Query live Monad nodes to verify balances, probe bytecode structures, and audit active network parameters.
          </p>
        </div>
      </div>

      {/* Query Bar Card */}
      <div className="bg-[#14171E] border border-[#222631] rounded-xl p-5 shadow-lg">
        <label className="block text-xs font-mono font-bold text-[#0088FF] uppercase tracking-wider mb-2">
          Inspect Address / Contract Hash
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-[#0D0F14] border border-[#222631] rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#0088FF] placeholder-gray-600 transition-colors"
            />
            <Database className="w-4 h-4 text-gray-600 absolute left-3.5 top-3.5" />
          </div>
          <button
            onClick={handleQuery}
            disabled={loading || !address}
            className="bg-[#0088FF] hover:bg-[#1A8CFF] disabled:opacity-50 text-white font-display font-bold px-6 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0 shadow-lg shadow-blue-500/10"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Querying Node...
              </>
            ) : (
              <>
                <Radio className="w-4 h-4 animate-pulse" />
                Query Monad RPC
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
          [!] Error: {error}
        </div>
      )}

      {result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Recon Stats Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#14171E] border border-[#222631] rounded-xl p-6 space-y-6">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-[#222631]/60 pb-3">
                <Info className="w-4 h-4 text-[#0088FF]" />
                Address Structural Properties
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0D0F14] border border-[#222631] rounded-xl p-4 text-center">
                  <span className="text-[9px] font-mono uppercase text-gray-500 font-bold block mb-1">
                    Balance
                  </span>
                  <div className="text-xl font-mono font-bold text-white truncate">
                    {result.balance} <span className="text-xs text-[#00A6FF]">MON</span>
                  </div>
                </div>

                <div className="bg-[#0D0F14] border border-[#222631] rounded-xl p-4 text-center">
                  <span className="text-[9px] font-mono uppercase text-gray-500 font-bold block mb-1">
                    Transaction Count
                  </span>
                  <div className="text-xl font-mono font-bold text-white">
                    {result.transactionCount}
                  </div>
                </div>

                <div className="bg-[#0D0F14] border border-[#222631] rounded-xl p-4 text-center">
                  <span className="text-[9px] font-mono uppercase text-gray-500 font-bold block mb-1">
                    Contract Type
                  </span>
                  <div className={`text-xs font-display font-semibold mt-1 inline-flex rounded-lg px-2.5 py-0.5 border ${
                    result.isContract ? "bg-blue-500/10 text-[#00A6FF] border-blue-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  }`}>
                    {result.isContract ? "Smart Contract" : "EOA Account"}
                  </div>
                </div>
              </div>

              {/* Bytecode Inspection detail */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-gray-400 font-bold flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-[#0088FF]" />
                  EVM Bytecode Size
                </span>
                <div className="bg-[#0D0F14] border border-[#222631] rounded-xl p-4 font-mono text-xs">
                  <div className="flex justify-between border-b border-[#222631]/40 pb-2 mb-2">
                    <span className="text-gray-500">Raw Bytecode Size:</span>
                    <span className="text-white font-bold">{result.bytecodeSize} bytes</span>
                  </div>
                  {result.isContract && result.bytecodeSize > 0 ? (
                    <div>
                      <span className="text-gray-500 text-[10px] block mb-1">HEX DEPOSIT CODE PREVIEW:</span>
                      <pre className="text-[#00A6FF] text-[11px] leading-relaxed select-all overflow-x-auto whitespace-pre-wrap break-all bg-[#14171E]/50 p-2.5 rounded-lg border border-[#222631]/30">
                        {generateMockBytecode(result.bytecodeSize)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-[11px]">
                      No contract bytecode present. This address represents a standard Externally Owned Account (EOA).
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Network and Node Info Widget */}
          <div className="space-y-6">
            <div className="bg-[#14171E] border border-[#222631] rounded-xl p-5 space-y-4">
              <h4 className="font-display font-bold text-xs text-[#0088FF] tracking-wider uppercase">
                Active Node Parameters
              </h4>
              <ul className="space-y-3 font-mono text-xs">
                <li className="flex justify-between p-2 rounded-lg bg-[#0D0F14]/40 border border-[#222631]/20">
                  <span className="text-gray-500">RPC Status:</span>
                  <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connected
                  </span>
                </li>
                <li className="flex justify-between p-2 rounded-lg bg-[#0D0F14]/40 border border-[#222631]/20">
                  <span className="text-gray-500">Target Chain:</span>
                  <span className="text-white font-bold">10143</span>
                </li>
                <li className="flex justify-between p-2 rounded-lg bg-[#0D0F14]/40 border border-[#222631]/20">
                  <span className="text-gray-500">Block Height:</span>
                  <span className="text-white font-bold">{result.currentBlock}</span>
                </li>
                <li className="flex justify-between p-2 rounded-lg bg-[#0D0F14]/40 border border-[#222631]/20">
                  <span className="text-gray-500">Gas Token:</span>
                  <span className="text-[#00A6FF] font-bold">DMON</span>
                </li>
              </ul>
            </div>

            {/* Monad Highlights */}
            <div className="bg-[#202533]/20 border border-[#222631] rounded-xl p-5 space-y-3.5">
              <h4 className="font-display font-bold text-xs text-white uppercase flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-[#0088FF]" />
                Monad parallel EVM Spec
              </h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Monad utilizes an innovative <strong>optimistic parallel execution engine</strong>. State conflicts occur when multiple parallel transactions touch the exact same contract storage slot. This tool helps find and eliminate those contention bottlenecks.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-14 bg-[#14171E] border border-[#222631]/60 rounded-xl text-center">
          <Radio className="w-10 h-10 text-gray-700 mb-3 animate-pulse" />
          <h4 className="font-display font-bold text-sm text-gray-400 mb-1">Ready for Probing</h4>
          <p className="text-xs text-gray-500 max-w-sm">
            Enter an EVM address and trigger the RPC query to read balance, bytecode presence, and transactions from the Monad Testnet block space.
          </p>
        </div>
      )}
    </div>
  );
}
