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
        await sleep(1000);
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
    if (tran.to != null) {
      if (
        Addresses.includes(tran.from.toLowerCase()) ||
        Addresses.includes(tran.to.toLowerCase())
      ) {
        try {
          const log = tran.logs;
          const sig = "Transfer(address,address,uint256)";
          const eightbytes = utils.toUtf8Bytes(sig);
          const keccak = utils.keccak256(eightbytes);

          for (let index = 0; index < log.length; index++) {
            if (log[index].topics[0] == keccak) {
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
            }
          }

          //create embed of trasaction
          const from = await Address.find({ address: tran.from.toLowerCase() });
          const channel = client.channels.cache.get(config.CHANNELID);
          const embed = new EmbedBuilder()
            .setTitle(from[0].label + " made a transaction!")
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
              { name: "Amount", value: details[index].amount, inline: true },
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
            "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          ) {
            embed.addFields({ name: "Action", value: "SOLD" });
          } else {
            embed.addFields({ name: "Action", value: "BOUGHT" });
          }

          channel.send({ embeds: [embed] });
        } catch (error) {
          console.log(error);
          console.log("wrong transaction type");
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
    const block = await provider.getBlock(blockNo1);
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

const sleep = (delay: any) =>
  new Promise((resolve) => setTimeout(resolve, delay));
