import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import myVideo from "../../assets/myvideo.mp4";
import { 
  Shield, 
  Terminal, 
  Search, 
  ArrowRight, 
  Zap, 
  Cpu, 
  Network, 
  Database,
  Code,
  Lock,
  Compass,
  AlertTriangle,
  FileCode,
  Fingerprint,
  Activity,
  Radio,
  Eye,
  Workflow,
  ChevronDown
} from "lucide-react";

function AnimatedNumber({ value, duration = 800, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(elementRef, { once: true, margin: "-50px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView && !hasAnimated.current) {
      setDisplayValue(0);
      return;
    }
    hasAnimated.current = true;

    const start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const startTime = performance.now();
    let animationFrameId: number;

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      const current = start + (end - start) * easeProgress;
      
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(end);
      }
    };

    animationFrameId = requestAnimationFrame(updateNumber);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, isInView]);

  // Handle decimal or integer formatting
  const formatted = Number.isInteger(value) 
    ? Math.round(displayValue) 
    : displayValue.toFixed(1);

  return <span ref={elementRef}>{formatted}{suffix}</span>;
}

function BreathingDot({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0 items-center justify-center">
      {/* Outer breathing glow ring */}
      <motion.span
        animate={active ? { scale: [1, 1.8, 1], opacity: [0.15, 0.5, 0.15] } : {}}
        transition={active ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
        className={`absolute inline-flex rounded-full h-3 w-3 ${
          active ? "bg-blue-500" : "bg-neutral-600"
        }`}
      />
      {/* Inner solid core dot */}
      <motion.span 
        animate={active ? { opacity: [0.5, 1, 0.5] } : {}}
        transition={active ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
        className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
          active ? "bg-blue-500" : "bg-neutral-600"
        }`}
      />
    </span>
  );
}

interface LandingPageProps {
  onEnterApp: (initialAddress?: string) => void;
  rpcStatus: "active" | "offline" | "checking";
}

export default function LandingPage({ onEnterApp, rpcStatus }: LandingPageProps) {
  const [addressInput, setAddressInput] = useState("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
  const [isHovered, setIsHovered] = useState(false);
  const [scanTick, setScanTick] = useState(0);
  const [activeNodesCount, setActiveNodesCount] = useState(89);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Dynamic system status values
  const [threatLevel, setThreatLevel] = useState("LOW");
  const [networkGas, setNetworkGas] = useState(32);

  const sampleContracts = [
    { name: "Uniswap V2 Router", address: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", type: "DeFi Router" },
    { name: "WETH9 Monad Wrapper", address: "0x2e06c72e2cfbc39fbf9ccb648ffc73406f52809a", type: "Utility Token" },
    { name: "Gnosis Safe MultiSig", address: "0x3e5c63644e683549055b9be8653de26e0b4cd36e", type: "Security" },
  ];

  // Simulation loop for the live bytecode decompiler HUD
  const auditLogs = [
    { text: "INIT: Initializing bytecode analysis pipeline...", type: "info" },
    { text: "DISASM: Compiling bytecode stream to EVM opcodes", type: "info" },
    { text: "CHECK: Executing dynamic reentrancy assertions", type: "info" },
    { text: "CHECK: Auditing external contract delegation boundaries", type: "info" },
    { text: "RECON: Querying active storage slots via RPC client", type: "info" },
    { text: "ALERT: Potential unrestricted transfer detected in sendToken()", type: "warn" },
    { text: "SOLVER: Instantiating SMT solver logic remediation model", type: "info" },
    { text: "SECURE: Hotpatch instructions compiled and ready for review", type: "success" },
  ];

  useEffect(() => {
    const logInterval = setInterval(() => {
      setScanTick((prev) => (prev + 1) % auditLogs.length);
    }, 2800);

    const metricsInterval = setInterval(() => {
      setActiveNodesCount((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
      setNetworkGas((prev) => Math.max(20, Math.min(65, prev + Math.floor(Math.random() * 5 - 2))));
    }, 4000);

    return () => {
      clearInterval(logInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEnterApp(addressInput);
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-neutral-200 font-sans relative overflow-hidden flex flex-col justify-between selection:bg-blue-500/30 select-none">
      
      {/* Background MP4 Video with heavy black overlay and blur */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#07080d]">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover filter grayscale"
          style={{ opacity: 0.22 }}
        >
          <source src="https://cdn.sceneai.art/backgrounds/6371a324-aab1-4b5b-9242-29ebbdce3eae.mp4" type="video/mp4" />
        </video>
        {/* Blue/indigo colorizing overlay matching #5E6AD2 */}
        <div 
          className="absolute inset-0 bg-[#5E6AD2]" 
          style={{ mixBlendMode: "color", opacity: 0.7 }}
        />
        {/* Black overlay (40% opacity) with blur to ensure text readability */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[4px]" />
        
        {/* Seamless dark gradient on the top side to blend perfectly */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#07080d] to-transparent" />
        
        {/* Technical dot grid pattern */}
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-gradient-to-r from-[#060c18]/90 via-[#0a1b2d]/85 to-[#050b15]/90 border-b border-cyan-500/20 backdrop-blur-md shadow-[0_4px_30px_rgba(0,163,196,0.1)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Branding Logo - Minimal geometric representation */}
            <div className="relative shrink-0">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4H18C24.627 4 30 9.373 30 16C30 22.627 24.627 28 18 28H6V4ZM11 8V24H18C22.418 24 26 20.418 26 16C26 11.582 22.418 8 18 8H11Z" fill="#0088FF" />
                <path d="M14 12H17C19.209 12 21 13.791 21 16C21 18.209 19.209 20 17 20H14V12Z" fill="#ffff" fillOpacity="0.8" />
              </svg>
            </div>
            <div>
              <div className="font-sans font-bold text-lg text-white tracking-tight flex items-center gap-1.5 leading-none">
                DIFF-GUARD
                <span className="text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded font-mono font-medium uppercase tracking-widest">
                  PRO
                </span>
              </div>
              <div className="text-[8px] font-mono text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                EVM BYTECODE SEC OPS SUITE
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Real-time Threat Index Banner */}
            <div className="hidden lg:flex items-center gap-4 border-r border-neutral-900 pr-5">
              <div className="text-right leading-tight">
                <div className="text-[9px] text-neutral-500 uppercase font-mono font-bold tracking-wider">Threat level</div>
                <div className="text-xs text-neutral-300 font-mono font-semibold flex items-center gap-1 justify-end">
                  <Activity className="w-3 h-3 text-neutral-500" />
                  {threatLevel}
                </div>
              </div>
              <div className="text-right leading-tight">
                <div className="text-[9px] text-neutral-500 uppercase font-mono font-bold tracking-wider">Gas (gwei)</div>
                <div className="text-xs text-neutral-300 font-mono font-semibold">
                  <AnimatedNumber value={networkGas} /> gwei
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs">
              <BreathingDot active={rpcStatus === "active"} />
              <span className="font-mono text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                MONAD NODE: <span className="text-neutral-200 font-semibold">{rpcStatus === "active" ? "ONLINE" : "SYNCING"}</span>
              </span>
            </div>

            <button
              onClick={() => onEnterApp()}
              className="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              Console Ingress
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-10 md:pb-16 flex-1 flex flex-col items-center justify-center text-center">
        
        {/* Sleek Minimal System Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-900/60 border border-neutral-800 text-[9px] font-mono font-medium uppercase tracking-widest text-neutral-400 mb-8"
        >
          <Fingerprint className="w-3.5 h-3.5 text-blue-500" />
          Autonomous Bytecode Logic Sentry — V1.2.0-STABLE
        </motion.div>

        {/* Display Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-sans font-bold tracking-tight text-white leading-tight max-w-3xl"
        >
          Continuous Bytecode & Logic Auditing on <span className="text-blue-500 font-semibold">Monad Virtual Machine</span>
        </motion.h1>

        {/* Sub-heading */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs sm:text-sm text-neutral-400 font-light mt-4 max-w-xl leading-relaxed"
        >
          Decompile, emulate, and mitigate smart contract logic risks directly from compiled bytecode or live rpc addresses. Zero setups. Total security coverage.
        </motion.p>

        {/* Main Double Grid: interactive card + live analyzer HUD terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-5xl mt-12 text-left items-stretch">
          
          {/* Interactive Core Control Console Card (7 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-7 bg-neutral-950/40 backdrop-blur-md border border-neutral-800/80 rounded-xl p-6 sm:p-8 relative flex flex-col justify-between hover:-translate-y-1 hover:border-neutral-700 transition-all duration-150 ease-out"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-neutral-400">
                  SecOps Input Pipeline
                </span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight mb-2">
                Initiate Contract Audit
              </h2>
              <p className="text-xs text-neutral-400 leading-normal mb-6">
                Query contract storage structures, decompile verified or unverified bytecode, and isolate reentrancy or logic variables dynamically.
              </p>

              <form onSubmit={handleAuditSubmit} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                     type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="Enter Monad contract address (0x...)"
                    className="w-full bg-neutral-900/60 border border-neutral-800 focus:border-blue-500 text-white rounded-lg pl-10 pr-4 py-3.5 text-xs sm:text-sm font-mono focus:outline-none transition-all placeholder:text-neutral-600"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-[0.98]"
                  >
                    DEPLOY AUDIT ENGINE
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isHovered ? "translate-x-1" : ""}`} />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => onEnterApp()}
                    className="px-5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    title="Open empty console workspace"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Workspace</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Presets Section inside the core container with reveal & stagger */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-8 pt-6 border-t border-neutral-800/50"
            >
              <span className="text-[10px] tracking-widest text-neutral-500 uppercase font-bold block mb-3">
                Active Audit Targets (Monad Ecosystem)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {sampleContracts.map((contract, idx) => (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08, ease: "easeOut" }}
                    key={contract.address}
                    onClick={() => onEnterApp(contract.address)}
                    className="p-3 text-left bg-neutral-900/30 border border-neutral-800/50 hover:border-blue-500/80 rounded-lg hover:bg-neutral-900/60 hover:-translate-y-[2px] transition-all duration-150 ease-out cursor-pointer group"
                  >
                    <div className="text-[11px] font-semibold text-neutral-200 group-hover:text-white truncate">
                      {contract.name}
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[8.5px] font-mono text-neutral-500 truncate max-w-[100px]">
                        {contract.address}
                      </span>
                      <span className="text-[8px] bg-neutral-950/60 text-neutral-400 border border-neutral-800/80 px-1 py-0.5 rounded font-mono font-medium uppercase shrink-0">
                        {contract.type.split(" ")[0]}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Simulated Live Diagnostic Decompiler HUD Card (5 cols) */}
          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-5 bg-neutral-950/40 backdrop-blur-md border border-neutral-800/80 rounded-xl p-5 flex flex-col justify-between overflow-hidden relative hover:-translate-y-1 hover:border-neutral-700 transition-all duration-150 ease-out"
          >
            {/* Plain premium bordered header instead of traffic lights */}
            <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <BreathingDot active={true} />
                <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider">
                  decompiler_v1.2.sh
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8.5px] font-mono text-neutral-500 font-medium tracking-wider uppercase">
                  LIVE DECOMPILER STREAM
                </span>
              </div>
            </div>

            {/* Simulated Live Logging Lines */}
            <div className="flex-1 font-mono text-[10px] space-y-3 overflow-y-auto select-text leading-relaxed">
              <motion.div
                variants={{
                  initial: {},
                  animate: {
                    transition: {
                      staggerChildren: 0.08
                    }
                  }
                }}
                initial="initial"
                animate="animate"
                className="space-y-3"
              >
                {auditLogs.slice(0, scanTick + 1).map((log, index) => {
                  const isActive = index === scanTick;
                  const isAlert = log.text.startsWith("ALERT:");
                  
                  // Color code the logging texts with cohesive grayscale and sparse blue accent
                  let renderedText = null;
                  if (log.text.startsWith("ALERT:")) {
                    renderedText = (
                      <span className="text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800 inline-block font-medium">
                        {log.text}
                      </span>
                    );
                  } else if (log.text.startsWith("SECURE:")) {
                    renderedText = (
                      <span className="text-blue-500 font-semibold">
                        {log.text}
                      </span>
                    );
                  } else {
                    // Style label parts
                    const parts = log.text.split(":");
                    if (parts.length > 1) {
                      renderedText = (
                        <span>
                          <span className="text-neutral-400 font-bold">{parts[0]}:</span>
                          <span className="text-neutral-300">{parts.slice(1).join(":")}</span>
                        </span>
                      );
                    } else {
                      renderedText = <span className="text-neutral-300">{log.text}</span>;
                    }
                  }

                  return (
                    <motion.div 
                      key={index} 
                      variants={{
                        initial: { opacity: 0, y: 8 },
                        animate: { 
                          opacity: 1, 
                          y: 0,
                          transition: { duration: 0.25, ease: "easeOut" }
                        }
                      }}
                      animate={
                        isActive
                          ? {
                              opacity: 1,
                              y: 0,
                              backgroundColor: isAlert
                                ? ["rgba(239, 68, 68, 0.35)", "rgba(239, 68, 68, 0.05)", "rgba(0, 0, 0, 0)"]
                                : ["rgba(59, 130, 246, 0.15)", "rgba(59, 130, 246, 0.03)", "rgba(0, 0, 0, 0)"]
                            }
                          : {}
                      }
                      transition={
                        isActive 
                          ? { duration: isAlert ? 1.5 : 0.8, ease: "easeOut" }
                          : { duration: 0.25, ease: "easeOut" }
                      }
                      className={`pl-2.5 border-l border-neutral-800 transition-all duration-300 ${
                        isActive 
                          ? "border-blue-500 py-1" 
                          : "opacity-60"
                      }`}
                    >
                      <span className="text-neutral-600 mr-2">0{index + 1}:</span>
                      {renderedText}
                      {isActive && (
                        <motion.span 
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity, ease: v => Math.round(v) }}
                          className="text-blue-500 font-bold ml-1.5 inline-block font-sans"
                        >
                          ▉
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
                
                {/* Active-looking console line with blinking prompt in single accent color */}
                <motion.div 
                  variants={{
                    initial: { opacity: 0, y: 8 },
                    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } }
                  }}
                  className="pt-2 pl-2.5 flex items-center gap-1.5 font-mono text-[10px]"
                >
                  <span className="text-neutral-500">monad-cli:~$</span>
                  <span className="text-blue-500 font-bold animate-pulse">▉</span>
                  <span className="text-neutral-500 text-[9px] animate-pulse ml-1">awaiting instruction stream...</span>
                </motion.div>
              </motion.div>
            </div>

            {/* Static System Metric HUD Footer with reveal & hover animations */}
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-5 pt-4 border-t border-neutral-800/50 grid grid-cols-2 gap-3 shrink-0"
            >
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="bg-neutral-900/20 p-2.5 rounded-lg border border-neutral-800/60 hover:-translate-y-[2px] hover:border-blue-500/80 transition-all duration-150 ease-out cursor-pointer"
              >
                <div className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">RPC SOLVER ENGINE</div>
                <div className="text-xs font-mono font-bold text-neutral-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="text-neutral-200 font-semibold">
                    <AnimatedNumber value={99.8} suffix="%" />
                  </span>
                  <span className="text-neutral-500 font-normal text-[9px]">LATENCY</span>
                </div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                className="bg-neutral-900/20 p-2.5 rounded-lg border border-neutral-800/60 hover:-translate-y-[2px] hover:border-blue-500/80 transition-all duration-150 ease-out cursor-pointer"
              >
                <div className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">NODE CONNECTIONS</div>
                <div className="text-xs font-mono font-bold text-neutral-200 flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="text-blue-500 font-bold">
                    <AnimatedNumber value={activeNodesCount} />
                  </span>
                  <span className="text-neutral-500 font-normal text-[9px]">AGENTS</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

        </div>
      </main>

      {/* Body / Showcase Section Wrapper with Rich Tech Gradient */}
      <div className="relative z-10 w-full py-20 bg-[linear-gradient(135deg,#030611_48%,#00f5ff_48.15%,#01222d_48.4%,#000d12_100%)] border-t border-neutral-800/80">
        
        {/* Watch it Audit, Live Showcase Section */}
        <motion.section 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 bg-neutral-950/40 backdrop-blur-md overflow-hidden rounded-2xl border border-neutral-800/50"
        >
          {/* Ambient Aura Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-sky-950/20 via-indigo-950/10 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />

          {/* Header */}
          <div className="text-center relative z-10 mb-10">
            <span className="text-xs tracking-widest text-sky-500 font-mono uppercase text-center mb-3 block">
              A REAL DECOMPILE & AUDIT, START TO FINISH
            </span>
            <h2 className="text-5xl md:text-6xl font-extrabold text-neutral-100 tracking-tight text-center font-sans">
              watch it audit, live.
            </h2>
            <p className="text-neutral-400 font-light text-base md:text-lg max-w-2xl mx-auto text-center mt-4 leading-relaxed">
              An unedited run: Diff-Guard Pro targets the contract, decompiles the bytecode, maps state storage, and simulates the exploit. Every step streamed so you see exactly what it does.
            </p>
          </div>

          {/* Interactive Video Mockup Window */}
          <div className="relative z-10 max-w-7xl mx-auto rounded-2xl border border-neutral-800/80 bg-neutral-950/60 overflow-hidden shadow-2xl mt-12">
            {/* Window Title Bar */}
            <div className="bg-neutral-900/40 border-b border-neutral-800/50 px-4 py-3 flex items-center justify-between">
              {/* Left Side: Three colored OS window dots */}
              <div className="flex items-center gap-1.5 w-[52px]">
                <span className="w-3 h-3 rounded-full bg-red-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 block" />
              </div>
              {/* Center */}
              <div className="text-xs text-neutral-500 font-mono">
                diff-guard -- live-trace.sh
              </div>
              {/* Right Side spacer */}
              <div className="w-[52px]" />
            </div>

            {/* The Video Player Element */}
            <div className="relative w-full bg-neutral-950">
              <video 
                className="w-full h-auto block" 
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src={myVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </motion.section>

        {/* Feature Highlights Grid - Specific to Bytecode & Audit Data with reveal & hover animations */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 w-full max-w-4xl px-8 mt-16 text-left mx-auto"
        >
          
          {/* Card 1: Opcode Frequency Analyzer */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
            }}
            className="bg-neutral-950/40 border border-neutral-800/80 hover:border-blue-500/80 px-8 py-7 sm:px-9 sm:py-8 rounded-xl flex flex-col justify-between hover:-translate-y-[2px] hover:bg-neutral-900/10 transition-all duration-150 ease-out relative group overflow-hidden"
          >
            <div>
              {/* Bytecode Data Block */}
              <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-lg p-3.5 font-mono text-[9px] text-neutral-400 space-y-1.5 mb-4 select-none">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-1 text-neutral-500 font-bold uppercase tracking-wider text-[8px]">
                  <span>OPCODE</span>
                  <span>COUNT</span>
                  <span>GAS COST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-500 font-medium">0x55 SSTORE</span>
                  <span className="text-neutral-200">14</span>
                  <span>28,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">0x54 SLOAD</span>
                  <span className="text-neutral-200">32</span>
                  <span>6,400</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">0xF3 RETURN</span>
                  <span className="text-neutral-200">8</span>
                  <span>0</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-base font-bold text-neutral-100 tracking-tight">
                  Instruction Stream Parse
                </h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900/50 text-neutral-400 uppercase tracking-wider font-mono shrink-0">
                  BYTECODE
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                Run static parsing, categorize raw EVM instruction streams, and isolate anomalous delegative execution pathways.
              </p>
            </div>
          </motion.div>

          {/* Card 2: State Slot Mapper */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
            }}
            className="bg-neutral-950/40 border border-neutral-800/80 hover:border-blue-500/80 px-8 py-7 sm:px-9 sm:py-8 rounded-xl flex flex-col justify-between hover:-translate-y-[2px] hover:bg-neutral-900/10 transition-all duration-150 ease-out relative group overflow-hidden"
          >
            <div>
              {/* Storage Layout Data Block */}
              <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-lg p-3.5 font-mono text-[9px] text-neutral-400 space-y-1.5 mb-4 select-none">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-1 text-neutral-500 font-bold uppercase tracking-wider text-[8px]">
                  <span>SLOT OFFSET</span>
                  <span>TYPE DECLARATION</span>
                  <span>SIZE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-500 font-medium">[0x00]</span>
                  <span className="text-neutral-200">address owner</span>
                  <span>20 bytes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">[0x01]</span>
                  <span className="text-neutral-200">uint256 totalSupply</span>
                  <span>32 bytes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">[0x02]</span>
                  <span className="text-neutral-200">mapping(addr =&gt; bal)</span>
                  <span>slot ref</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-base font-bold text-neutral-100 tracking-tight">
                  State Storage Mapping
                </h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900/50 text-neutral-400 uppercase tracking-wider font-mono shrink-0">
                  STORAGE
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                Reconstruct the contract state layout variables and trace low-level storage modifications direct from raw slot offsets.
              </p>
            </div>
          </motion.div>

          {/* Card 3: SAT Solver */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
            }}
            className="bg-neutral-950/40 border border-neutral-800/80 hover:border-blue-500/80 px-8 py-7 sm:px-9 sm:py-8 rounded-xl flex flex-col justify-between hover:-translate-y-[2px] hover:bg-neutral-900/10 transition-all duration-150 ease-out relative group overflow-hidden"
          >
            <div>
              {/* Symbolic Verification Block */}
              <div className="bg-neutral-900/50 border border-neutral-800/60 rounded-lg p-3.5 font-mono text-[9px] text-neutral-400 space-y-1.5 mb-4 select-none">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-1 text-neutral-500 font-bold uppercase tracking-wider text-[8px]">
                  <span>LOGIC ASSERTION</span>
                  <span>PATH SOLVER</span>
                  <span>RESULT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-500 font-medium">REENTRANCY</span>
                  <span className="text-neutral-200">state_update &lt; call</span>
                  <span className="text-neutral-200 font-semibold">✓ OK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">OVERFLOW</span>
                  <span className="text-neutral-200">add(x,y) &gt;= x</span>
                  <span className="text-neutral-200 font-semibold">✓ OK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">DELEGATE_CALL</span>
                  <span className="text-neutral-200">target != msg.sender</span>
                  <span className="text-neutral-200 font-semibold">✓ OK</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-base font-bold text-neutral-100 tracking-tight">
                  Constraint Verification
                </h3>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-neutral-800 bg-neutral-900/50 text-neutral-400 uppercase tracking-wider font-mono shrink-0">
                  VERIFIER
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                Utilize mathematical symbolic execution to verify safety assertions and hotpatch vulnerabilities before mainnet actions.
              </p>
            </div>
          </motion.div>

        </motion.div>

      </div>

      {/* FAQ Section */}
      <section className="w-full bg-[#0B0F19] py-24 px-4 flex flex-col items-center justify-center relative z-10 border-t border-neutral-950">
        <div className="w-full max-w-3xl mx-auto text-center mb-12">
          <span className="text-cyan-400 font-mono text-xs tracking-widest uppercase mb-3 block select-none">FAQ</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">questions, answered.</h2>
        </div>

        <div className="w-full max-w-3xl mx-auto">
          {[
            { q: "What is DiffGuard?", a: "An automated testing tool that catches consensus and optimization bugs on Monad." },
            { q: "How does it find bugs?", a: "It runs 5,000+ chaotic transactions through Monad and Ethereum simultaneously to check if balances match perfectly." },
            { q: "What inputs do I need?", a: "Just your smart contract bytecode or RPC addresses. No custom scripting required." },
            { q: "What happens when a bug is found?", a: "The engine instantly stops testing, alerts you, and locks down the exact transaction that failed." },
            { q: "Why is this needed for Monad?", a: "It guarantees that Monad's ultra-fast parallel processing matches standard Ethereum behavior with 100% accuracy." }
          ].map((item, idx) => {
            const isOpen = activeIndex === idx;
            return (
              <div 
                key={idx} 
                className="bg-[#131926] border border-zinc-800 rounded-xl mb-4 overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => setActiveIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left text-white hover:bg-zinc-800/20 transition-colors cursor-pointer select-none"
                >
                  <span className="font-semibold text-base md:text-lg text-white">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 text-cyan-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out px-6 ${
                    isOpen ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <p className="text-zinc-400 font-mono text-sm leading-relaxed border-t border-zinc-800/50 pt-3">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <div className="relative w-full py-28 bg-[#060B14] overflow-hidden flex flex-col items-center justify-center text-center px-6 border-t border-neutral-900/60">
        {/* Subtle diffuse radial cyan glow centered underneath the button */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">
            start building with diffguard.
          </h2>
          <p className="text-sm md:text-base text-neutral-400 max-w-lg mx-auto mb-10 font-light leading-relaxed">
            The ultimate differential testing and continuous transaction search engine layout for ultra-high performance EVM environments.
          </p>

          <button
            onClick={() => onEnterApp()}
            className="px-8 py-4 rounded-full bg-cyan-500 text-neutral-950 font-bold text-sm tracking-wide hover:bg-cyan-400 transition-all duration-200 cursor-pointer shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_40px_rgba(6,182,212,0.55)] active:scale-95"
          >
            Launch App
          </button>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-neutral-900 py-6 px-6 text-center bg-neutral-950/40 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
          <div>
            &copy; 2026 DIFF-GUARD SYSTEMS. CONTINUOUS DEPLOYMENT SECURITY FOR THE MONAD NETWORK.
          </div>
          <div className="flex gap-4 items-center">
            <Radio className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-400 uppercase font-bold flex items-center gap-1.5">
              ALL SYSTEMS OPERATIONAL
            </span>
            <span className="text-neutral-800">|</span>
            <span>V1.2.0-STABLE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
