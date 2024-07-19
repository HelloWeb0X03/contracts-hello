// SPDX-License-Identifier: MIT

pragma solidity >=0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract LuckyERC20Token is ERC20, ERC20Permit {
    address public owner; // 合约所有者地址
    uint256 public epochId; //  当前轮次 ID
    uint256 public roundStartBlock; // 当前轮次开始的区块号
    uint256 public roundEndBlock; // 当前轮次结束的区块号
    address public bestAddress; // 当前轮次中拥有最小哈希值的地址
    bytes32 public bestHash; // 当前轮次中最小的哈希值

    event NewRoundStarted(uint256 epochId, uint256 startBlock, uint256 endBlock); // 事件：新一轮游戏开始时触发，包含轮次 ID、开始区块号和结束区块号
    event BestAddressUpdated(address indexed bestAddress, bytes32 bestHash); // 事件：当最小哈希值更新时触发，包含最佳地址和最佳哈希值
    event WinnerAnnounced(address indexed winner, uint256 rewardAmount); // 事件：当公布获奖者时触发，包含获奖者地址和奖励金额

    modifier onlyOwner() { // 修饰符：限制某些函数只能由合约所有者调用
        require(msg.sender == owner, "Not the owner");
        _;
    }
    // 构造函数：初始化合约所有者并铸造1亿个LT20代币，并将epochId初始化为1
    constructor() ERC20("LuckyERC20Token", "LT20") ERC20Permit("LuckyERC20Token") {
        owner = msg.sender; // 设置合约的所有者
        _mint(msg.sender, 100000000 * 1e18); // 铸造 1 亿个 LT20 代币
        epochId = 1; // 初始化 epochId 为 1
    }
    // 函数：开始新一轮游戏，设置轮次时长和初始值
    function startNewRound(uint256 duration) external onlyOwner {
        require(block.number > roundEndBlock, "Previous round not yet ended"); // 确保上一轮已经结束

        roundStartBlock = block.number; // 设置当前轮次开始的区块号
        roundEndBlock = block.number + duration; // 设置当前轮次结束的区块号
        bestAddress = address(0); // 重置最佳地址
        bestHash = bytes32(0); // 重置最佳哈希值
        epochId++; // 轮次 ID 自增

        emit NewRoundStarted(epochId, roundStartBlock, roundEndBlock);// 触发新一轮游戏开始的事件
    }

    function iAmBestOne() external {  // 函数：玩家参与游戏并计算哈希值，更新最佳地址和最佳哈希值
        require(msg.sender == tx.origin, "Contracts are not allowed to participate"); // 确保调用者为 EOA（外部拥有的账户）
        require(block.number <= roundEndBlock, "Round has ended"); // 确保当前轮次未结束

        bytes32 hashValue = keccak256(abi.encodePacked(msg.sender, epochId));  // 计算玩家哈希值
        if (bestHash == bytes32(0) || hashValue < bestHash) { // 如果当前哈希值小于最佳哈希值
            bestHash = hashValue; // 更新最佳哈希值
            bestAddress = msg.sender; // 更新最佳地址
            emit BestAddressUpdated(bestAddress, bestHash); // 触发最佳地址更新的事件
        }
    }

    function announceWinner() external onlyOwner { // 函数：公布获奖者，并向其转移奖励
        require(block.number > roundEndBlock, "Round not yet ended"); // 确保当前轮次已结束
        require(bestAddress != address(0), "No winner");  // 确保有获奖者

        uint256 rewardAmount = 1 * 1e18; // 设置奖励金额为 1 LT20 代币  1 LT20 token
        _transfer(owner, bestAddress, rewardAmount);  // 将奖励转移给获奖者

        emit WinnerAnnounced(bestAddress, rewardAmount); // 触发公布获奖者的事件
    }
}
