const bip39 = require('bip39');
const HDKey = require('hdkey');
const EthereumUtil = require('ethereumjs-util');

// 生成一个新的助记词
function generateMnemonic() {
    const mnemonic = bip39.generateMnemonic(128); // 128位熵值对应12个单词
    return mnemonic;
}

// 从助记词生成以太坊私钥
function mnemonicToPrivateKey(mnemonic, path) {
    // 从助记词生成HD钱包
    const masterHDNode = HDKey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic));
    // 派生私钥
    const derivedHDNode = masterHDNode.derive(path);
    // 返回私钥字符串
    return derivedHDNode._privateKey.toString('hex');
}

// 从私钥生成以太坊地址
function privateKeyToAddress(privateKey) {
    const address = EthereumUtil.privateToAddress(Buffer.from(privateKey, 'hex')).toString('hex');
    return `0x${address}`;
}

// 主函数
async function getAddressesFromMnemonic() {
    const mnemonic = generateMnemonic();
    console.log(`Generated mnemonic: ${mnemonic}`);

    // 创建多个地址
    const paths = [
        "m/44'/60'/0'/0/0",
        "m/44'/60'/0'/0/1",
        "m/44'/60'/0'/0/2"
    ];
    const addresses = [];

    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const privateKey = mnemonicToPrivateKey(mnemonic, path);
        const address = privateKeyToAddress(privateKey);
        console.log(`Address ${i + 1}: ${address}`);
        addresses.push({
            address: address,
            privateKey: privateKey
        });
    }

    return addresses;
}

module.exports = { getAddressesFromMnemonic };