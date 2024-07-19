// SPDX-License-Identifier: MIT
// #### 版本3
// 增加LuckyToken奖励，获奖者可领取奖励
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MinHashGameContract {
    using SafeERC20 for IERC20;

    address public owner;
    uint256 public epochId;
    uint256 public gameStartBlock;
    uint256 public gameDuration;
    address public currentMinAddress;
    uint256 public currentMinHash;
    bool public gameActive;
    address public winner;
    uint256 public reward;
    bool public rewardClaimed;
    
    IERC20 public luckyToken;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier gameIsActive() {
        require(gameActive, "Game is not active");
        _;
    }

    constructor(address _luckyTokenAddress) {
        owner = msg.sender;
        luckyToken = IERC20(_luckyTokenAddress);
    }
    
    function startNewGame(uint256 _gameDuration, uint256 _reward) public onlyOwner {
        require(!gameActive, "Current game is still active");
        // 查询代币余额
        require(luckyToken.balanceOf(address(this)) >= _reward, "Insufficient token balance");
        
        if (epochId > 0) {
            require(rewardClaimed, "Previous reward not claimed");
        }
        
        epochId++;
        gameStartBlock = block.number;
        gameDuration = _gameDuration;
        currentMinAddress = address(0);
        currentMinHash = type(uint256).max;
        gameActive = true;
        winner = address(0);
        reward = _reward;
        rewardClaimed = false;
    }

    function iambestone() public gameIsActive {
        require(block.number < gameStartBlock + gameDuration, "Game has ended");
        
        uint256 playerHash = uint256(keccak256(abi.encodePacked(msg.sender, epochId)));
        
        if (currentMinAddress == address(0) || playerHash < currentMinHash) {
            currentMinAddress = msg.sender;
            currentMinHash = playerHash;
        }
    }

    function endGame() public onlyOwner {
        require(gameActive, "Game is not active");
        require(block.number >= gameStartBlock + gameDuration, "Game has not ended yet");
        
        gameActive = false;
        winner = currentMinAddress;
    }
    // 获取奖励
    function claimReward() public {
        require(!gameActive, "Game is still active");
        require(msg.sender == winner, "Only winner can claim reward");
        require(!rewardClaimed, "Reward already claimed");
        
        rewardClaimed = true;
        luckyToken.safeTransfer(winner, reward);
    }

    // 用于合约所有者存入LuckyToken
    function depositTokens(uint256 amount) public onlyOwner {
        luckyToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    // 用于合约所有者提取剩余的LuckyToken
    function withdrawTokens(uint256 amount) public onlyOwner {
        luckyToken.safeTransfer(msg.sender, amount);
    }

    // 用于查看当前最小hash地址
    function getCurrentMinAddress() public view returns (address) {
        return currentMinAddress;
    }

    // 用于查看当前最小hash值
    function getCurrentMinHash() public view returns (uint256) {
        return currentMinHash;
    }

    // 用于查看当前游戏轮次
    function getCurrentEpoch() public view returns (uint256) {
        return epochId;
    }

    // 用于查看当前获胜者
    function getWinner() public view returns (address) {
        return winner;
    }

    // 用于查看当前奖励金额
    function getReward() public view returns (uint256) {
        return reward;
    }

    // 用于查看奖励是否已被领取
    function isRewardClaimed() public view returns (bool) {
        return rewardClaimed;
    }
    // 查询luckyToken余额
    function getContractBalance() public view returns (uint256) {
    return luckyToken.balanceOf(address(this));
}
}