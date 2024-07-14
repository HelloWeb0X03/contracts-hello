import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


export default buildModule("LuckyERC20Token", (m) => {
  const contract = m.contract("LuckyERC20Token", []);

  // LuckyERC20Token_transfer
  m.call(
    contract, 
    "transfer", 
    [ '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '1000000000000000000' ],
    { id: "LuckyERC20Token_transfer" }
  );

  return { contract };
});