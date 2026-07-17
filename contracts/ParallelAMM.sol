// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ParallelAMM
 * @dev Liquidity Pool Swap with slippage vulnerabilities and storage design flaws.
 */
contract ParallelAMM {
    mapping(address => uint256) public tokenReserves;
    uint256 public constant PRECISION = 1e18;
    
    // Gas unoptimized storage for gas check demonstration
    address[] public registeredSwappers;
    
    // State contention point
    uint256 public globalVolumeUSD;

    event Swapped(address indexed swapper, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

    // Dynamic array lookup inside loop - major gas bottleneck
    function isSwapperRegistered(address _swapper) public view returns (bool) {
        for (uint256 i = 0; i < registeredSwappers.length; i++) {
            if (registeredSwappers[i] == _swapper) {
                return true;
            }
        }
        return false;
    }

    function registerSwapper(address _swapper) external {
        if (!isSwapperRegistered(_swapper)) {
            registeredSwappers.push(_swapper);
        }
    }

    // DIVIDE BY ZERO / ARITHMETIC VULNERABILITY
    // If reserves are 0, this will revert or crash.
    // Also lack of slippage control parameter exposes users to sandwich attacks.
    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be > 0");
        
        uint256 reserveIn = tokenReserves[tokenIn];
        uint256 reserveOut = tokenReserves[tokenOut];
        
        // Critical: division by zero if reserveIn is 0
        // No checks on inputs, leading to smart contract math errors
        amountOut = (amountIn * reserveOut) / (reserveIn + amountIn);
        
        // Update reserve balances (Mock implementation of reserve updates)
        tokenReserves[tokenIn] += amountIn;
        tokenReserves[tokenOut] -= amountOut;
        
        // Storage contention bottleneck
        globalVolumeUSD += amountIn * 2; // Simulated volume
        
        emit Swapped(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }
}
