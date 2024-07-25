const { expect } = require("chai");
const { ethers } = require("hardhat");
const { keccak256 } = require("ethereumjs-util");
const { getAddressesFromMnemonic } = require("../scripts/generate_addresses");

describe("MinHashGameContract", function () {
    let MinHashGameContract, minHashGame, owner, addr1, addr2;
    let luckyToken, token;

    let accounts = [];

    before(async function () {
        const chai = require("chai");
        const chaiAsPromised = await import("chai-as-promised");
        chai.use(chaiAsPromised.default);

        accounts = await getAddressesFromMnemonic();
        console.log("accounts:", accounts);
    });

    function getWinnerAddress(accounts, epochId) {
        let winner = accounts[0].address;
        let minHash = keccak256(Buffer.from(accounts[0].address + epochId));
        for (let i = 1; i < accounts.length; i++) {
            const currentHash = keccak256(Buffer.from(accounts[i].address + epochId));
            if (currentHash < minHash) {
                minHash = currentHash;
                winner = accounts[i].address;
            }
        }
        return winner;
    }

    beforeEach(async function () {
        const LuckyToken = await ethers.getContractFactory("LuckyToken");
        luckyToken = await LuckyToken.deploy();
        await luckyToken.waitForDeployment();
        const luckyTokenAddress = await luckyToken.getAddress();
        console.log("LuckyToken deployed to:", luckyTokenAddress);

        MinHashGameContract = await ethers.getContractFactory("MinHashGameContract");
        [owner, addr1, addr2, _] = await ethers.getSigners();
        minHashGame = await MinHashGameContract.deploy(10, luckyTokenAddress);
        await minHashGame.waitForDeployment();
        const minHashGameAddress = await minHashGame.getAddress();
        console.log("minHashGameAddress deployed to:", minHashGameAddress);

        token = await luckyToken.connect(owner);
        await token.transfer(minHashGameAddress, BigInt(1000) * BigInt(1e18));

        const winner = getWinnerAddress(accounts, await minHashGame.epochId());
    });

    async function mineBlocks(numBlocks) {
        for (let i = 0; i < numBlocks; i++) {
            await ethers.provider.send("evm_mine");
        }
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect((await minHashGame.owner()).toLowerCase()).to.equal(owner.address.toLowerCase());
        });

        it("Should set the initial epochId and epochDuration", async function () {
            expect(await minHashGame.epochId()).to.equal(BigInt(1));
            expect(await minHashGame.epochDuration()).to.equal(BigInt(10));
        });
    });

    describe("reward", function () {
        beforeEach(async function () {
            for (const account of accounts) {
                await ethers.provider.send("hardhat_setBalance", [account.address, "0x1000000000000000000"]);
            }
        });

        it("Should allow winner to claim reward after epoch ends", async function () {
            const epochId = await minHashGame.epochId();
            const winner = getWinnerAddress(accounts, epochId);
            const winnerAccount = accounts.find(a => a.address.toLowerCase() === winner.toLowerCase());

            const winnerSigner = new ethers.Wallet(winnerAccount.privateKey, ethers.provider);

            await minHashGame.connect(winnerSigner).iAmBestOne();
            expect((await minHashGame.winner()).toLowerCase()).to.equal(winner.toLowerCase());

            await mineBlocks(10);

            await minHashGame.connect(owner).announceWinner();

            await minHashGame.connect(winnerSigner).reward();
            expect(await luckyToken.balanceOf(winner)).to.equal(BigInt(100) * BigInt(1e18));
        });

        it("Should revert if called by non-winner", async function () {
            await mineBlocks(10);
            await minHashGame.connect(owner).announceWinner();

            const epochId = await minHashGame.epochId();
            const winner = getWinnerAddress(accounts, epochId);
            const nonWinnerAccount = accounts.find(a => a.address.toLowerCase() !== winner.toLowerCase());
            const nonWinnerSigner = new ethers.Wallet(nonWinnerAccount.privateKey, ethers.provider);

            await expect(minHashGame.connect(nonWinnerSigner).reward()).to.be.rejectedWith("Only winner can claim the reward");
        });

        it("Only winner can claim the reward", async function () {
            const epochId = await minHashGame.epochId();
            const winner = getWinnerAddress(accounts, epochId);
            const winnerAccount = accounts.find(a => a.address.toLowerCase() === winner.toLowerCase());
            const winnerSigner = new ethers.Wallet(winnerAccount.privateKey, ethers.provider);

            await expect(minHashGame.connect(winnerSigner).reward()).to.be.rejectedWith("Only winner can claim the reward");
        });
    });

    describe("startNewEpoch", function () {
        beforeEach(async function () {
            for (const account of accounts) {
                await ethers.provider.send("hardhat_setBalance", [account.address, "0x1000000000000000000"]);
            }
        });

        it("Should allow only owner to start a new epoch", async function () {
            await mineBlocks(10);
            await minHashGame.connect(owner).announceWinner();

            await minHashGame.connect(owner).startNewEpoch();
            expect(await minHashGame.epochId()).to.equal(BigInt(2));
        });

        it("Should revert if called by non-owner", async function () {
            const nonOwnerAccount = accounts.find(a => a.address.toLowerCase() !== owner.address.toLowerCase());
            const nonOwnerSigner = new ethers.Wallet(nonOwnerAccount.privateKey, ethers.provider);

            await expect(minHashGame.connect(nonOwnerSigner).startNewEpoch()).to.be.rejectedWith("Only owner can call this function");
        });
    });

    describe("announceWinner", function () {
        beforeEach(async function () {
            for (const account of accounts) {
                await ethers.provider.send("hardhat_setBalance", [account.address, "0x1000000000000000000"]);
            }
        });

        it("Should set winner correctly", async function () {
            const epochId = await minHashGame.epochId();
            const winner = getWinnerAddress(accounts, epochId);
            const winnerAccount = accounts.find(a => a.address.toLowerCase() === winner.toLowerCase());
            const winnerSigner = new ethers.Wallet(winnerAccount.privateKey, ethers.provider);

            await minHashGame.connect(winnerSigner).iAmBestOne();
            await mineBlocks(10);
            await minHashGame.connect(owner).announceWinner();

            expect((await minHashGame.winner()).toLowerCase()).to.equal(winner.toLowerCase());
        });

        it("Should revert if epoch has not ended", async function () {
            const epochId = await minHashGame.epochId();
            const winner = getWinnerAddress(accounts, epochId);
            const winnerAccount = accounts.find(a => a.address.toLowerCase() === winner.toLowerCase());
            const winnerSigner = new ethers.Wallet(winnerAccount.privateKey, ethers.provider);

            await minHashGame.connect(winnerSigner).iAmBestOne();

            await expect(minHashGame.connect(owner).announceWinner()).to.be.rejectedWith("Epoch has not ended yet");
        });
    });
});
