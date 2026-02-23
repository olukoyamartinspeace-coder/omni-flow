// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OmniIdentity.sol";

/**
 * @title OmniWallet
 * @dev A smart wallet that requires M-of-N factors to execute.
 *      Factors: Quantum Key, Behavioral Score (via Oracle), Biometric Proof.
 */
contract OmniWallet {
    OmniIdentity public identityRegistry;
    address public owner;
    
    // Thresholds
    uint256 public requiredConfirmations = 2;
    
    constructor(address _owner, address _registry) {
        owner = _owner;
        identityRegistry = OmniIdentity(_registry);
    }
    
    // Placeholder for executeTransaction
    function executeTransaction(address to, uint256 value, bytes memory data) external {
        require(msg.sender == owner, "Only owner");
        // Logic to verify multiple signatures would go here
        (bool success, ) = to.call{value: value}(data);
        require(success, "Tx failed");
    }
}

/**
 * @title MultiSigFactory
 * @dev Deploys new OmniWallets for users.
 */
contract MultiSigFactory {
    OmniIdentity public registry;

    event WalletCreated(address indexed user, address wallet);

    constructor(address _registry) {
        registry = OmniIdentity(_registry);
    }

    function createWallet() external returns (address) {
        OmniWallet wallet = new OmniWallet(msg.sender, address(registry));
        emit WalletCreated(msg.sender, address(wallet));
        return address(wallet);
    }
}
