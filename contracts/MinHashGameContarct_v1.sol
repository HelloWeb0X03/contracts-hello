// SPDX-License-Identifier: MIT
//实现最简单的方法iambestone()，判断并记录调用者是否可以成为最小地址
pragma solidity ^0.8.0;

contract MinHashGameContract {

    address public owner;
    uint256 public epochId = 1;
    uint256 public gameStartBlock;
    uint256 public gameDuration;
    address public currentMinAddress;
    uint256 public currentMinHash;
    
    constructor(uint256 _gameDuration) {
        owner = msg.sender;
        // 游戏区块数
        gameDuration = _gameDuration;
        gameStartBlock = block.number;
    }
    
    function iambestone() public {
        require(block.number < gameStartBlock + gameDuration, "Game has ended");
        // 生成新的哈希值
        uint256 playerHash = uint256(keccak256(abi.encodePacked(msg.sender, epochId)));
        
        if (currentMinAddress == address(0) || playerHash < currentMinHash) {
            currentMinAddress = msg.sender;
            currentMinHash = playerHash;
        }
    }

    // 查看当前最小hash地址
    function getCurrentMinAddress() public view returns (address) {
        return currentMinAddress;
    }

    // 用于查看当前最小hash值
    function getCurrentMinHash() public view returns (uint256) {
        return currentMinHash;
    }
}