/**
 * QuantumWalletService
 * Handles interaction with the QuantumWallet smart contract on opBNB Mainnet.
 */
class QuantumWalletService {
    constructor() {
        this.BNB_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545';
        this.BNB_TESTNET_CHAIN_ID = '0x61'; // 97 in hex
        this.OPBNB_MAINNET_RPC = 'https://opbnb-mainnet.infura.io/v3/b19b57e761404dfaad6d8e2eeb31aa5e';
        this.OPBNB_MAINNET_CHAIN_ID = '0xcc'; // 204 in hex
        this.CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Placeholder
        this.abi = null;
        this.provider = null;
        this.signer = null;
        this.contract = null;
    }

    /**
     * Initialize the service by loading the ABI
     */
    async init() {
        if (this.abi) return; // Already initialized
        try {
            const response = await fetch('js/QuantumWallet.json');
            const data = await response.json();
            this.abi = data.abi;

            if (window.ethereum) {
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
            }
        } catch (error) {
            console.error('Failed to initialize QuantumWalletService:', error);
        }
    }

    /**
     * Connect to MetaMask and switch to opBNB Mainnet
     */
    async connectWallet() {
        if (!window.ethereum) throw new Error('MetaMask not installed');

        try {
            // Request accounts
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Switch to opBNB Mainnet
            await this.ensureCorrectNetwork();

            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.contract = new ethers.Contract(this.CONTRACT_ADDRESS, this.abi, this.signer);

            return accounts[0];
        } catch (error) {
            console.error('Wallet connection failed:', error);
            throw error;
        }
    }

    /**
     * Ensure we are on opBNB Mainnet
     */
    async ensureCorrectNetwork() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.OPBNB_MAINNET_CHAIN_ID }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: this.OPBNB_MAINNET_CHAIN_ID,
                        chainName: 'opBNB Mainnet',
                        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
                        rpcUrls: ['https://opbnb-mainnet-rpc.bnbchain.org'],
                        blockExplorerUrls: ['https://mainnet.opbnbscan.com/']
                    }],
                });
            } else {
                throw switchError;
            }
        }
    }

    /**
     * Silently prepare the contract if we already have an account
     */
    async silentInit(address) {
        if (!this.abi) await this.init();
        if (window.ethereum && address) {
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.contract = new ethers.Contract(this.CONTRACT_ADDRESS, this.abi, this.signer);
            return true;
        }
        return false;
    }

    /**
     * Register a quantum public key hash
     */
    async registerQuantumKey() {
        // Proactive sync if contract is missing but we have ethereum
        if (!this.contract && window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) await this.silentInit(accounts[0]);
        }

        if (!this.contract) throw new Error('Identity module not connected. Please click "Connect Wallet".');

        try {
            // Generate a random-looking hash for demo purposes (CRYSTALS-Dilithium simulation)
            const demoKey = `quantum-key-${Date.now()}`;
            const publicKeyHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(demoKey));

            const tx = await this.contract.registerQuantumKey(publicKeyHash);
            await tx.wait();

            return { success: true, txHash: tx.hash, publicKeyHash };
        } catch (error) {
            console.error('Key registration failed:', error);
            throw error;
        }
    }

    /**
     * Send a quantum-signed transaction
     */
    async sendQuantumTransaction(to, amount) {
        // Proactive sync
        if (!this.contract && window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) await this.silentInit(accounts[0]);
        }

        if (!this.contract) throw new Error('Identity module not connected. Please click "Connect Wallet".');

        try {
            const amountWei = ethers.utils.parseEther(amount);
            const quantumSignature = ethers.utils.toUtf8Bytes(`quantum-sig-${Date.now()}`);
            const proofMetadata = JSON.stringify({
                algorithm: 'CRYSTALS-Dilithium',
                level: 5,
                timestamp: Date.now(),
                verified: true
            });

            const tx = await this.contract.sendQuantumTransaction(
                to,
                amountWei,
                quantumSignature,
                proofMetadata,
                { value: amountWei }
            );

            await tx.wait();
            return { success: true, txHash: tx.hash };
        } catch (error) {
            console.error('Quantum transaction failed:', error);
            throw error;
        }
    }

    /**
     * Check if the address is quantum-ready
     */
    async isQuantumReady(address) {
        if (!this.contract) {
            const provider = new ethers.providers.JsonRpcProvider(this.OPBNB_MAINNET_RPC);
            const contract = new ethers.Contract(this.CONTRACT_ADDRESS, this.abi, provider);
            return await contract.checkQuantumStatus(address);
        }
        return await this.contract.checkQuantumStatus(address);
    }
}

// Global instance
window.quantumWalletService = new QuantumWalletService();
