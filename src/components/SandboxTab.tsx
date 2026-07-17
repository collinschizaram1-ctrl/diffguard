/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Terminal, Send, Trash2, HelpCircle, ArrowRight, Play, Check, AlertCircle } from "lucide-react";
import { SandboxCommand } from "../types";

export default function SandboxTab({ sidebarOpen }: { sidebarOpen?: boolean }) {
  const [commands, setCommands] = useState<SandboxCommand[]>([
    {
      id: "init-1",
      command: "foundryup",
      timestamp: new Date().toLocaleTimeString(),
      status: "success",
      output: `[#] Installing foundry...
[#] Downloading foundryup...
[#] Complete. Foundryup installed successfully.
[#] Running foundryup...
[#] installed 'solc' v0.8.20
[#] installed 'forge' (0.2.0)
[#] installed 'cast' (0.2.0)
[#] installed 'anvil' (0.2.0)
[#] installed 'chisel' (0.2.0)
[#] SUCCESS: Foundry toolkit is now fully loaded in the isolated Docker sandbox.`
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const quickCommands = [
    { label: "Install solc compiler", cmd: "solc-select install choice latest" },
    { label: "Run Slither Audit", cmd: "slither ." },
    { label: "Run Aderyn Static Checker", cmd: "aderyn ." },
    { label: "Foundry up setup", cmd: "foundryup" }
  ];

  const handleCommandRun = async (cmdStr: string) => {
    if (!cmdStr.trim()) return;
    setLoading(true);

    const newCmd: SandboxCommand = {
      id: Math.random().toString(),
      command: cmdStr,
      timestamp: new Date().toLocaleTimeString(),
      status: "running",
      output: ""
    };

    setCommands(prev => [...prev, newCmd]);
    setInputVal("");

    try {
      const response = await fetch("/api/sandbox-exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmdStr })
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Received an unexpected HTML response from backend server.");
      }
      const data = await response.json();

      setCommands(prev => prev.map(item => {
        if (item.command === cmdStr && item.status === "running") {
          return {
            ...item,
            status: data.status || "success",
            output: data.output
          };
        }
        return item;
      }));
    } catch (err) {
      setCommands(prev => prev.map(item => {
        if (item.command === cmdStr && item.status === "running") {
          return {
            ...item,
            status: "failed",
            output: "Error: Failed to execute sandbox command inside isolated container."
          };
        }
        return item;
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [commands]);

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6 flex flex-col h-full min-w-0 bg-[#0D0F14]">
      {/* Intro section */}
      <div className={`shrink-0 flex items-center gap-3 transition-all duration-300 ${sidebarOpen ? "" : "pl-14"}`}>
        <svg className="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 4H18C24.627 4 30 9.373 30 16C30 22.627 24.627 28 18 28H6V4ZM11 8V24H18C22.418 24 26 20.418 26 16C26 11.582 22.418 8 18 8H11Z" fill="#0088FF" />
          <path d="M14 12H17C19.209 12 21 13.791 21 16C21 18.209 19.209 20 17 20H14V12Z" fill="#00A6FF" />
        </svg>
        <div>
          <h2 className="text-lg font-display font-bold text-white mb-0.5 flex items-center gap-2">
            Isolated Auditing Sandbox Container
          </h2>
          <p className="text-xs text-gray-500 max-w-xl">
            Execute isolated local tools (Slither static analyzer, Aderyn compiler reports, Foundry/forge testing suite) inside our pre-configured Docker testing pipeline.
          </p>
        </div>
      </div>

      {/* Main split */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Terminal emulator */}
        <div className="flex-1 bg-black border border-[#222631] rounded-xl flex flex-col overflow-hidden min-h-[400px]">
          {/* Header */}
          <div className="bg-[#14171E] px-4 py-3 border-b border-[#222631] flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              </div>
              <span className="font-mono text-xs font-semibold text-gray-400 ml-2">
                shizaram@monad-auditor-sandbox:~/workspace
              </span>
            </div>
            <button
              onClick={() => setCommands([])}
              className="text-gray-500 hover:text-white transition-colors cursor-pointer"
              title="Clear terminal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Console feed */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-gray-300 space-y-4 select-text">
            {commands.map((cmd) => (
              <div key={cmd.id} className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#0088FF]">
                  <span>$</span>
                  <span className="font-bold text-white">{cmd.command}</span>
                  <span className="text-[10px] text-gray-600 ml-auto">{cmd.timestamp}</span>
                </div>
                {cmd.status === "running" ? (
                  <div className="flex items-center gap-2 text-gray-500 italic pl-3">
                    <span className="w-2.5 h-2.5 border border-gray-500 border-t-white rounded-full animate-spin"></span>
                    Running command inside isolation capsule...
                  </div>
                ) : (
                  <pre className="text-gray-400 pl-3 leading-relaxed border-l border-[#222631]/30 whitespace-pre-wrap break-all">
                    {cmd.output}
                  </pre>
                )}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>

          {/* Terminal input bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCommandRun(inputVal);
            }}
            className="p-3 bg-[#14171E] border-t border-[#222631] flex items-center gap-3 shrink-0"
          >
            <span className="font-mono text-sm text-[#0088FF] font-bold ml-1 select-none">$</span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g., slither . or aderyn .  (Type 'help' for command manual)"
              className="flex-1 bg-transparent border-none text-white outline-none font-mono text-xs py-1 placeholder-gray-600"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              className="p-1.5 rounded-lg text-[#0088FF] hover:bg-[#202533]/30 disabled:opacity-30 cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Quick Tools Side Panel */}
        <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
          <div className="bg-[#14171E] border border-[#222631] rounded-xl p-5 space-y-4">
            <h3 className="font-display font-bold text-xs text-[#0088FF] tracking-wider uppercase">
              Toolbox Launch Control
            </h3>
            <p className="text-[11px] text-gray-400 leading-normal">
              Quickly launch preset Web3 audit tooling dependencies in our prebuilt workspace container environment.
            </p>

            <div className="space-y-2">
              {quickCommands.map((qc) => (
                <button
                  key={qc.cmd}
                  onClick={() => handleCommandRun(qc.cmd)}
                  disabled={loading}
                  className="w-full text-left p-3 rounded-lg bg-[#0D0F14] border border-[#222631] hover:border-[#0088FF]/50 text-gray-300 hover:text-white transition-all text-xs font-mono flex items-center justify-between group cursor-pointer"
                >
                  <div className="overflow-hidden mr-2">
                    <div className="font-sans font-semibold text-gray-200 mb-0.5">{qc.label}</div>
                    <div className="text-[10px] text-gray-500 truncate">{qc.cmd}</div>
                  </div>
                  <Play className="w-3.5 h-3.5 text-[#0088FF] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#0D0F14]/60 border border-[#222631] rounded-xl p-5 space-y-3">
            <h4 className="font-display font-bold text-xs text-white uppercase flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              Pre-installed Ecosystem
            </h4>
            <ul className="space-y-1.5 text-[10.5px] font-mono text-gray-500">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                slither-analyzer v0.10.2
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                solc-select compiler pool
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Foundry framework suite
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Aderyn static checker v0.1
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
