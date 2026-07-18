<div align="center">

# 🛡️ DiffGuard

**EVM Parallel Security Auditor for Monad**

[![Live App](https://img.shields.io/badge/App-Live-22c55e?style=flat-square&labelColor=0a0f14)](https://diffguard-production.up.railway.app)
[![Network](https://img.shields.io/badge/Monad-Testnet-6366f1?style=flat-square&labelColor=0a0f14)](https://testnet.monadexplorer.com)
[![Contract](https://img.shields.io/badge/Contract-Verified-0ea5e9?style=flat-square&labelColor=0a0f14)](https://testnet.monadexplorer.com/contracts/full_match/10143/0x0AE45262C758Bf747024Ddb7aFb029215F259A78/)
[![License](https://img.shields.io/badge/License-MIT-red?style=flat-square&labelColor=0a0f14)](LICENSE)

Identify parallel-execution contention bottlenecks and critical smart contract 
vulnerabilities — built specifically for Monad's high-throughput execution model.

</div>

---

## The Problem

Monad's core promise is parallel transaction execution — much higher throughput 
than sequential EVM chains, without requiring developers to rewrite their code. 
But that promise only holds if a contract actually *allows* parallel execution. 
A contract can pass every standard audit and still silently defeat Monad's 
performance advantage — simply by writing to one shared storage slot on every 
transaction. Generic tools (Slither, MythX, standard AI review) have no concept 
of this, because they were built for chains where execution order doesn't 
affect throughput.

## The Solution

DiffGuard runs standard security analysis (reentrancy, access control — via 
Slither and Gemini AI) **alongside a custom-built detector for Monad-specific 
contention bugs** — a vulnerability class no off-the-shelf tool can catch, 
because none of them know Monad's parallel execution model exists.









---

## Features

| Feature | What it does |
|---|---|
| **Multi-source audit engine** | Gemini AI + Slither + custom Monad contention detector, merged into one findings panel |
| **Live verified-contract analysis** | Paste any Monad-verified address — DiffGuard fetches real source via the MonadScan API and audits it live |
| **Curated demo contracts** | Two intentionally vulnerable sample contracts for reliable, repeatable demonstration |
| **AI-powered triage** | Ranks findings by real-world exploit risk with reasoning, not just static severity |
| **AI-suggested fixes** | Generates corrected, compilable code per finding, including sharding strategies for contention bugs |
| **CI/CD security gate** | GitHub Actions workflow that blocks merges containing CRITICAL/HIGH findings — [see it catch a real bug](.github/workflows/diffguard-audit.yml) |
| **Recon tool** | Live RPC inspection of any Monad address — balance, bytecode size, tx count, contract type |
| **Pentest Notebook** | Persistent workspace for tracking findings and notes across audit sessions |
| **Plugin system** | Extensible tooling layer for adding new analysis modules |
| **Scoped security assistant** | Lightweight chatbot answering questions about Monad's execution model and contract security — deliberately narrow scope, doesn't generate unrelated code |

## Analysis Pipeline


Contract Address / Source
│
▼
MonadScan API   (fetch verified source, if available)
│
├── Slither              → reentrancy, access control
├── Custom Detector       → Monad parallel contention bottlenecks
└── Gemini AI             → triage, remediation suggestions
│
▼
Merged Findings Panel  (severity-scored, ranked, fixable)



## The Custom Detector

`scripts/monad_contention_detector.py` is a standalone, independently testable 
static analyzer built on Slither's Python API. It flags state variables that 
are shared, non-partitioned scalars (not mappings/arrays) written by 
externally-callable, non-admin-gated functions — the exact pattern that 
creates storage contention under Monad's parallel execution.

```bash
python scripts/monad_contention_detector.py contracts/MonadLendingPool.sol
```

## CI/CD Gate

Every pull request automatically runs the full audit pipeline against changed 
`.sol` files. Any CRITICAL or HIGH severity finding **fails the check and 
blocks the merge** — proven live: [`DiffGuard Contract Audit #1`](https://github.com/collinschizaram1-ctrl/diffguard/actions/runs/29571632345) 
correctly caught and blocked a real HIGH severity contention finding.

## Running Locally

```bash
# Analysis dependencies
pip install slither-analyzer solc-select
solc-select install 0.8.20 && solc-select use 0.8.20

# App dependencies
npm install

# Environment (.env)
GEMINI_API_KEY=your_key_here
MONADSCAN_API_KEY=your_key_here

npm run dev
```

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js/Express, spawning Python subprocesses for analysis
- **Analysis:** Slither, custom Python detector, Google Gemini API
- **Deployment:** Docker container on Railway
- **CI/CD:** GitHub Actions

## What's Coming

- Auto-fix pull requests: automatically open a PR with corrected code for a finding
- Continuous post-deployment monitoring: re-scan contracts after upgrades, not just pre-deployment
- Public "Audited by DiffGuard" trust badge for verified contracts

## Verified Deployment

Demo contract deployed and verified on Monad Testnet:  
**`0x0AE45262C758Bf747024Ddb7aFb029215F259A78`**  
[View verified source →](https://testnet.monadexplorer.com/contracts/full_match/10143/0x0AE45262C758Bf747024Ddb7aFb029215F259A78/)

## License

MIT