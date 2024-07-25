const { expect } = require("chai");
const { ethers } = require("hardhat");
describe("MinHashGameContract", function () {
    let MinHashGameContract, minHashGame, owner, addr1, addr2;
    let luckyToken, token;

    before(async function () {
        // 动态导入 chai-as-promised
        const chai = require("chai");
        const chaiAsPromised = await import("chai-as-promised");
        chai.use(chaiAsPromised.default);
    });

    beforeEach(async function () {
        // 部署 LuckyToken 合约，不需要传递初始供应参数
        const LuckyToken = await ethers.getContractFactory("LuckyToken");
        luckyToken = await LuckyToken.deploy();
        await luckyToken.waitForDeployment();
        const luckyTokenAddress = await luckyToken.getAddress();
        console.log("LuckyToken deployed to:", luckyTokenAddress);

        // 部署MinHashGameContract合约
        MinHashGameContract = await ethers.getContractFactory("MinHashGameContract");
        [owner, addr1, addr2, _] = await ethers.getSigners();
        minHashGame = await MinHashGameContract.deploy(10, luckyTokenAddress); // 10块为一个epoch
        await minHashGame.waitForDeployment();
        const minHashGameAddress = await minHashGame.getAddress();
        console.log("minHashGameAddress deployed to:", minHashGameAddress);

        // 给合约地址转移一定数量的 LuckyToken
        token = await luckyToken.connect(owner);
        await token.transfer(minHashGameAddress, BigInt(1000) * BigInt(1e18));
    });

    async function mineBlocks(numBlocks) {
        for (let i = 0; i < numBlocks; i++) {
            await ethers.provider.send("evm_mine");
        }
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await minHashGame.owner()).to.equal(owner.address);
        });

        it("Should set the initial epochId and epochDuration", async function () {
            expect(await minHashGame.epochId()).to.equal(BigInt(1));
            expect(await minHashGame.epochDuration()).to.equal(BigInt(10));
        });
    });

    describe("iAmBestOne", function () {
        it("Should allow user to become the winner in current epoch", async function () {
            await minHashGame.connect(addr1).iAmBestOne();
            expect(await minHashGame.winner()).to.equal(addr1.address);

            await minHashGame.connect(addr2).iAmBestOne();
            expect(await minHashGame.winner()).to.equal(addr2.address); // 因为addr2的哈希值更小
        });

        it("Should revert if epoch has ended", async function () {
            await mineBlocks(10);
            await expect(minHashGame.connect(addr1).iAmBestOne()).to.be.rejectedWith("Epoch has ended");
        });
    });

    describe("announceWinner", function () {
        it("Should allow only owner to announce winner after epoch ends", async function () {
            await minHashGame.connect(addr1).iAmBestOne();
            await mineBlocks(10);

            await expect(minHashGame.connect(addr1).announceWinner()).to.be.rejectedWith("Only owner can call this function");
            await minHashGame.connect(owner).announceWinner();

            expect(await minHashGame.winner()).to.equal(addr1.address);
        });

        it("Should revert if epoch has not ended", async function () {
            await expect(minHashGame.announceWinner()).to.be.rejectedWith("Epoch has not ended yet");
        });
    });

    describe("reward", function () {
        it("Should allow winner to claim reward after epoch ends", async function () {
            await minHashGame.connect(addr1).iAmBestOne();
            await mineBlocks(10);

            await minHashGame.connect(owner).announceWinner();
            await minHashGame.connect(addr1).reward();
            console.log('luckyToken:', luckyToken);
            console.log('addr1:', addr1);
            expect(await luckyToken.balanceOf(addr1.address)).to.equal(BigInt(100) * BigInt(1e18));
        });

        it("Should revert if called by non-winner", async function () {
            await minHashGame.connect(addr1).iAmBestOne();
            await mineBlocks(10);

            await minHashGame.connect(owner).announceWinner();

            await expect(minHashGame.connect(addr2).reward()).to.be.rejectedWith("Only winner can claim the reward");
        });

        it("Should revert if epoch has not ended", async function () {
            await minHashGame.connect(addr1).iAmBestOne();
            await expect(minHashGame.connect(addr1).reward()).to.be.rejectedWith("Epoch has not ended yet");
        });
    });

    describe("startNewEpoch", function () {
        it("Should allow only owner to start a new epoch", async function () {
            await mineBlocks(10);
            await minHashGame.connect(owner).startNewEpoch();

            expect(await minHashGame.epochId()).to.equal(BigInt(2));
        });

        it("Should revert if epoch has not ended", async function () {
            await expect(minHashGame.startNewEpoch()).to.be.rejectedWith("Epoch has not ended yet");
        });
    });
});
