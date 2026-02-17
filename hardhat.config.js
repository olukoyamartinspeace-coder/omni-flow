import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "b19b57e761404dfaad6d8e2eeb31aa5e";
const OPBNB_RPC_URL = process.env.OPBNB_RPC_URL || "https://opbnb-mainnet.infura.io/v3/b19b57e761404dfaad6d8e2eeb31aa5e";

export default {
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        bscTestnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545",
            chainId: 97,
            gasPrice: 20000000000,
            accounts: [PRIVATE_KEY]
        },
        bscMainnet: {
            url: "https://bsc-dataseed.binance.org/",
            chainId: 56,
            gasPrice: 5000000000,
            accounts: [PRIVATE_KEY]
        },
        opbnbMainnet: {
            url: OPBNB_RPC_URL,
            chainId: 204,
            accounts: [PRIVATE_KEY]
        }
    },
    etherscan: {
        apiKey: {
            bscTestnet: BSCSCAN_API_KEY,
            bsc: BSCSCAN_API_KEY
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};
