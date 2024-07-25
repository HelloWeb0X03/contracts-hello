// contracts/LuckyToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract LuckyToken is ERC20, ERC20Permit {
    constructor()
        ERC20("LuckyERC20Token", "LT20")
        ERC20Permit("LuckyERC20Token")
    {
        _mint(msg.sender, 100000000 * 1e18);
    }
}
