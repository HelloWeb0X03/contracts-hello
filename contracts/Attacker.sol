// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IKick {
    function kick() external;
}

contract Attacker {
    IKick public kickContract;

    constructor(address _kickAddress) {
        kickContract = IKick(_kickAddress);
    }

    function attack() public {
        kickContract.kick();
    }
}
