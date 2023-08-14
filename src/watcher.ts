import { ethers } from "ethers";
import ABI from "./abi/ERC20ABI.json";
import { Address } from "./models/Address";
import config from "./config";
import { EmbedBuilder } from "discord.js";

const provider = new ethers.providers.AlchemyProvider(
  "homestead",
  config.ALCAPI
);

const utils = ethers.utils;

export function transactionTracker(client: any) {
  console.log("tracker active");
  provider.on("block", async (blockNumber: any) => {
    const adds = await Address.aggregate([
      {
        $unwind: "$address",
      },
      {
        $group: {
          _id: null,
          address: {
            $addToSet: "$address",
          },
        },
      },
    ]);
    const Addresses = adds[0].address;
    try {
      const block = await provider.getBlock(blockNumber);
      console.log(block.number);
      for (const transaction of block.transactions) {
        logCheck(transaction, Addresses, client);
        await sleep(500);
      }
    } catch (error) {
      console.error(error);
    }
  });
}

async function logCheck(transaction: any, Addresses: any, client: any) {
  try {
    const details = [];
    const tran = await provider.getTransactionReceipt(transaction);
    const channel = client.channels.cache.get(config.CHANNELID);
    if (tran.to != null) {
      if (
        Addresses.includes(tran.from.toLowerCase()) ||
        Addresses.includes(tran.to.toLowerCase())
      ) {
        try {
          const log = tran.logs;
          const sigTran = "Transfer(address,address,uint256)";
          const eightbytesTran = utils.toUtf8Bytes(sigTran);
          const keccakTran = utils.keccak256(eightbytesTran);

          const sigApprove = "Approval(address,address,uint256)";
          const eightbytesApprove = utils.toUtf8Bytes(sigApprove);
          const keccakApprove = utils.keccak256(eightbytesApprove);

          for (let index = 0; index < log.length; index++) {
            if (log[index].topics[0] == keccakTran) {
              //and check swap first entry
              console.log(log[index].topics[0]);
              const contract = new ethers.Contract(
                log[index].address,
                ABI,
                provider
              );
              const symbol = await contract.symbol();
              const name = await contract.name();
              const dataCoversion = utils.defaultAbiCoder
                .decode(["uint256"], log[index].data)[0]
                .toString();
              const decimal = await contract.decimals();
              const tokAm = utils.formatUnits(dataCoversion, decimal);
              const data = {
                token: name,
                tokenAddress: log[index].address,
                sym: symbol,
                amount: tokAm,
              };
              details.push(data);

              //create embed of trasaction
              const from = await Address.find({
                address: tran.from.toLowerCase(),
              });

              const embed = new EmbedBuilder()
                .setTitle(from[0].label + " made a transaction on ethereum!")
                .setURL("https://etherscan.io/tx/" + tran.transactionHash)
                .setTimestamp();
              for (let index = 0; index < details.length; index++) {
                const tokenAdd = details[index].tokenAddress;
                const firstSplit = tokenAdd.slice(0, 4);
                const secondSplit = tokenAdd.slice(-4);
                const tokenShort = firstSplit + "..." + secondSplit;

                embed.addFields(
                  {
                    name: "Token",
                    value:
                      "[ " +
                      details[index].sym +
                      " ](" +
                      "https://dexscreener.com/ethereum/" +
                      details[index].tokenAddress +
                      ")",
                    inline: true,
                  },
                  {
                    name: "Amount",
                    value: details[index].amount,
                    inline: true,
                  },
                  {
                    name: "Address",
                    value:
                      "[" +
                      tokenShort +
                      "](https://etherscan.io/address/" +
                      details[index].tokenAddress +
                      ")",
                    inline: true,
                  }
                );
              }

              if (
                details[details.length - 1].tokenAddress ==
                  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" ||
                details[details.length - 1].tokenAddress ==
                  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
              ) {
                embed.addFields({ name: "Action", value: "SOLD" });
              } else if (details.length == 1) {
                embed.addFields({ name: "Action", value: "TRANSFER" });
              } else {
                embed.addFields({ name: "Action", value: "BOUGHT" });
              }
              channel.send({ embeds: [embed] });
            } else if (log[index].topics[0] == keccakApprove) {
              const contract = new ethers.Contract(
                log[index].address,
                ABI,
                provider
              );

              const from = await Address.find({
                address: tran.from.toLowerCase(),
              });

              const symbol = await contract.symbol();
              const name = await contract.name();
              console.log("test: " + name + "/" + symbol);
              const embed = new EmbedBuilder()
                .setTitle(from[0].label + " made a approval!")
                .setURL("https://etherscan.io/tx/" + tran.transactionHash)
                .setDescription("Token: " + name + ":" + symbol);

              channel.send({ embeds: [embed] });
            }
          }
        } catch (error) {
          console.log(error);
          console.log("wrong transaction type: " + transaction);
        }
      }
    } else if (tran.to == null) {
      console.log("null address/new contract created");
    }
  } catch (error) {
    console.log("failed: " + transaction);
  }
}

//tests a block with a confirmed transaction
export async function transactionTrackerTest(client: any) {
  console.log("tracker active");
  const blockNo1 = 17842416; // weth into other https://etherscan.io/tx/0x861d9514131067946d83739a9020cb250ee15b75029355a81fa45fa54c16e053
  const blockNo2 = 17842469; // other into weth https://etherscan.io/tx/0x9037b8e6556ba9a7b4d2a59b068677a1032462f322f4258eb30250a191797dcb
  const blockNo3 = 17842454; // https://etherscan.io/tx/0x39eea68baaa2aa7e9d6d9846206c658f4565a9c3d49137445947ecc8b9d9b151
  const blockNo4 = 17844457; // approval https://etherscan.io/tx/0x6f62eeb023ddd51a5df30f8db268144bf8848a83179fee67d41384e4528d814b
  const blockNo5 = 17844717; // transfer https://etherscan.io/tx/0xba978d438c2688b132b7ad029c56755cbb6c0934ca1a6a7b222d6c92c68e375d
  const adds = await Address.aggregate([
    {
      $unwind: "$address",
    },
    {
      $group: {
        _id: null,
        address: {
          $addToSet: "$address",
        },
      },
    },
  ]);
  const Addresses = adds[0].address;
  try {
    const block = await provider.getBlock(blockNo5);
    console.log(block.number);
    for (const transaction of block.transactions) {
      let t1 = performance.now();
      logCheck(transaction, Addresses, client);
      await sleep(250);
      let t2 = performance.now();
      let elapsed = t2 - t1;
      const time = elapsed + " ms ";
      //console.log(time + "transaction:" + transaction);
    }
  } catch (error) {
    console.error(error);
  }
}

//sleep function
const sleep = (delay: any) =>
  new Promise((resolve) => setTimeout(resolve, delay));
