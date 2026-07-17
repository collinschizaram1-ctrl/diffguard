"""
monad_contention_detector.py
========================================
Custom static-analysis detector for Monad-specific parallel-execution
contention bugs, built on top of Slither's Python API.

THE BUG CLASS THIS DETECTS:
    Under Monad's optimistic parallel execution, transactions that write to
    the SAME storage slot conflict and force retries/aborts. A mapping like
    `balances[msg.sender]` is naturally safe - different users write to
    different slots. But a single scalar like `uint256 public globalTxCount`
    that's incremented on every call becomes a serialization bottleneck:
    every concurrent caller collides on the exact same slot.

    This bug class doesn't exist on sequential Ethereum (it's just a gas
    cost there) - it only becomes a genuine execution-conflict issue under
    a parallel EVM like Monad's. Generic auditors (Slither's built-in
    detectors, MythX, etc.) have no concept of this, because they don't
    know Monad's execution model exists.

Usage:
    pip install slither-analyzer
    python monad_contention_detector.py path/to/Contract.sol
"""

import json
import sys

from slither import Slither
from slither.core.declarations import Function
from slither.core.variables.state_variable import StateVariable
from slither.core.solidity_types.mapping_type import MappingType
from slither.core.solidity_types.array_type import ArrayType


def is_hot_scalar(var: StateVariable) -> bool:
    """
    A 'hot' scalar is a state variable that is NOT a mapping or array.
    Mappings/arrays naturally shard writes across many storage slots
    (one per key/index). A bare scalar has exactly ONE slot for the
    entire contract, so every write to it is a potential collision
    point between unrelated concurrent transactions.
    """
    return not isinstance(var.type, (MappingType, ArrayType))


def function_writes_variable(function: Function, var: StateVariable) -> bool:
    """Check if `function` writes to state variable `var` anywhere in its body."""
    for node in function.nodes:
        if var in node.state_variables_written:
            return True
    return False


ADMIN_MODIFIER_KEYWORDS = ("owner", "admin", "onlyowner", "onlyadmin", "governance")


def is_admin_gated(function: Function) -> bool:
    """
    A function gated by an owner/admin-style modifier is called rarely, by a
    single privileged address - it's not a genuine concurrency hotspot, since
    many different users aren't racing to call it at once.
    """
    for modifier in function.modifiers:
        if any(keyword in modifier.name.lower() for keyword in ADMIN_MODIFIER_KEYWORDS):
            return True
    return False


def analyze(contract_path: str):
    slither = Slither(contract_path)
    findings = []

    for contract in slither.contracts:
        if contract.is_interface or contract.is_library:
            continue

        hot_scalars = [v for v in contract.state_variables if is_hot_scalar(v)]

        for var in hot_scalars:
            writer_functions = []
            for function in contract.functions:
                if not function.is_implemented:
                    continue
                # Only externally-reachable, state-changing functions matter -
                # a private helper can't be called concurrently by different users.
                if function.visibility not in ("public", "external"):
                    continue
                if function.view or function.pure:
                    continue
                if function.is_constructor:
                    continue
                if is_admin_gated(function):
                    continue
                if function_writes_variable(function, var):
                    writer_functions.append(function.name)

            writer_functions = sorted(set(writer_functions))

            if writer_functions:
                severity = "HIGH" if len(writer_functions) >= 2 else "MEDIUM"
                findings.append({
                    "contract": contract.name,
                    "variable": var.name,
                    "type": str(var.type),
                    "written_by": writer_functions,
                    "severity": severity,
                    "title": "Parallel EVM State Contention Bottleneck",
                    "message": (
                        f"State variable '{var.name}' ({var.type}) is a shared, "
                        f"non-partitioned scalar written by external function(s) "
                        f"{', '.join(writer_functions)}. Under Monad's optimistic "
                        f"parallel execution, every concurrent call to these "
                        f"functions by different users will contend for this "
                        f"single storage slot, forcing transaction retries/aborts "
                        f"and serializing execution that should otherwise run in "
                        f"parallel. Consider sharding this counter (e.g. per-user "
                        f"or per-shard accumulators, reconciled asynchronously) "
                        f"if high concurrent throughput is expected."
                    ),
                })

    return findings


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python monad_contention_detector.py <path_to_contract.sol>")
        sys.exit(1)

    results = analyze(sys.argv[1])

    if not results:
        print(json.dumps({"status": "clean", "findings": []}, indent=2))
    else:
        print(json.dumps({"status": "issues_found", "findings": results}, indent=2))
