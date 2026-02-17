// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OmniIdentity
 * @dev Stores Quantum-Resistant Identity components on-chain.
 *      Maps addresses to their Dilithium/Kyber public keys.
 */
contract OmniIdentity {
    
    struct Identity {
        bytes dilithiumPublicKey; // Post-Quantum Signing Key
        bytes kyberPublicKey;     // Post-Quantum Encryption Key
        bytes32 bioHash;          // Hash of composite biometrics (Iris+Vein+Heart)
        bool isActive;
        uint256 lastActiveTimestamp;
    }

    mapping(address => Identity) public identities;

    event IdentityRegistered(address indexed user, bytes32 bioHash);
    event IdentityRevoked(address indexed user);

    /**
     * @dev Register a new Quantum Identity.
     *      In production, this would require a ZK Proof of the bioHash generation.
     */
    function registerIdentity(
        bytes memory _dilithiumPK, 
        bytes memory _kyberPK, 
        bytes32 _bioHash
    ) external {
        require(!identities[msg.sender].isActive, "Identity already exists");
        
        identities[msg.sender] = Identity({
            dilithiumPublicKey: _dilithiumPK,
            kyberPublicKey: _kyberPK,
            bioHash: _bioHash,
            isActive: true,
            lastActiveTimestamp: block.timestamp
        });

        emit IdentityRegistered(msg.sender, _bioHash);
    }

    /**
     * @dev Returns the Quantum Public Keys for a user.
     *      Used by other contracts to verify signatures off-chain or via precompile.
     */
    function getPublicKeys(address _user) external view returns (bytes memory, bytes memory) {
        require(identities[_user].isActive, "Identity not active");
        return (identities[_user].dilithiumPublicKey, identities[_user].kyberPublicKey);
    }
}
