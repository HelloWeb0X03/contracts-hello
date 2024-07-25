// scripts/deploy_min_hash_game.js
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // 部署 LuckyToken 合约，不需要传递初始供应参数
    const LuckyToken = await hre.ethers.getContractFactory("LuckyToken");
    const luckyToken = await LuckyToken.deploy();
    await luckyToken.waitForDeployment();
    const luckyTokenAddress = await luckyToken.getAddress();
    console.log("LuckyToken deployed to:", luckyTokenAddress);

    // 部署 MinHashGameContract 合约，传递 epochDuration 和 LuckyToken 地址
    const MinHashGameContract = await hre.ethers.getContractFactory("MinHashGameContract");
    const minHashGameContract = await MinHashGameContract.deploy(1200, luckyTokenAddress);
    await minHashGameContract.waitForDeployment();
    const minHashGameContractAddress = await minHashGameContract.getAddress();
    console.log("MinHashGameContract deployed to:", minHashGameContractAddress);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
