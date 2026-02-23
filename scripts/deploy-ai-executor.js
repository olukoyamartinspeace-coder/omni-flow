const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("Deploying AITradingExecutor to opBNB Mainnet...");

    // opBNB Mainnet addresses
    const PANCAKE_ROUTER = "0x1b81D678ffb9C0263b24A97847620C99d213eB14"; // PancakeSwap on opBNB
    const WBNB = "0x4200000000000000000000000000000000000006"; // WBNB on opBNB

    const AITradingExecutor = await hre.ethers.getContractFactory("AITradingExecutor");
    const executor = await AITradingExecutor.deploy(PANCAKE_ROUTER, WBNB);

    // Handling both Ethers v5 (deployed()) and v6 (waitForDeployment())
    if (executor.deployed) {
        await executor.deployed();
    } else if (executor.waitForDeployment) {
        await executor.waitForDeployment();
    }

    const address = executor.address || (executor.target);

    console.log(`AITradingExecutor deployed to: ${address}`);
    console.log(`Network: ${hre.network.name}`);
    console.log(`Router: ${PANCAKE_ROUTER}`);
    console.log(`WBNB: ${WBNB}`);

    // Save deployment info
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }

    const deploymentInfo = {
        address: address,
        network: hre.network.name,
        router: PANCAKE_ROUTER,
        wbnb: WBNB,
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
        path.join(deploymentsDir, 'ai-executor-deployment.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("Deployment info saved to deployments/ai-executor-deployment.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
