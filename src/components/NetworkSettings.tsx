/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Settings, Info, RefreshCw, Cpu, Database, Network, ExternalLink, ShieldAlert } from "lucide-react";
import { NetworkConfig } from "../types";

interface SettingsProps {
  config: NetworkConfig;
  setConfig: (config: NetworkConfig) => void;
  onVerifyRpc: () => void;
  rpcStatus: "active" | "offline" | "checking";
  sidebarOpen?: boolean;
}

export default function NetworkSettings({ config, setConfig, onVerifyRpc, rpcStatus, sidebarOpen }: SettingsProps) {
  const [latency, setLatency] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);

  const testLatency = async () => {
    setTesting(true);
    const start = performance.now();
    try {
      const response = await fetch(config.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1
        }),
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        const end = performance.now();
        setLatency(Math.round(end - start));
      } else {
        setLatency(null);
      }
    } catch {
      setLatency(null);
    } finally {
      setTesting(false);
      onVerifyRpc();
    }
  };

  const resetToDefault = () => {
    setConfig({
      rpcUrl: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      explorerUrl: "https://testnet.monadexplorer.com",
      name: "Monad Testnet"
    });
    setLatency(null);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#0D0F14]">
      {/* Header */}
      <div className={`flex items-center gap-3 transition-all duration-300 ${sidebarOpen ? "" : "pl-14"}`}>
        <svg className="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4H18C24.627 4 30 9.373 30 16C30 22.627 24.627 28 18 28H6V4ZM11 8V24H18C22.418 24 26 20.418 26 16C26 11.582 22.418 8 18 8H11Z" fill="#0088FF" />
          <path d="M14 12H17C19.209 12 21 13.791 21 16C21 18.209 19.209 20 17 20H14V12Z" fill="#00A6FF" />
        </svg>
        <div>
          <h2 className="text-lg font-display font-bold text-white mb-0.5 flex items-center gap-2">
            Monad Network Configuration
          </h2>
          <p className="text-xs text-gray-500 max-w-xl">
            Inspect, configure, and customize the active RPC connection nodes, chain configurations, and explorer properties for the Monad ecosystem.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: input settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#14171E] border border-[#222631] rounded-xl p-6 space-y-5">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2 border-b border-[#222631]/60 pb-3">
              <Network className="w-4 h-4 text-[#0088FF]" />
              EVM Environment Variables
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">
                  MONAD_RPC_URL
                </label>
                <input
                  type="text"
                  value={config.rpcUrl}
                  onChange={(e) => setConfig({ ...config, rpcUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#0D0F14] border border-[#222631] rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#0088FF]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">
                    MONAD_CHAIN_ID
                  </label>
                  <input
                    type="number"
                    value={config.chainId}
                    onChange={(e) => setConfig({ ...config, chainId: Number(e.target.value) })}
                    className="w-full bg-[#0D0F14] border border-[#222631] rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#0088FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">
                    MONAD_EXPLORER_URL
                  </label>
                  <input
                    type="text"
                    value={config.explorerUrl}
                    onChange={(e) => setConfig({ ...config, explorerUrl: e.target.value })}
                    className="w-full bg-[#0D0F14] border border-[#222631] rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#0088FF]"
                  />
                </div>
              </div>
            </div>

            {/* Actions block */}
            <div className="pt-4 border-t border-[#222631]/60 flex flex-wrap gap-3 items-center">
              <button
                onClick={testLatency}
                disabled={testing}
                className="bg-[#0088FF] hover:bg-[#1A8CFF] disabled:opacity-50 text-white font-display font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
                Test Node Latency
              </button>
              <button
                onClick={resetToDefault}
                className="bg-transparent border border-[#222631] text-gray-400 hover:text-white hover:border-white/20 font-display font-bold px-4 py-2 rounded-lg text-xs cursor-pointer transition-colors"
              >
                Restore Defaults
              </button>

              {latency !== null && (
                <div className="ml-auto font-mono text-xs flex items-center gap-2">
                  <span className="text-gray-500">Latency:</span>
                  <span className={`font-bold ${latency < 150 ? "text-emerald-400" : latency < 350 ? "text-amber-400" : "text-red-400"}`}>
                    {latency}ms
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Monad Ecosystem specs */}
        <div className="space-y-6">
          <div className="bg-[#14171E] border border-[#222631] rounded-xl p-5 space-y-4">
            <h4 className="font-display font-bold text-xs text-[#0088FF] tracking-wider uppercase">
              Monad System Metrics
            </h4>
            
            <div className="space-y-4 text-xs font-sans">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-md bg-[#0088FF]/10 border border-[#0088FF]/20 text-[#0088FF] shrink-0">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-200">10,000 Real TPS</div>
                  <p className="text-[10.5px] text-gray-500 leading-relaxed mt-0.5">
                    Engineered to execute transactions asynchronously with pipeline parallelization and state memory compaction.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-md bg-[#0088FF]/10 border border-[#0088FF]/20 text-[#0088FF] shrink-0">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-200">MonadDb Architecture</div>
                  <p className="text-[10.5px] text-gray-500 leading-relaxed mt-0.5">
                    Custom storage engine featuring parallel asynchronous disk I/O, bypassing EVM storage locks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#202533]/20 border border-[#222631] rounded-xl p-5 space-y-3">
            <h4 className="font-display font-bold text-xs text-white uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#0088FF]" />
              Auditor Environment variables
            </h4>
            <p className="text-[10.5px] text-gray-400 leading-normal">
              When launching auditing operations via CLI, the workspace environment variables are set to:
            </p>
            <pre className="font-mono text-[10px] text-[#00A6FF] bg-[#0D0F14] border border-[#222631] p-2.5 rounded-lg overflow-x-auto whitespace-pre">
{`MONAD_RPC_URL="${config.rpcUrl}"
MONAD_CHAIN_ID=${config.chainId}
MONAD_EXPLORER="${config.explorerUrl}"`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
