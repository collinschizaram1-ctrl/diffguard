// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MonadLendingPool
 * @dev Highly vulnerable Lending Pool contract highlighting parallel EVM bottlenecks
 * and standard EVM reentrancy vulnerabilities.
 */
contract MonadLendingPool {
    mapping(address => uint256) public balances;
    uint256 public totalPoolDeposits;
    address public owner;
    bool public paused;
    
    // STORAGE CONTENTION BOTTLENECK (Monad parallel transaction conflict point)
    // Writing to this single global counter on every deposit/withdrawal causes
    // state-variable contention, preventing Monad's optimistic parallel execution
    // engine from scheduling these transactions simultaneously.
    uint256 public globalTxCount;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    // Unprotected initialization vulnerability
    function initialize() external {
        owner = msg.sender;
    }

    function deposit() external payable whenNotPaused {
        require(msg.value > 0, "Cannot deposit 0");
        
        // Critical: storage contention bottleneck
        globalTxCount += 1;
        
        balances[msg.sender] += msg.value;
        totalPoolDeposits += msg.value;
        
        emit Deposited(msg.sender, msg.value);
    }

    // REENTRANCY VULNERABILITY
    // Sends ether to caller before updating balance mapping.
    // Extremely dangerous, easily drained.
    function withdraw(uint256 _amount) external whenNotPaused {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        
        // Critical: storage contention bottleneck
        globalTxCount += 1;
        
        // External call before state update - classic Reentrancy
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= _amount;
        totalPoolDeposits -= _amount;
        
        emit Withdrawn(msg.sender, _amount);
    }

    function togglePause() external onlyOwner {
        paused = !paused;
    }

    // Emergency withdrawal that doesn't check pause
    function emergencyWithdrawAll() external {
        uint256 userBalance = balances[msg.sender];
        require(userBalance > 0, "No balance");
        
        (bool success, ) = msg.sender.call{value: userBalance}("");
        require(success, "Emergency withdraw failed");
        
        balances[msg.sender] = 0;
        totalPoolDeposits -= userBalance;
    }
}
