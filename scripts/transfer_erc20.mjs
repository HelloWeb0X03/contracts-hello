// const hre = require("hardhat");
import hre from "hardhat"
import * as ethers from 'ethers'
import { LuckyERC20Token } from './contract.mjs'
import { ADDRS } from './config.mjs'

async function main() {
  const accounts = await hre.ethers.getSigners();
  const signer = accounts[0]

  // const amount = ethers.parseUnits('100', 18) 
  const lt20 = new LuckyERC20Token()
  await lt20.init(ADDRS.LuckyERC20Token, signer)

  const to = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  const txr = await lt20.contract.transfer(
    to,
    ethers.parseUnits('1.0', 18),
  )
  console.log(txr)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});