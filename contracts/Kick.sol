// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Kick {
    mapping(address => uint256) public kicks;
    uint256 public totalKicks;

    event Kicked(address indexed sender, uint256 count);

    function kick() public {
        require(tx.origin == msg.sender, "Only EOA can call this function");

        kicks[msg.sender] += 1;
        totalKicks += 1;

        emit Kicked(msg.sender, kicks[msg.sender]);
    }
}
