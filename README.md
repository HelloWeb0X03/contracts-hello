# Contract Hello

Say hello to web3 contracts development

```shell
npx hardhat compile
npx hardhat node
npx hardhat deploy:local {FILE_PATH}
npx hardhat run:local {SCRIPT_PATH}
```

## 需求
### Kick 合约
实现kick方法
1. 当EOA账号调用kick方法时，给msg.sender计数 +1；
2. 当不是EOA账户，即合约账户时，revert；
3. 统计所有kick调用总次数；
4. 输出event事件来表达 账户及当前计数值

### MinHashGameContarct 合约
合约实现一个计算最小hash值游戏，hash值计算方法：hash(msg.sender + epochId),其中epochId是一个从1开始的递增数，每一轮游戏在n个区块内，当一轮游戏在第1199区块开始时，那此轮游戏在第1199+n区块结束，1199+n区块后，合约Owner可以公布获奖者，获奖者可自行调用合约reward领取奖励，当合约公布第n轮奖励后，Owner可设置开始下一轮游戏

合约实现分几个版本
#### 版本1
实现最简单的方法iambestone()，判断并记录调用者是否可以成为最小地址
#### 版本2
增加轮次和合约Owner，Owner来设置游戏轮次信息和公布获奖者
#### 版本3
增加LuckyToken奖励，获奖者可领取奖励
#### 版本4
写一个脚本来计算地址，最好通过助记词来生成