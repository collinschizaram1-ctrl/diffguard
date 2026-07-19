/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Shield, 
  Search, 
  Columns, 
  Plus, 
  ToyBrick, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Compass, 
  Terminal, 
  Settings, 
  FolderMinus
} from "lucide-react";
import { ActiveView } from "../types";

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  rpcStatus: "active" | "offline" | "checking";
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ 
  activeView, 
  setActiveView, 
  rpcStatus, 
  sidebarOpen, 
  setSidebarOpen
}: SidebarProps) {
  const [operationsOpen, setOperationsOpen] = useState(true);
  const [projectsOpen, setProjectsOpen] = useState(true);

  // Operations inside list
  const operations = [
    {
      id: "recon" as ActiveView,
      name: "Recon a target",
      subtext: "Inspect address state & byte size",
      icon: Compass,
    },
    {
      id: "audit" as ActiveView,
      name: "Audit Monad Contract",
      subtext: "Check state contention & CEI rules",
      icon: Shield,
    },
    {
      id: "sandbox" as ActiveView,
      name: "Sandbox terminal",
      subtext: "Run Foundry & static tools",
      icon: Terminal,
    },
    {
      id: "settings" as ActiveView,
      name: "Network parameters",
      subtext: "Tune RPC latency & RPC nodes",
      icon: Settings,
    }
  ];

  return (
    <aside 
      id="sidebar"
      className={`bg-[#14171E] flex flex-col justify-between h-screen shrink-0 text-gray-300 font-sans transition-all duration-300 ${
        sidebarOpen ? "w-72 border-r border-[#222631]" : "w-0 border-r-0 overflow-hidden"
      }`}
    >
      <div className="w-72 flex-1 flex flex-col h-full justify-between shrink-0 font-sans">
        {/* Sidebar Top Area */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Top Control Icons */}
          <div className="p-4 flex items-center justify-between border-b border-[#222631]/50 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-wider text-gray-400 uppercase">
                Diff-Guard Sentry
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-400">
              <button className="p-1.5 rounded-lg hover:bg-[#1E222D] hover:text-white transition-colors cursor-pointer" title="Quick Search">
                <Search className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg hover:bg-[#1E222D] hover:text-white transition-colors cursor-pointer" 
                title="Toggle Layout"
              >
                <Columns className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Outer scroll container */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
            {/* Navigation shortcuts list */}
            <div className="space-y-1">
              <button 
                onClick={() => setActiveView("audit")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                  activeView === "audit"
                    ? "bg-[#20242E] text-white border border-[#2B303B]"
                    : "hover:bg-[#1E222D] text-gray-300 hover:text-white"
                }`}
              >
                <Plus className={`w-3.5 h-3.5 ${activeView === "audit" ? "text-[#0088FF]" : "text-gray-500"}`} />
                New audit pipeline
              </button>

              <button 
                onClick={() => setActiveView("plugins")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                  activeView === "plugins"
                    ? "bg-[#20242E] text-white border border-[#2B303B]"
                    : "hover:bg-[#1E222D] text-gray-300 hover:text-white"
                }`}
              >
                <ToyBrick className={`w-3.5 h-3.5 ${activeView === "plugins" ? "text-[#0088FF]" : "text-gray-500"}`} />
                Plugins
              </button>

              <button 
                onClick={() => setActiveView("notebook")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                  activeView === "notebook"
                    ? "bg-[#20242E] text-white border border-[#2B303B]"
                    : "hover:bg-[#1E222D] text-gray-300 hover:text-white"
                }`}
              >
                <BookOpen className={`w-3.5 h-3.5 ${activeView === "notebook" ? "text-[#0088FF]" : "text-gray-500"}`} />
                Pentest Notebook
              </button>
            </div>

            {/* Operations Dropdown Section */}
            <div className="space-y-1.5">
              <button 
                onClick={() => setOperationsOpen(!operationsOpen)}
                className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-mono font-bold tracking-wider text-gray-500 uppercase hover:text-gray-300 transition-colors cursor-pointer"
              >
                <span>Operations</span>
                {operationsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>

              {operationsOpen && (
                <div className="space-y-1 pl-1">
                  {operations.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveView(item.id)}
                        className={`w-full text-left px-2.5 py-2 rounded-xl transition-all duration-200 flex items-start gap-3 group cursor-pointer ${
                          isActive
                            ? "bg-[#20242E] text-white border border-[#2B303B]/60 shadow-sm"
                            : "hover:bg-[#1E222D]/60 text-gray-400 hover:text-gray-200"
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 transition-colors ${
                          isActive ? "bg-[#0088FF]/10 text-[#0088FF]" : "bg-[#1C1F26] text-gray-500 group-hover:text-gray-300"
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="overflow-hidden">
                          <div className={`text-xs font-semibold leading-tight ${isActive ? "text-white" : "text-gray-300"}`}>
                            {item.name}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate leading-normal mt-0.5">
                            {item.subtext}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Projects Dropdown Section */}
            <div className="space-y-1.5">
              <button 
                onClick={() => setProjectsOpen(!projectsOpen)}
                className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-mono font-bold tracking-wider text-gray-500 uppercase hover:text-gray-300 transition-colors cursor-pointer"
              >
                <span>Projects</span>
                {projectsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>

              {projectsOpen && (
                <div className="space-y-1 pl-1">
                  <button className="w-full text-left px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-[#1E222D] hover:text-white transition-all flex items-center gap-2.5 cursor-pointer">
                    <FolderMinus className="w-3.5 h-3.5 text-gray-500" />
                    Monad Audit Workspace
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connection Indicator Footer */}
        <div className="p-4 border-t border-[#222631]/60 bg-[#101217] shrink-0 font-sans">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0D0F14]/60 border border-[#222631]/40">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  rpcStatus === "active" ? "bg-emerald-400" : rpcStatus === "checking" ? "bg-amber-400" : "bg-red-500"
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  rpcStatus === "active" ? "bg-emerald-500" : rpcStatus === "checking" ? "bg-amber-500" : "bg-red-500"
                }`}></span>
              </span>
              <div className="font-mono text-[9px] uppercase font-bold tracking-wider text-gray-400">
                {rpcStatus === "active" ? "Monad Testnet" : rpcStatus === "checking" ? "Verifying..." : "RPC Offline"}
              </div>
            </div>
            <div className="text-[9px] font-mono text-gray-600 font-bold">
              10143
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
