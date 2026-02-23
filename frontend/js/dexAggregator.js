/**
 * DEXAggregator
 * Handles price feeds and swap simulations for PancakeSwap on opBNB.
 */
class DEXAggregator {
    constructor() {
        // opBNB Mainnet RPC
        this.provider = new ethers.providers.JsonRpcProvider('https://opbnb-mainnet-rpc.bnbchain.org');

        // PancakeSwap Router on opBNB
        this.routerAddress = '0x1b81D678ffb9C0263b24A97847620C99d213eB14';
        this.WBNB = '0x4200000000000000000000000000000000000006';

        // Minimal ABI for price queries
        this.routerABI = [
            'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
            'function getAmountsIn(uint amountOut, address[] memory path) public view returns (uint[] memory amounts)'
        ];

        this.router = new ethers.Contract(this.routerAddress, this.routerABI, this.provider);
    }

    /**
     * Get price of token in BNB
     */
    async getTokenPriceBNB(tokenAddress) {
        try {
            if (tokenAddress.toLowerCase() === this.WBNB.toLowerCase()) return 1.0;

            const path = [tokenAddress, this.WBNB];
            const amountIn = ethers.utils.parseEther('1');
            const amounts = await this.router.getAmountsOut(amountIn, path);

            return parseFloat(ethers.utils.formatEther(amounts[1]));
        } catch (error) {
            console.error('Error fetching price:', error);
            return 0;
        }
    }

    /**
     * Simulate a swap to check expected output
     */
    async simulateSwap(tokenIn, tokenOut, amountIn, isBNBIn) {
        try {
            let path;
            if (isBNBIn) {
                path = [this.WBNB, tokenOut];
            } else {
                path = [tokenIn, this.WBNB];
            }

            const amountInWei = ethers.utils.parseEther(amountIn.toString());
            const amounts = await this.router.getAmountsOut(amountInWei, path);

            return parseFloat(ethers.utils.formatEther(amounts[amounts.length - 1]));
        } catch (error) {
            console.error('Error simulating swap:', error);
            return 0;
        }
    }

    /**
     * Common token addresses on opBNB
     */
    static get tokens() {
        return {
            WBNB: '0x4200000000000000000000000000000000000006',
            USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
            USDT: '0x55d398326f99059fF775485246999027B3197955',
            BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
            CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'
        };
    }
}

window.dexAggregator = new DEXAggregator();
