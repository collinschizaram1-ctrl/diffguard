# DiffGuard — EVM Parallel Security Auditor for Monad

**Identify parallel-execution contention bottlenecks and critical smart contract 
vulnerabilities, built specifically for Monad's high-throughput execution model.**

🔗 **Live app:** https://diffguard-production.up.railway.app  
🔗 **Verified deployed contract:** [0x0AE45262C758Bf747024Ddb7aFb029215F259A78](https://testnet.monadexplorer.com/contracts/full_match/10143/0x0AE45262C758Bf747024Ddb7aFb029215F259A78/) (Monad Testnet)

---

## Problem

Monad's core value proposition is parallel transaction execution — much higher 
throughput than sequential EVM chains, without requiring developers to write 
different code. But that promise only holds if contracts are actually written 
in a way that *allows* parallel execution. A contract can pass every standard 
security audit and still silently defeat Monad's performance advantage — simply 
by writing to a single shared storage slot (like a global counter) on every 
transaction. Generic auditing tools (Slither, MythX, standard AI code review) 
have no concept of this failure mode, because they were built for chains where 
execution order doesn't affect throughput.

## Solution

DiffGuard combines standard smart contract security analysis (reentrancy, 
access control, via Slither and Gemini AI) with a **custom-built static 
analysis detector** that specifically identifies Monad parallel-execution 
contention bottlenecks — shared scalar state variables that force transaction 
serialization under Monad's optimistic parallel execution engine. This is not 
a repackaged existing tool; the contention detector is original code built on 
top of Slither's Python API, targeting a vulnerability class unique to 
parallel-execution chains.

## Features

- **Multi-source audit engine**: Gemini AI + Slither + custom Monad contention 
  detector, merged into a single findings panel with severity scoring
- **Live verified-contract analysis**: paste any Monad-verified contract 
  address, and DiffGuard fetches real source via the MonadScan API and audits 
  it live — not limited to pre-loaded samples
- **Curated demo contracts**: two intentionally vulnerable sample contracts 
  (Monad Lending Pool, Parallel AMM Swap) for guaranteed, reliable 
  demonstration of every finding category
- **AI-powered triage**: ranks findings by real-world exploit risk with 
  reasoning, not just static severity labels
- **AI-suggested fixes**: generates corrected, compilable code for individual 
  findings, including sharding strategies for contention bottlenecks
- **CI/CD security gate**: a GitHub Actions workflow that runs the full audit 
  pipeline on every pull request and **blocks merges** containing 
  CRITICAL/HIGH severity findings — see `.github/workflows/diffguard-audit.yml`
- **Recon tool**: live RPC inspection of any Monad address (balance, bytecode 
  size, transaction count, contract type)
- **Scoped security assistant**: a lightweight chatbot answering questions 
  about Monad's execution model and contract security concepts

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js/Express, spawning Python subprocesses for analysis
- Analysis: Slither (static analysis), custom Python contention detector, 
  Google Gemini API
- Deployment: Docker container on Railway
- CI/CD: GitHub Actions

## Running Locally

```bash
# Backend/analysis dependencies
pip install slither-analyzer solc-select
solc-select install 0.8.20 && solc-select use 0.8.20

# App dependencies
npm install

# Environment variables (create a .env file)
GEMINI_API_KEY=your_key_here
MONADSCAN_API_KEY=your_key_here

# Run
npm run dev
```

## The Custom Detector

`scripts/monad_contention_detector.py` is a standalone, independently testable 
static analyzer built on Slither's Python API. It flags state variables that 
are shared, non-partitioned scalars (not mappings/arrays) written by 
externally-callable, non-admin-gated functions — the exact pattern that 
creates storage contention under Monad's parallel execution.

Run it directly:
```bash
python scripts/monad_contention_detector.py contracts/MonadLendingPool.sol
```

## CI/CD Gate

Every pull request automatically runs Slither and the custom contention 
detector against changed `.sol` files. If any CRITICAL or HIGH severity 
finding is present, the check fails and blocks the merge — see a real example 
of this catching a genuine bug: [link to your Actions run screenshot/URL if 
you have one].

## Roadmap

- Auto-fix pull requests: automatically open a PR with the corrected code for 
  a given finding
- Continuous post-deployment monitoring: re-scan contracts after upgrades, 
  not just pre-deployment
- Public "Audited by DiffGuard" trust badge for verified contracts

## License

MIT