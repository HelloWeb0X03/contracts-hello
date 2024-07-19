// require('dotenv').config();
const { ethers } = require('ethers');
const { contractABI, contractAddress } = require('./utils/constants');

const ALCHEMY_SEPOLIA_URL = 'https://eth-sepolia.g.alchemy.com/v2/q_pvI4xlNg1dH7OgLYGw7AZseeZRqQlV';
const provider = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_URL);

// 使用合约所有者的私钥
const ownerPrivateKey = '7ca1970e94a2aecf4c3dd791b6b1d04735bc98cc26d248ffb64eefde879cf5f8';
const ownerWallet = new ethers.Wallet(ownerPrivateKey, provider);

// 创建随机的 wallet 对象
const participantWallet = ethers.Wallet.createRandom();
const participantWalletWithProvider = participantWallet.connect(provider);
const mnemonic = participantWallet.mnemonic.phrase; // 获取助记词

console.log(`Generated Wallet Address: ${participantWallet.address}`);
console.log(`Mnemonic: ${mnemonic}`);

// 创建合约实例
const contract = new ethers.Contract(contractAddress, contractABI, ownerWallet);

async function main() {
    console.log(`Using wallet address: ${ownerWallet.address}`);

    // 开始新一轮游戏
    console.log('Starting a new round...');
    try {
        const startTx = await contract.startNewRound(100); // 假设持续 100 个区块
        await startTx.wait();
        console.log('New round started.');
    } catch (error) {
        console.error('Failed to start a new round:', error);
        return;
    }

    // 创建一个新的合约实例来参与游戏，使用参与者的钱包
    const participantContract = new ethers.Contract(contractAddress, contractABI, participantWalletWithProvider);

    // 参与游戏
    console.log('Participating in the game...');
    try {
        const participateTx = await participantContract.iAmBestOne();
        await participateTx.wait();
        console.log('Participated in the game.');
    } catch (error) {
        console.error('Failed to participate in the game:', error);
        return;
    }

    // 等待轮次结束
    console.log('Waiting for the round to end...');
    const currentBlock = await provider.getBlockNumber();
    await provider.waitForBlock(currentBlock + 100); // 等待超过 100 个区块

    // 公布获奖者
    console.log('Announcing the winner...');
    try {
        const announceTx = await contract.announceWinner();
        await announceTx.wait();
        console.log('Winner announced.');
    } catch (error) {
        console.error('Failed to announce the winner:', error);
        return;
    }

    // 检查奖励
    try {
        const balance = await contract.balanceOf(participantWallet.address);
        console.log(`Balance of ${participantWallet.address} is ${ethers.formatUnits(balance, 18)} LT20`);
    } catch (error) {
        console.error('Failed to check balance:', error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
