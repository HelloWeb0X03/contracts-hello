// 计算最小地址的脚本
const { ethers } = require("hardhat");

async function main() {
  const epochId = 1;
  const numPlayers = 10;

  console.log(`Epoch ID: ${epochId}`);
  console.log(`Simulating ${numPlayers} players:`);

  let players = [];

  for (let i = 0; i < numPlayers; i++) {
    // 生成随机钱包(包含助记词和地址)
    const wallet = ethers.Wallet.createRandom();
    const mnemonic = wallet.mnemonic.phrase;
    const address = wallet.address;

    // 计算hash值
    const hash = ethers.utils.solidityKeccak256(
      ["address", "uint256"],
      [address, epochId]
    );

    // 将hash转换为BigNumber以便比较
    const hashBigNumber = ethers.BigNumber.from(hash);

    players.push({ mnemonic, address, hashBigNumber });
  }

  // 模拟多个玩家调用iambestone()
  let currentMinAddress = ethers.constants.AddressZero;
  let currentMinHash = ethers.constants.MaxUint256;

  for (let player of players) {
    if (player.hashBigNumber.lt(currentMinHash)) {
      currentMinAddress = player.address;
      currentMinHash = player.hashBigNumber;
    }

    console.log(`Player address: ${player.address}`);
    console.log(`Player hash: ${player.hashBigNumber.toString()}`);
    console.log(`Current min address: ${currentMinAddress}`);
    console.log(`Current min hash: ${currentMinHash.toString()}`);
    console.log();
  }

  // 找到最终的获胜者
  const winner = players.find(p => p.address === currentMinAddress);

  console.log("Final result:");
  console.log(`Winning address: ${currentMinAddress}`);
  console.log(`Winning hash: ${currentMinHash.toString()}`);
  console.log(`Winning mnemonic: ${winner.mnemonic}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });