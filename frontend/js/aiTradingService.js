/**
 * AITradingService
 * Orchestrates AI signals and interacts with AITradingExecutor contract.
 */
class AITradingService {
    constructor(contractAddress) {
        // opBNB Mainnet RPC
        this.provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');

        // Minimal ABI for AITradingExecutor
        this.abi = [
            'function executeBuyStrategy(string strategyId, address tokenOut, uint256 amountIn, uint256 minAmountOut) external payable',
            'function executeSellStrategy(string strategyId, address tokenIn, uint256 amountIn, uint256 minAmountOut) external',
            'function simulateTrade(string strategyId, uint256 amount) external returns (bool)',
            'function getUserTrades(address user) external view returns (tuple(address user, string strategyId, uint256 amount, address tokenIn, address tokenOut, uint256 executedAt, bool success, bytes result)[])',
            'event TradeExecuted(address indexed user, string strategyId, uint256 amount, address tokenIn, address tokenOut, uint256 timestamp)'
        ];

        this.contractAddress = contractAddress;
        this.activeStrategies = new Map();

        // Initialize state
        this.performance = {
            trades: 0,
            wins: 0,
            totalPnL: 0
        };
    }

    /**
     * Initialize signers and contract for writing
     */
    async connectSigner(signer) {
        this.contract = new ethers.Contract(this.contractAddress, this.abi, signer);
    }

    /**
     * Execute a demo trade
     */
    async executeDemoTrade(strategyId, amount) {
        console.log(`🚀 Executing demo trade with strategy: ${strategyId}`);

        if (!this.contract) throw new Error('Wallet not connected to AI Service');

        // Step 1: Simulated Signal Generation
        const signal = this.generateSignal(strategyId, amount);
        console.log(`📊 AI Signal:`, signal);

        // Step 2: Execute based on signal action
        try {
            let tx;
            const amountWei = ethers.utils.parseEther(amount.toString());

            if (signal.action === 'BUY') {
                tx = await this.contract.executeBuyStrategy(
                    strategyId,
                    signal.token,
                    amountWei,
                    ethers.utils.parseEther((amount * 0.99).toString()), // 1% slippage
                    { value: amountWei }
                );
            } else {
                // Simulation fallback for Sell/Arb to avoid needing token approvals in demo
                tx = await this.contract.simulateTrade(strategyId, amountWei);
            }

            const receipt = await tx.wait();
            this.performance.trades++;

            return {
                success: true,
                transaction: receipt,
                signal,
                strategy: strategyId,
                amount,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Trade execution failed:', error);
            throw error;
        }
    }

    /**
     * Get trade history from contract
     */
    async getTradeHistory(userAddress) {
        if (!this.contractAddress) return [];

        try {
            const tempContract = new ethers.Contract(this.contractAddress, this.abi, this.provider);
            const trades = await tempContract.getUserTrades(userAddress);

            return trades.map(t => ({
                strategyId: t.strategyId,
                amount: ethers.utils.formatEther(t.amount),
                tokenIn: t.tokenIn,
                tokenOut: t.tokenOut,
                timestamp: new Date(t.executedAt.toNumber() * 1000).toLocaleString(),
                success: t.success
            }));
        } catch (error) {
            console.warn('Error fetching trade history:', error);
            return [];
        }
    }

    /**
     * Generate simulated AI signal based on strategy
     */
    generateSignal(strategyId, amount) {
        const score = 0.7 + (Math.random() * 0.25);
        return {
            action: score > 0.8 ? 'BUY' : 'SIMULATE',
            confidence: score,
            token: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC on opBNB
            amount: amount
        };
    }
}

// Global instance (initialized with placeholder, updated in app.js)
window.aiTradingService = new AITradingService('0x0000000000000000000000000000000000000000');
