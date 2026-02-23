const hre = require("hardhat");

async function main() {
    console.log("Deploying QuantumWallet to BNB Testnet...");

    // Get the contract factory
    const QuantumWallet = await hre.ethers.getContractFactory("QuantumWallet");

    // Deploy contract
    const quantumWallet = await QuantumWallet.deploy();

    await quantumWallet.deployed();

    console.log(`QuantumWallet deployed to: ${quantumWallet.address}`);
    console.log(`Network: ${hre.network.name}`);

    // Verify contract on BSCScan (optional)
    if (hre.network.name === "bscTestnet") {
        console.log("Waiting for block confirmations...");
        await quantumWallet.deployTransaction.wait(5);

        await hre.run("verify:verify", {
            address: quantumWallet.address,
            constructorArguments: [],
        });
        console.log("Contract verified on BSCScan");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
