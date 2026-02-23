import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("QuantumWallet", function () {
    let QuantumWallet;
    let quantumWallet;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        QuantumWallet = await ethers.getContractFactory("QuantumWallet");
        quantumWallet = await QuantumWallet.deploy();
        await quantumWallet.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should deploy successfully", async function () {
            expect(quantumWallet.target).to.not.be.empty;
        });
    });

    describe("Quantum Key Registration", function () {
        it("Should register quantum public key", async function () {
            const publicKeyHash = ethers.keccak256(
                ethers.toUtf8Bytes("demo-quantum-key-123")
            );

            await quantumWallet.connect(addr1).registerQuantumKey(publicKeyHash);

            const isReady = await quantumWallet.checkQuantumStatus(addr1.address);
            expect(isReady).to.be.true;
        });
    });

    describe("Quantum Transaction", function () {
        it("Should send quantum-signed transaction", async function () {
            // Register key first
            const publicKeyHash = ethers.keccak256(
                ethers.toUtf8Bytes("demo-key")
            );
            await quantumWallet.connect(addr1).registerQuantumKey(publicKeyHash);

            // Send transaction
            const amount = ethers.parseEther("0.01");
            const quantumSignature = ethers.toUtf8Bytes("demo-signature");
            const proofMetadata = "Quantum proof: CRYSTALS-Dilithium Level 5";

            await expect(
                quantumWallet.connect(addr1).sendQuantumTransaction(
                    addr2.address,
                    amount,
                    quantumSignature,
                    proofMetadata,
                    { value: amount }
                )
            ).to.changeEtherBalances(
                [addr1, addr2],
                [-amount, amount]
            );
        });
    });
});
