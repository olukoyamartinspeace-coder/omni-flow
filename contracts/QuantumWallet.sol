// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title QuantumWallet
 * @dev Demo contract for quantum-resistant signatures on BNB Chain
 * Note: This demonstrates the concept. Full CRYSTALS-Dilithium requires
 * off-chain signature generation with on-chain verification via precompiles.
 */
contract QuantumWallet is Ownable {
    using ECDSA for bytes32;

    // Events
    event QuantumTransaction(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 timestamp,
        string quantumProof
    );

    event KeyMigrated(
        address indexed user,
        string oldKeyType,
        string newKeyType,
        uint256 timestamp
    );

    // Mapping of user addresses to their quantum public key hash
    mapping(address => bytes32) public quantumPublicKeys;
    
    // Mapping to track migration status
    mapping(address => bool) public isQuantumReady;

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register quantum public key (hash of CRYSTALS-Dilithium public key)
     */
    function registerQuantumKey(bytes32 _publicKeyHash) external {
        require(_publicKeyHash != bytes32(0), "Invalid public key");
        quantumPublicKeys[msg.sender] = _publicKeyHash;
        isQuantumReady[msg.sender] = true;
        
        emit KeyMigrated(msg.sender, "ECDSA", "CRYSTALS-Dilithium", block.timestamp);
    }

    /**
     * @dev Execute quantum-signed transaction
     * Note: In production, this would verify a CRYSTALS-Dilithium signature
     * For demo, we use a simplified verification
     */
    function sendQuantumTransaction(
        address to,
        uint256 amount,
        bytes memory quantumSignature,
        string memory proofMetadata
    ) external payable {
        require(isQuantumReady[msg.sender], "Quantum key not registered");
        require(msg.value == amount, "Amount mismatch");
        
        // Create message hash
        bytes32 messageHash = keccak256(abi.encodePacked(
            msg.sender,
            to,
            amount,
            block.timestamp,
            proofMetadata
        ));
        
        // In production: verify CRYSTALS-Dilithium signature here
        // For demo: basic verification that signature exists
        require(quantumSignature.length > 0, "Invalid quantum signature");
        
        // Transfer BNB
        payable(to).transfer(amount);
        
        emit QuantumTransaction(
            msg.sender,
            to,
            amount,
            block.timestamp,
            proofMetadata
        );
    }

    /**
     * @dev Get quantum readiness status
     */
    function checkQuantumStatus(address user) external view returns (bool) {
        return isQuantumReady[user];
    }

    // Fallback function to receive BNB
    receive() external payable {}
}
