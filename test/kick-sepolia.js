const { expect } = require("chai");
const fs = require("fs");

describe("Kick contract", function () {
    let kick;
    let deployer;
    let addr1;
    let addr2;

    before(async function () {
        // 从文件中读取已部署合约地址
        const deployedAddresses = JSON.parse(fs.readFileSync("./ignition/deployments/chain-11155111/deployed_addresses.json"));
        const kickAddress = deployedAddresses['KickModule#Kick'];

        // 获取合约实例
        kick = await ethers.getContractAt("Kick", kickAddress);
        [deployer, addr1, addr2, _] = await ethers.getSigners();
    });

    it("should increase count by 1 when EOA calls kick", async function () {
        await kick.connect(addr1).kick();
        expect(await kick.kicks(addr1.address)).to.equal(1);

        await kick.connect(addr1).kick();
        expect(await kick.kicks(addr1.address)).to.equal(2);
    });

    it("should revert when a contract calls kick", async function () {
        // 这里创建一个合约，用它来调用 kick 方法，应该会被 revert
        const Attacker = await ethers.getContractFactory("Attacker");
        const attacker = await Attacker.deploy(kick.address);
        await attacker.deployed();

        await expect(attacker.attack()).to.be.revertedWith("Contracts are not allowed to call kick");
    });

    it("should keep track of total kicks", async function () {
        await kick.connect(addr1).kick();
        await kick.connect(addr2).kick();

        expect(await kick.totalKicks()).to.equal(2);
    });

    it("should emit event with correct account and count", async function () {
        await expect(kick.connect(addr1).kick())
            .to.emit(kick, "Kicked")
            .withArgs(addr1.address, 1);
    });
});
