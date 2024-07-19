// SPDX-License-Identifier: MIT
// #### 版本2
// 增加轮次和合约Owner，Owner来设置游戏轮次信息和公布获奖者
pragma solidity ^0.8.0;

contract MinHashGameContract {

    address public owner;
    uint256 public epochId;
    uint256 public gameStartBlock;
    uint256 public gameDuration;
    address public currentMinAddress;
    uint256 public currentMinHash;
    bool public gameActive;
    address public winner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier gameIsActive() {
        require(gameActive, "Game is not active");
        _;
    }

    constructor() {
        owner = msg.sender;
    }
    // 开始游戏 只有合约owner可以调用
    function startNewGame(uint256 _gameDuration) public onlyOwner {
        require(!gameActive, "Current game is still active");
        epochId++;
        gameStartBlock = block.number;
        gameDuration = _gameDuration;
        currentMinAddress = address(0);
        currentMinHash = type(uint256).max;
        gameActive = true;
        winner = address(0);
    }
    // 计算最小哈希值
    function iambestone() public gameIsActive {
        // 当前区块号超出游戏开始区块号+游戏持续区块数量，则游戏结束
        require(block.number < gameStartBlock + gameDuration, "Game has ended");
        
        uint256 playerHash = uint256(keccak256(abi.encodePacked(msg.sender, epochId)));
        
        if (currentMinAddress == address(0) || playerHash < currentMinHash) {
            currentMinAddress = msg.sender;
            currentMinHash = playerHash;
        }
    }
    // 结束游戏 只有合约owner可以调用
    function endGame() public onlyOwner {
        require(gameActive, "Game is not active");
        require(block.number >= gameStartBlock + gameDuration, "Game has not ended yet");
        
        gameActive = false;
        // 游戏获胜者等于当前哈希值最小地址
        winner = currentMinAddress;
    }

    // 查看当前最小hash地址
    function getCurrentMinAddress() public view returns (address) {
        return currentMinAddress;
    }

    // 查看当前最小hash值
    function getCurrentMinHash() public view returns (uint256) {
        return currentMinHash;
    }

    // 查看当前游戏轮次
    function getCurrentEpoch() public view returns (uint256) {
        return epochId;
    }

    // 查看当前获胜者
    function getWinner() public view returns (address) {
        return winner;
    }
}