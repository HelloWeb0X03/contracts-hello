import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
export default buildModule("KickModule", (m) => {
    const kick = m.contract("Kick", []);

    // 可以在这里添加更多调用或其他操作
    // 例如调用合约方法初始化一些数据
    // m.call(kick, "someMethod", [arg1, arg2]);

    return { kick };
});
