const { ethers } = require("ethers");

const mnemonic = "test test test test test test test test test test test junk"; // 示例助记词
const path = "m/44'/60'/0'/0/";

async function generateAddresses(mnemonic, numberOfAddresses) {
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    const addresses = [];

    for (let i = 0; i < numberOfAddresses; i++) {
        const childWallet = wallet.connect(ethers.provider).derivePath(`${path}${i}`);
        addresses.push(childWallet.address);
    }

    return addresses;
}

async function main() {
    const numberOfAddresses = 5;
    const addresses = await generateAddresses(mnemonic, numberOfAddresses);
    console.log("Generated Addresses:", addresses);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
