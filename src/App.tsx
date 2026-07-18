/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import AuditTab from "./components/AuditTab";
import ReconTool from "./components/ReconTool";
import SandboxTab from "./components/SandboxTab";
import NetworkSettings from "./components/NetworkSettings";
import LandingPage from "./components/LandingPage";
import NotebookTab from "./components/NotebookTab";
import PluginsTab from "./components/PluginsTab";
import { ActiveView, AuditReport, SourceFile, NetworkConfig } from "./types";
import { ShieldCheck, Database, Terminal, Settings, Columns } from "lucide-react";
import FloatingChat from "./components/FloatingChat";

export default function App() {
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<ActiveView>("audit");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [contractAddress, setContractAddress] = useState<string>("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAiFallback, setIsAiFallback] = useState<boolean>(false);
  const [rpcStatus, setRpcStatus] = useState<"active" | "offline" | "checking">("checking");
  const [errorNotification, setErrorNotification] = useState<string | null>(null);

  const [networkConfig, setNetworkConfig] = useState<NetworkConfig>({
    rpcUrl: "https://testnet-rpc.monad.xyz",
    chainId: 10143,
    explorerUrl: "https://testnet.monadexplorer.com",
    name: "Monad Testnet"
  });

  const safeFetchJson = async (url: string, options?: RequestInit) => {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok) {
      let errMsg = `Server returned status ${response.status}`;
      if (contentType.includes("application/json")) {
        try {
          const errData = await response.json();
          errMsg = errData.error || errMsg;
        } catch {}
      }
      throw new Error(errMsg);
    }
    if (!contentType.includes("application/json")) {
      throw new Error("Received an unexpected HTML response from backend. The backend server might still be warming up.");
    }
    return response.json();
  };

  const verifyRpcConnection = async () => {
    setRpcStatus("checking");
    try {
      const data = await safeFetchJson("/api/rpc-recon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
          rpcUrl: networkConfig.rpcUrl
        })
      });
      if (data.success && data.rpcStatus === "active") {
        setRpcStatus("active");
      } else {
        setRpcStatus("offline");
      }
    } catch {
      setRpcStatus("offline");
    }
  };

  useEffect(() => {
    verifyRpcConnection();
  }, [networkConfig.rpcUrl]);

  const handleRunAudit = async (address: string) => {
    console.error('🔴 AUDIT BUTTON CLICKED - HANDLER STARTED');
    if (!address.trim()) return;
    setLoading(true);
    setAuditReport(null);
    setFiles([]);
    setIsAiFallback(false);
    setErrorNotification(null);

    try {
      // 1. Fetch source files from Monad blockvision/sourcify API
      const data = await safeFetchJson(`/api/monad-sourcify/${address}`);
      
      if (data.success === false) {
        setErrorNotification(data.error || "This contract is not verified on MonadScan, so source-level analysis isn't available. Try a verified address, or select one of our curated samples below.");
        setLoading(false);
        return;
      }

      if (!data.files || data.files.length === 0) {
        setErrorNotification("No files could be parsed from the selected address");
        setLoading(false);
        return;
      }

      setFiles(data.files);
      
      if (data.source === "fallback") {
        setErrorNotification(data.error);
      }

      // 2. Perform security audit using Gemini API backend route
      const auditData = await safeFetchJson("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: data.files,
          contractAddress: address
        })
      });

      if (auditData.success) {
        setAuditReport(auditData.report);
        setIsAiFallback(!!auditData.isAiFallback);
      } else {
        throw new Error(auditData.error || "Failed to parse security report.");
      }

    } catch (err: any) {
      console.error(err);
      setErrorNotification(err.message || "An unexpected error occurred during execution.");
    } finally {
      setLoading(false);
    }
  };

  // Preload initial mock contract on first render so user sees content instantly
  useEffect(() => {
    handleRunAudit("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
  }, []);

  const handleEnterApp = (address?: string) => {
    setShowLanding(false);
    if (address && address.trim()) {
      setContractAddress(address);
      handleRunAudit(address);
      setActiveView("audit");
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "audit":
        return (
          <AuditTab
            auditReport={auditReport}
            loading={loading}
            onRunAudit={handleRunAudit}
            contractAddress={contractAddress}
            setContractAddress={setContractAddress}
            files={files}
            setFiles={setFiles}
            sidebarOpen={sidebarOpen}
            isAiFallback={isAiFallback}
            errorNotification={errorNotification}
            setErrorNotification={setErrorNotification}
          />
        );
      case "recon":
        return <ReconTool rpcUrl={networkConfig.rpcUrl} sidebarOpen={sidebarOpen} />;
      case "sandbox":
        return <SandboxTab sidebarOpen={sidebarOpen} />;
      case "notebook":
        return <NotebookTab sidebarOpen={sidebarOpen} />;
      case "plugins":
        return <PluginsTab />;
      case "settings":
        return (
          <NetworkSettings
            config={networkConfig}
            setConfig={setNetworkConfig}
            onVerifyRpc={verifyRpcConnection}
            rpcStatus={rpcStatus}
            sidebarOpen={sidebarOpen}
          />
        );
      default:
        return null;
    }
  };

  if (showLanding) {
    return <LandingPage onEnterApp={handleEnterApp} rpcStatus={rpcStatus} />;
  }

  return (
    <div id="app-container" className="flex h-screen bg-monad-deep text-gray-200 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        rpcStatus={rpcStatus} 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Panel Content Area */}
      <main id="main-content" className="flex-1 flex flex-col overflow-hidden relative">
        {/* Floating Sidebar Toggle when sidebar is closed */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-40 p-2.5 rounded-xl bg-[#14171E] hover:bg-[#1E222D] border border-[#222631] text-gray-400 hover:text-white transition-all shadow-xl cursor-pointer flex items-center justify-center"
            title="Expand Sidebar"
          >
            <Columns className="w-4.5 h-4.5 text-[#0088FF]" />
          </button>
        )}

        {/* Global Error Banner */}
        {errorNotification && (
          <div id="global-error-banner" className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-2.5 text-xs text-amber-300 font-mono flex items-center justify-between shrink-0">
            <span className="truncate pr-4">[!] NOTICE: {errorNotification}</span>
            <button 
              onClick={() => setErrorNotification(null)}
              className="text-amber-500 hover:text-white font-bold cursor-pointer shrink-0 ml-2"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* Dynamic Route View rendering */}
        <div id="content-viewport" className="flex-1 flex flex-col min-h-0 bg-monad-deep">
          {renderContent()}
        </div>

        {/* Floating Chat Assistant */}
        <FloatingChat auditReport={auditReport} />
      </main>
    </div>
  );
}
