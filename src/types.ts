/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SourceFile {
  name: string;
  path: string;
  content: string;
}

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "gas" | "info";

export interface AuditFinding {
  id: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  remediation: string;
  filePath: string;
  line?: number;
  codeSnippet?: string;
}

export interface AuditReport {
  contractAddress: string;
  name: string;
  timestamp: string;
  score: number; // 0 to 100 security score
  stats: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    gas: number;
    info: number;
  };
  findings: AuditFinding[];
}

export interface SandboxCommand {
  id: string;
  command: string;
  timestamp: string;
  status: "success" | "running" | "failed";
  output: string;
}

export interface NetworkConfig {
  rpcUrl: string;
  chainId: number;
  explorerUrl: string;
  name: string;
}

export type ActiveView = "audit" | "recon" | "sandbox" | "settings";


