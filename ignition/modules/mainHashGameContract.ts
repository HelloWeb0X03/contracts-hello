import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
export default buildModule("MinHashGameContractModule", (m) => {
    const MinHashGameContract = m.contract("MinHashGameContract", []);



    return { MinHashGameContract };
});
