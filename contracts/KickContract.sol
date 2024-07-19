// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract KickContract {
    // mapping存储每个用户的kick次数
    mapping(address => uint256) private kickCount;
    // kick总次数
    uint256 private totalKicks;

    // 定义一个event来通知外界
    event Kicked(address indexed kicker, uint256 currentCount, uint256 totalKicks);

    // kick方法
    function kick() public {
        // 检查调用者是否为EOA账户
        require(tx.origin == msg.sender, "Only EOAs can kick");
        // 给调用者的kick次数加1
        kickCount[msg.sender]++;
        // 总kick次数加1
        totalKicks++;
        // 触发event
        emit Kicked(msg.sender, kickCount[msg.sender], totalKicks);
    }

    // 获取某个地址的kick次数
    function getKickCount(address _address) public view returns (uint256) {
        return kickCount[_address];
    }

    // 获取总kick次数
    function getTotalKick() public view returns (uint256) {
        return totalKicks;
    }
}