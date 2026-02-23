// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IPancakeRouter {
    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);
    
    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external
        view
        returns (uint[] memory amounts);
}

/**
 * @title AITradingExecutor
 * @dev Executes trades based on AI strategy signals
 */
contract AITradingExecutor is Ownable, ReentrancyGuard {
    IPancakeRouter public pancakeRouter;
    address public WBNB;
    
    // Trading parameters
    uint256 public maxTradeSize = 10 ether; // Max 10 BNB per trade
    uint256 public minProfitBasis = 10; // 0.1% minimum profit
    
    // Strategy execution log
    struct TradeExecution {
        address user;
        string strategyId;
        uint256 amount;
        address tokenIn;
        address tokenOut;
        uint256 executedAt;
        bool success;
        bytes result;
    }
    
    TradeExecution[] public tradeHistory;
    
    // Events
    event TradeExecuted(
        address indexed user,
        string strategyId,
        uint256 amount,
        address tokenIn,
        address tokenOut,
        uint256 timestamp
    );
    
    event AIStrategyTriggered(string strategyId, uint256 confidence);
    
    constructor(address _router, address _wbnb) Ownable(msg.sender) {
        pancakeRouter = IPancakeRouter(_router);
        WBNB = _wbnb;
    }
    
    /**
     * @dev Execute a buy trade based on AI signal
     */
    function executeBuyStrategy(
        string memory strategyId,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) external payable nonReentrant {
        require(msg.value == amountIn, "Amount mismatch");
        require(amountIn <= maxTradeSize, "Exceeds max trade size");
        
        // Path: BNB -> Token
        address[] memory path = new address[](2);
        path[0] = WBNB;
        path[1] = tokenOut;
        
        // Execute swap
        uint[] memory amounts = pancakeRouter.swapExactETHForTokens{value: amountIn}(
            minAmountOut,
            path,
            msg.sender,
            block.timestamp + 300 // 5 minute deadline
        );
        
        // Log execution
        tradeHistory.push(TradeExecution({
            user: msg.sender,
            strategyId: strategyId,
            amount: amountIn,
            tokenIn: WBNB,
            tokenOut: tokenOut,
            executedAt: block.timestamp,
            success: true,
            result: abi.encode(amounts)
        }));
        
        emit TradeExecuted(
            msg.sender,
            strategyId,
            amountIn,
            WBNB,
            tokenOut,
            block.timestamp
        );
    }
    
    /**
     * @dev Execute a sell trade based on AI signal
     */
    function executeSellStrategy(
        string memory strategyId,
        address tokenIn,
        uint256 amountIn,
        uint256 minAmountOut
    ) external nonReentrant {
        require(amountIn <= maxTradeSize, "Exceeds max trade size");
        
        // Transfer tokens from user
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenIn).approve(address(pancakeRouter), amountIn);
        
        // Path: Token -> BNB
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = WBNB;
        
        // Execute swap
        uint[] memory amounts = pancakeRouter.swapExactTokensForETH(
            amountIn,
            minAmountOut,
            path,
            msg.sender,
            block.timestamp + 300
        );
        
        // Log execution
        tradeHistory.push(TradeExecution({
            user: msg.sender,
            strategyId: strategyId,
            amount: amountIn,
            tokenIn: tokenIn,
            tokenOut: WBNB,
            executedAt: block.timestamp,
            success: true,
            result: abi.encode(amounts)
        }));
        
        emit TradeExecuted(
            msg.sender,
            strategyId,
            amountIn,
            tokenIn,
            WBNB,
            block.timestamp
        );
    }
    
    /**
     * @dev Simulate trade for demo (no actual swap)
     */
    function simulateTrade(
        string memory strategyId,
        uint256 amount
    ) external returns (bool) {
        emit AIStrategyTriggered(strategyId, 95); // 95% confidence
        
        tradeHistory.push(TradeExecution({
            user: msg.sender,
            strategyId: strategyId,
            amount: amount,
            tokenIn: WBNB,
            tokenOut: address(0),
            executedAt: block.timestamp,
            success: true,
            result: abi.encode("Simulated trade for demo")
        }));
        
        return true;
    }
    
    // View functions
    function getTradeHistory() external view returns (TradeExecution[] memory) {
        return tradeHistory;
    }
    
    function getUserTrades(address user) external view returns (TradeExecution[] memory) {
        uint count = 0;
        for (uint i = 0; i < tradeHistory.length; i++) {
            if (tradeHistory[i].user == user) count++;
        }
        
        TradeExecution[] memory userTrades = new TradeExecution[](count);
        uint index = 0;
        for (uint i = 0; i < tradeHistory.length; i++) {
            if (tradeHistory[i].user == user) {
                userTrades[index] = tradeHistory[i];
                index++;
            }
        }
        return userTrades;
    }
    
    // Admin functions
    function setMaxTradeSize(uint256 _maxTradeSize) external onlyOwner {
        maxTradeSize = _maxTradeSize;
    }
    
    function withdrawBNB() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
