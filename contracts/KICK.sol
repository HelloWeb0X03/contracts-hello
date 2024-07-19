pragma solidity >=0.7.0 <0.9.0;

contract Kick {
    mapping(address => uint256) public msgCounts;

    uint256 countTotal;
    event msgCount(address addr, uint256 count);

    constructor() {}

    function isContract(address addr) public view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    modifier eoaValidate() {
        require(!isContract(msg.sender), "The address is not EOA");
        _;
    }

    // 每次调用用户加一

    function Add() public eoaValidate {
        countTotal++;
        msgCounts[msg.sender]++;
        emit msgCount(msg.sender, msgCounts[msg.sender]);
    }

    // 获取总数
    function getCountTotal() public view returns (uint256) {
        return countTotal;
    }

    // 获取每个用户的
    function getMsgCount() public view returns (uint256) {
        return msgCounts[msg.sender];
    }
}
