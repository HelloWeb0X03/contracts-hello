// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 导入OpenZeppelin的ERC20和Ownable合约
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LuckyToken is ERC20, Ownable {
    // 代币精度
    uint8 private constant _DECIMALS = 18;
    
    // 初始代币供应量：1,000,000 LUCKY
    uint256 private constant _INITIAL_SUPPLY = 1000000 * (10 ** _DECIMALS);

    // 初始化代币名称、符号，并铸造初始供应量 所有初始代币都会被分配给合约部署者
    constructor() ERC20("LuckyToken", "LUCKY") Ownable(msg.sender) {
        _mint(msg.sender, _INITIAL_SUPPLY);
    }

    // 铸造新代币 只有合约所有者可以调用此函数
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // 销毁调用者的代币 任何代币持有者都可以调用此函数来销毁自己的代币
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    ///从指定账户销毁代币 调用者必须有足够的授权才能销毁指定账户的代币
    function burnFrom(address account, uint256 amount) public {
        uint256 currentAllowance = allowance(account, msg.sender);
        require(currentAllowance >= amount, "ERC20: burn amount exceeds allowance");
        unchecked {
            _approve(account, msg.sender, currentAllowance - amount);
        }
        _burn(account, amount);
    }

    //返回代币的精度 代币的精度（小数位数）
    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }
}