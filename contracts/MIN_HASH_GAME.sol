pragma solidity >=0.7.0 <0.9.0;

// 合约实现一个计算最小hash值游戏，hash值计算方法：hash(msg.sender + epochld),其中epochld是一个从1开始的递
// 增数，每一轮游戏在n个区块内，当一轮游戏在第1199区块开始时，那此轮游戏在第1199+n区块结束，1199+n区块
// 后,
// 合约Owner可以公布获奖者，获奖者可自行调用合约reward领取奖励，当合约公布第n轮奖励后，Owner可设置开
// 始下一轮游戏
// 合约实现分几个版本
// 版本1
// 实现最简单的方法iambestone0，判断并记录调用者是否可以成为最小地址
// 版本2
// 增加轮次和合约Owner， Owner来设置游戏轮次信息和公布获奖者
// 版本3
// 增加LuckyToken奖励，获奖者可领取奖励
// 版本4
// 写一个脚本来计算地址，最好通过助记词来生成

contract MinHashGame{

    address private owner;
    uint256 private epochId;
    uint256 private nums; // owner 设置次数
    uint256 private minHashValue = type(uint256).max; // 初始设为最大可能值
    address minAddr; // 记录最小hash地址
    bool private gameEnd;   // 游戏是否结束
    bool private isAnnounce = false;  // owner是否公布了中奖人，只有公布了才可以调取reward领取奖励

     event rewardAddress(address addr, uint256 count); // 公布中奖日志
     event reward(address addr, string str); // 公布中奖日志
     event EpochId( uint256 nums, uint256 count); // 公布中奖日志

  constructor() {
    owner = msg.sender;
     epochId = 1;
     nums = 0;
     minAddr = msg.sender;
  } 

  // 判断是不是owner
  modifier  isOwner (){

    require(msg.sender==owner,"you are not owner");
    _;
  }

  // 判断游戏有没有结束
  modifier isGameEnd(){
    require(!gameEnd, "game over");
    _;

  }

// 设置每次游戏生成几个块
  function gameStart(uint256 n )  public isOwner {
    nums+=n;
    gameEnd = false;
  }

  // 用户玩游戏方法
  function findMinHash  ()public isGameEnd{
        epochId++;
        // 将 msg.sender 转换为 uint256
        uint256 senderUint = uint256(uint160(msg.sender));
        // 计算当前用户的哈希值
        bytes32 hashValue = keccak256(abi.encodePacked(senderUint, epochId));
        uint256 hashInt = uint256(hashValue);
         
        if(hashInt<minHashValue){
            minHashValue = hashInt;
            minAddr = msg.sender;
        }
        if (epochId>nums){
            gameEnd = true;
        }
         emit EpochId(epochId, nums);

  }

  // owner 重新开始下一轮游戏

  function reStartGame(uint256 n)public   {
     require(gameEnd,"game is not over");
     gameStart(n);
     epochId = 1;
     nums = 0;
     minAddr = msg.sender;
     minHashValue = type(uint256).max;

  }

  // 公布获奖名单
  function announceRewards() public isOwner {
    require(gameEnd,"game is not over");
    emit rewardAddress(minAddr, minHashValue);
    isAnnounce =true;
  }

  // 领取奖励
  function rewards () public  {
    require(isAnnounce,"game is not over or owner is not announcing");
   require(msg.sender==minAddr,"you are not a lottery winner");
    emit reward(minAddr,"Congratulations on getting 1 million");
     isAnnounce =false;
  }


}

