/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ToyBrick, 
  Github, 
  Shield, 
  Terminal, 
  Database, 
  Check, 
  Search, 
  Sparkles, 
  Cpu, 
  Plus, 
  X, 
  Settings2, 
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Link,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Plugin {
  id: string;
  name: string;
  description: string;
  category: "mcp" | "auditing" | "blockchain" | "tools";
  iconType: "github" | "slither" | "foundry" | "blockvision" | "mcp" | "tenderly";
  isConnected: boolean;
  configSchema: {
    label: string;
    key: string;
    type: "text" | "password" | "select";
    placeholder: string;
    options?: string[];
  }[];
  configValues: Record<string, string>;
}

export default function PluginsTab() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "mcp" | "auditing" | "blockchain" | "tools">("all");
  const [configuringPluginId, setConfiguringPluginId] = useState<string | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [isAddingCustomMcp, setIsAddingCustomMcp] = useState(false);
  const [customMcpName, setCustomMcpName] = useState("");
  const [customMcpUrl, setCustomMcpUrl] = useState("");
  const [customMcpDesc, setCustomMcpDesc] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Initialize plugins
  useEffect(() => {
    const defaultPlugins: Plugin[] = [
      {
        id: "mcp-gemini",
        name: "Google Gemini Code Agent",
        description: "Connect the advanced AI coding agent via Model Context Protocol (MCP) to automate security remediations directly inside your IDE.",
        category: "mcp",
        iconType: "mcp",
        isConnected: true,
        configSchema: [
          { label: "API Key", key: "apiKey", type: "password", placeholder: "GEMINI_API_KEY" },
          { label: "Default Model", key: "model", type: "select", placeholder: "Select model", options: ["gemini-3.5-flash", "gemini-3.5-pro"] }
        ],
        configValues: { apiKey: "••••••••••••••••", model: "gemini-3.5-flash" }
      },
      {
        id: "github-sync",
        name: "GitHub Repository Sync",
        description: "Fetch source codes, monitor pull requests, and trigger automatic Monad parallel-contention static analyses on commit events.",
        category: "tools",
        iconType: "github",
        isConnected: false,
        configSchema: [
          { label: "Repository URL", key: "repoUrl", type: "text", placeholder: "e.g., owner/repo" },
          { label: "Personal Access Token", key: "token", type: "password", placeholder: "ghp_xxxxxxxxxxxxxxxx" }
        ],
        configValues: {}
      },
      {
        id: "slither-analyzer",
        name: "Slither Static Analyzer",
        description: "Integrate python-slither pipelines directly to detect both generic EVM vulnerabilities and customized Monad contention bottlenecks.",
        category: "auditing",
        iconType: "slither",
        isConnected: true,
        configSchema: [
          { label: "Slither Binary Path", key: "path", type: "text", placeholder: "e.g., /usr/local/bin/slither" },
          { label: "Extra Arguments", key: "args", type: "text", placeholder: "e.g., --solc-args '--optimize'" }
        ],
        configValues: { path: "slither", args: "--json -" }
      },
      {
        id: "foundry-toolkit",
        name: "Foundry Toolchain",
        description: "Enables local Forge compilations, Anvil local node forks, and instant EVM execution traces inside the Sandbox.",
        category: "tools",
        iconType: "foundry",
        isConnected: false,
        configSchema: [
          { label: "Forge Command Path", key: "forgePath", type: "text", placeholder: "e.g., ~/.foundry/bin/forge" },
          { label: "Build Timeout (s)", key: "timeout", type: "text", placeholder: "e.g., 30" }
        ],
        configValues: {}
      },
      {
        id: "monad-blockvision",
        name: "Monad Blockvision API",
        description: "Provides zero-latency historical transaction traces, event logs parsing, and dynamic address balance fetches.",
        category: "blockchain",
        iconType: "blockvision",
        isConnected: false,
        configSchema: [
          { label: "Blockvision API Key", key: "apiKey", type: "password", placeholder: "Enter API token" },
          { label: "RPC Custom endpoint", key: "endpoint", type: "text", placeholder: "https://api.blockvision.org/v1/..." }
        ],
        configValues: {}
      },
      {
        id: "tenderly-devnets",
        name: "Tenderly Devnets",
        description: "Simulate complex multithreaded transactions, analyze state slot overrides, and debug Monad parallel transactions.",
        category: "blockchain",
        iconType: "tenderly",
        isConnected: false,
        configSchema: [
          { label: "Access Token", key: "token", type: "password", placeholder: "Enter Tenderly Access Token" },
          { label: "Project Slug", key: "slug", type: "text", placeholder: "e.g., org/project" }
        ],
        configValues: {}
      }
    ];

    try {
      const stored = localStorage.getItem("diffguard_connected_plugins");
      if (stored) {
        const parsed = JSON.parse(stored) as Plugin[];
        // Merge stored connections/configs with defaults to preserve schemas
        const merged = defaultPlugins.map(def => {
          const match = parsed.find(p => p.id === def.id);
          if (match) {
            return {
              ...def,
              isConnected: match.isConnected,
              configValues: { ...def.configValues, ...match.configValues }
            };
          }
          return def;
        });

        // Add any user-added custom MCP servers
        const customMcp = parsed.filter(p => p.id.startsWith("custom-mcp-"));
        setPlugins([...merged, ...customMcp]);
      } else {
        setPlugins(defaultPlugins);
        localStorage.setItem("diffguard_connected_plugins", JSON.stringify(defaultPlugins));
      }
    } catch {
      setPlugins(defaultPlugins);
    }
  }, []);

  const savePluginsState = (updated: Plugin[]) => {
    setPlugins(updated);
    try {
      localStorage.setItem("diffguard_connected_plugins", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartConfigure = (plugin: Plugin) => {
    setConfiguringPluginId(plugin.id);
    setConfigValues(plugin.configValues);
  };

  const handleSaveConfig = (pluginId: string) => {
    const updated = plugins.map(p => {
      if (p.id === pluginId) {
        return {
          ...p,
          isConnected: true,
          configValues: configValues
        };
      }
      return p;
    });

    savePluginsState(updated);
    setConfiguringPluginId(null);
    showFeedback("success", `Successfully connected and saved configurations for ${plugins.find(p => p.id === pluginId)?.name}`);
  };

  const handleDisconnect = (pluginId: string) => {
    const updated = plugins.map(p => {
      if (p.id === pluginId) {
        return {
          ...p,
          isConnected: false,
          configValues: {}
        };
      }
      return p;
    });

    savePluginsState(updated);
    showFeedback("success", `Disconnected ${plugins.find(p => p.id === pluginId)?.name}`);
  };

  const handleAddCustomMcp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMcpName.trim() || !customMcpUrl.trim()) {
      showFeedback("error", "Plugin Name and Server URL are required.");
      return;
    }

    const newPlugin: Plugin = {
      id: `custom-mcp-${Date.now()}`,
      name: customMcpName.trim(),
      description: customMcpDesc.trim() || "User registered private Model Context Protocol (MCP) server endpoint.",
      category: "mcp",
      iconType: "mcp",
      isConnected: true,
      configSchema: [
        { label: "Server URL", key: "url", type: "text", placeholder: "e.g., http://localhost:3011" },
        { label: "Bearer Token", key: "token", type: "password", placeholder: "Optional Token" }
      ],
      configValues: { url: customMcpUrl.trim() }
    };

    const updated = [...plugins, newPlugin];
    savePluginsState(updated);

    // Reset inputs
    setCustomMcpName("");
    setCustomMcpUrl("");
    setCustomMcpDesc("");
    setIsAddingCustomMcp(false);
    showFeedback("success", `Custom MCP Server "${newPlugin.name}" successfully connected.`);
  };

  const handleDeleteCustomPlugin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = plugins.filter(p => p.id !== id);
    savePluginsState(updated);
    showFeedback("success", "Successfully deleted custom plugin.");
  };

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const getPluginIcon = (iconType: string) => {
    switch (iconType) {
      case "github":
        return <Github className="w-5 h-5 text-purple-400" />;
      case "slither":
        return <Shield className="w-5 h-5 text-amber-500" />;
      case "foundry":
        return <Terminal className="w-5 h-5 text-emerald-400" />;
      case "blockvision":
        return <Database className="w-5 h-5 text-sky-400" />;
      case "tenderly":
        return <Layers className="w-5 h-5 text-pink-400" />;
      default:
        return <Cpu className="w-5 h-5 text-[#0088FF]" />;
    }
  };

  // Filter plugins
  const filteredPlugins = plugins.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="plugins-container" className="flex-1 flex flex-col overflow-hidden bg-monad-deep p-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 shrink-0 border-b border-[#222631]/50 pb-4">
        <div>
          <h1 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <ToyBrick className="w-5.5 h-5.5 text-[#0088FF]" />
            MCP Integrations & Plugins
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your external Model Context Protocol (MCP) servers, auditing pipelines, and blockchain node connectors.
          </p>
        </div>
        
        <button
          onClick={() => setIsAddingCustomMcp(true)}
          className="bg-[#0088FF] hover:bg-[#0088FF]/90 text-white font-mono text-[11px] uppercase tracking-wider font-bold px-4 py-2 rounded-xl cursor-pointer shadow-lg shadow-[#0088FF]/10 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom MCP Server</span>
        </button>
      </div>

      {/* Global Toast Feedback */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`px-4 py-2.5 rounded-xl border font-mono text-xs flex items-center gap-2 shadow-xl z-50 fixed top-6 right-6 ${
              feedbackMessage.type === "success" 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {feedbackMessage.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedbackMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center shrink-0">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {["all", "mcp", "auditing", "blockchain", "tools"].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider font-mono transition-all cursor-pointer border ${
                selectedCategory === category
                  ? "bg-[#0088FF]/10 text-[#0088FF] border-[#0088FF]/30 font-semibold"
                  : "bg-[#0D0F14] text-gray-500 border-[#222631]/60 hover:text-gray-300 hover:border-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D0F14] border border-[#222631] rounded-xl pl-9.5 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0088FF]/50 transition-colors"
          />
        </div>
      </div>

      {/* Plugins Grid Layout */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlugins.map((plugin) => {
            const isConfiguring = configuringPluginId === plugin.id;
            return (
              <motion.div
                layout
                key={plugin.id}
                className={`bg-[#0D0F14] border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 relative group min-h-[220px] ${
                  plugin.isConnected 
                    ? "border-emerald-500/20 shadow-lg shadow-emerald-500/[0.02]" 
                    : "border-[#222631]/80 hover:border-[#222631]"
                }`}
              >
                <div>
                  {/* Card Title & Icon */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${
                        plugin.isConnected ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-[#14171E] border-[#222631]/60 text-gray-400"
                      }`}>
                        {getPluginIcon(plugin.iconType)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-xs text-white leading-tight">
                          {plugin.name}
                        </h3>
                        <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-gray-500 mt-0.5 block">
                          {plugin.category}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${plugin.isConnected ? "bg-emerald-500 animate-pulse" : "bg-gray-600"}`} />
                      <span className={`text-[10px] font-mono font-bold uppercase ${plugin.isConnected ? "text-emerald-400" : "text-gray-500"}`}>
                        {plugin.isConnected ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-gray-400 leading-relaxed font-light mb-4">
                    {plugin.description}
                  </p>
                </div>

                {/* Configuration details / buttons */}
                <div className="mt-auto pt-4 border-t border-[#222631]/40">
                  <AnimatePresence mode="wait">
                    {isConfiguring ? (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="space-y-3"
                      >
                        {plugin.configSchema.map((field) => (
                          <div key={field.key} className="space-y-1">
                            <label className="text-[10px] font-mono font-semibold text-gray-400 block uppercase">
                              {field.label}
                            </label>
                            {field.type === "select" ? (
                              <select
                                value={configValues[field.key] || ""}
                                onChange={(e) => setConfigValues({ ...configValues, [field.key]: e.target.value })}
                                className="w-full bg-[#14171E] border border-[#222631] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#0088FF]/50"
                              >
                                <option value="">Select option</option>
                                {field.options?.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={field.type}
                                placeholder={field.placeholder}
                                value={configValues[field.key] || ""}
                                onChange={(e) => setConfigValues({ ...configValues, [field.key]: e.target.value })}
                                className="w-full bg-[#14171E] border border-[#222631] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#0088FF]/50 font-mono"
                              />
                            )}
                          </div>
                        ))}
                        
                        <div className="flex items-center gap-2 pt-1.5">
                          <button
                            onClick={() => handleSaveConfig(plugin.id)}
                            className="flex-1 bg-[#0088FF] hover:bg-[#0088FF]/90 text-white font-mono text-[9px] uppercase tracking-wider font-bold py-1.5 rounded-lg cursor-pointer"
                          >
                            Save Connect
                          </button>
                          <button
                            onClick={() => setConfiguringPluginId(null)}
                            className="bg-[#14171E] hover:bg-[#1E222D] border border-[#222631] text-gray-400 font-mono text-[9px] uppercase tracking-wider font-semibold py-1.5 px-3 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        {plugin.isConnected ? (
                          <>
                            <button
                              onClick={() => handleStartConfigure(plugin)}
                              className="bg-[#14171E] hover:bg-[#1E222D] border border-[#222631] text-gray-300 hover:text-white font-mono text-[10px] uppercase font-bold py-2 px-3 rounded-xl cursor-pointer flex items-center gap-1.5"
                            >
                              <Settings2 className="w-3.5 h-3.5" />
                              <span>Configure</span>
                            </button>
                            
                            <div className="flex items-center gap-1.5">
                              {plugin.id.startsWith("custom-mcp-") && (
                                <button
                                  onClick={(e) => handleDeleteCustomPlugin(plugin.id, e)}
                                  className="p-2 rounded-xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-gray-500 hover:text-red-400 cursor-pointer"
                                  title="Remove Plugin"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleDisconnect(plugin.id)}
                                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 font-mono text-[10px] uppercase font-bold py-2 px-3 rounded-xl cursor-pointer"
                              >
                                Disconnect
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            onClick={() => handleStartConfigure(plugin)}
                            className="w-full bg-[#0088FF]/10 hover:bg-[#0088FF]/20 border border-[#0088FF]/30 text-[#0088FF] hover:text-white font-mono text-[10px] uppercase tracking-wider font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Link className="w-3.5 h-3.5" />
                            <span>Connect Integration</span>
                          </button>
                        )}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Custom MCP Addition Dialog overlay */}
      <AnimatePresence>
        {isAddingCustomMcp && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0D0F14] border border-[#222631] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="px-5 py-4 border-b border-[#222631]/50 flex items-center justify-between bg-[#14171E]/40">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                  <Cpu className="w-4.5 h-4.5 text-[#0088FF]" />
                  Add Custom MCP Server
                </h3>
                <button
                  onClick={() => setIsAddingCustomMcp(false)}
                  className="p-1 rounded-lg hover:bg-[#1E222D] text-gray-500 hover:text-gray-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomMcp} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-semibold text-gray-400 block uppercase">
                    Plugin / Server Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mythril-Analyzer-MCP"
                    value={customMcpName}
                    onChange={(e) => setCustomMcpName(e.target.value)}
                    className="w-full bg-[#14171E] border border-[#222631] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#0088FF]/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-semibold text-gray-400 block uppercase">
                    Server URL / Endpoint *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="e.g., http://localhost:3011"
                    value={customMcpUrl}
                    onChange={(e) => setCustomMcpUrl(e.target.value)}
                    className="w-full bg-[#14171E] border border-[#222631] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#0088FF]/50 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-semibold text-gray-400 block uppercase">
                    Description / Purpose
                  </label>
                  <textarea
                    placeholder="A brief explanation of what operations this custom MCP server enables..."
                    value={customMcpDesc}
                    onChange={(e) => setCustomMcpDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-[#14171E] border border-[#222631] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#0088FF]/50 resize-none font-light leading-normal"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#0088FF] hover:bg-[#0088FF]/90 text-white font-mono text-[11px] uppercase tracking-wider font-bold py-2.5 rounded-xl cursor-pointer"
                  >
                    Register & Connect
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustomMcp(false)}
                    className="bg-[#14171E] hover:bg-[#1E222D] border border-[#222631] text-gray-400 font-mono text-[11px] uppercase tracking-wider font-semibold py-2.5 px-4 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
