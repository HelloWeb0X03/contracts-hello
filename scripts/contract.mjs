// const hre = require("hardhat");
import hre from "hardhat"
// import * as ethers from 'ethers'

export class LuckyERC20Token {
  static contractName = 'LuckyERC20Token'
  async init(address, signer) {
    this.contract = await hre.ethers.getContractAt(
      LuckyERC20Token.contractName, address, signer
    )
  }
}

export class LuckyERC721Token {
  static contractName = 'LuckyERC721Token'
  async init(address, signer) {
    this.contract = await hre.ethers.getContractAt(
      LuckyERC721Token.contractName, address, signer
    )
  }
}

export class LuckyERC1155Token {
  static contractName = 'LuckyERC1155Token'
  async init(address, signer) {
    this.contract = await hre.ethers.getContractAt(
      LuckyERC1155Token.contractName, address, signer
    )
  }
}
