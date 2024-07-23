const { expect } = require("chai");
const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");


chai.use(solidity);
chai.use(require("chai-as-promised"));

describe("Kick contract", function () {
    let Kick;
    let kick;
    let deployer;
    let addr1;
    let addr2;

    before(async function () {
        // 获取合约工厂
        Kick = await ethers.getContractFactory("Kick");

        // 获取本地节点生成的账户
        [deployer, addr1, addr2, ..._] = await ethers.getSigners();
        kick = await Kick.attach('0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9');
        // 部署合约
        // kick = await Kick.deploy();
        // console.log(kick)
        // await kick.deployed();
    });

    it("should increase count by 1 when EOA calls kick", async function () {
        await kick.connect(addr1).kick();
        expect(await kick.kicks(addr1.address)).to.equal(BigInt(9));

        await kick.connect(addr1).kick();
        expect(await kick.kicks(addr1.address)).to.equal(BigInt(10));
    });

    // it("should revert when a contract calls kick", async function () {
    //     const Attacker = await ethers.getContractFactory("Attacker");
    //     const attacker = await Attacker.deploy(kick.address);
    //     await attacker.deployed();

    //     await expect(attacker.attack()).to.be.revertedWith("Contracts are not allowed to call kick");
    // });

    it("should keep track of total kicks", async function () {
        await kick.connect(addr1).kick();
        await kick.connect(addr2).kick();

        expect(await kick.totalKicks()).to.equal(2);
    });
    it("should emit event with correct account and count", async function () {
        await expect(kick.connect(addr1).kick())
            .to.emit(kick, 'Kicked')
            .withArgs(addr1.address, BigInt(3)); // 使用 BigInt(3)

        await expect(kick.connect(addr1).kick())
            .to.emit(kick, 'Kicked')
            .withArgs(addr1.address, BigInt(4)); // 使用 BigInt(4)
    });
});