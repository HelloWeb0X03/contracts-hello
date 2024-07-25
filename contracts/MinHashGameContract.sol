// contracts/MinHashGameContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MinHashGameContract {
    address public owner;
    address public winner;
    uint256 public epochId;
    uint256 public epochDuration;
    uint256 public epochStartBlock;
    IERC20 public luckyToken;

    event NewEpochStarted(uint256 epochId);
    event WinnerAnnounced(address winner);

    constructor(uint256 _epochDuration, address _luckyTokenAddress) {
        owner = msg.sender;
        epochId = 1;
        epochDuration = _epochDuration;
        epochStartBlock = block.number;
        luckyToken = IERC20(_luckyTokenAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function iAmBestOne() public {
        require(
            block.number < epochStartBlock + epochDuration,
            "Epoch has ended"
        );
        bytes32 currentHash = keccak256(abi.encode(msg.sender, epochId));
        if (
            winner == address(0) ||
            currentHash < keccak256(abi.encode(winner, epochId))
        ) {
            winner = msg.sender;
        }
    }

    function announceWinner() public onlyOwner {
        require(
            block.number >= epochStartBlock + epochDuration,
            "Epoch has not ended yet"
        );
        emit WinnerAnnounced(winner);
    }

    function reward() public {
        require(msg.sender == winner, "Only winner can claim the reward");
        require(
            block.number >= epochStartBlock + epochDuration,
            "Epoch has not ended yet"
        );
        uint256 rewardAmount = 100 * 1e18; // 设置奖励数量
        luckyToken.transfer(winner, rewardAmount);
    }

    function startNewEpoch() public onlyOwner {
        require(
            block.number >= epochStartBlock + epochDuration,
            "Epoch has not ended yet"
        );
        epochId++;
        epochStartBlock = block.number;
        winner = address(0);
        emit NewEpochStarted(epochId);
    }
}
