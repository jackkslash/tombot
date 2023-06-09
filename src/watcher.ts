import { ethers } from "ethers";
import ABI from "./abi/ERC20ABI.json";
import { Address } from "./models/Address";
import config from "./config";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";

const url1 = config.RPCURL1;
const url2 = config.RPCURL2;
const stallTimeout = 2 * 1000;
const options = {
  timeout: 60 * 1000,
  throttleLimit: 1,
};
const quorum = 1;
const provider1 = new ethers.providers.StaticJsonRpcProvider({
  url: url1,
  ...options,
});
const provider2 = new ethers.providers.StaticJsonRpcProvider({
  url: url2,
  ...options,
});

const provider = new ethers.providers.FallbackProvider(
  [
    {
      provider: provider1,
      priority: 1,
      weight: 1,
      stallTimeout,
    },
    {
      provider: provider2,
      priority: 2,
      weight: 1,
      stallTimeout,
    },
  ],
  quorum
);
const utils = ethers.utils;

//jing1 - 0x15c92560b75dae892d6be088a0249f967b6a93fd
//jing2 - 0x01f005d8aa19b2eb2b75d0f51290da662bb4f668
//brypto - 0xd77a8cde26afb5b711f0e25c23a48562d5259bf3
//https://etherscan.io/tx/0x8aee4d2e9df3d96202a41cb8b009f0b1d6d4d84ceb0ea9e3d8f2dfb171c5049c
//https://etherscan.io/tx/0xbf6ee7d2156f9cdade1f5970a8a65362f2a34b33d59f44724067fd25b14f86b4
//https://etherscan.io/tx/0x41ee3c8a9329c70b8f32dacc7e8bb03fae926c5bca2eee84ece1bbb754ae73b3

const transactions: string | any[] = [
  "0x8aee4d2e9df3d96202a41cb8b009f0b1d6d4d84ceb0ea9e3d8f2dfb171c5049c",
  "0xbf6ee7d2156f9cdade1f5970a8a65362f2a34b33d59f44724067fd25b14f86b4",
  "0x41ee3c8a9329c70b8f32dacc7e8bb03fae926c5bca2eee84ece1bbb754ae73b3",
];

export async function transactionTrackerTest(client: any) {
  console.log("tracker active");
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
    for (let index = 0; index < transactions.length; index++) {
      logCheck(transactions[index], Addresses, client);
    }
  } catch (error) {
    console.error(error);
  }
}

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
      }
    } catch (error) {
      console.error(error);
    }
  });
}

async function logCheck(transaction: any, Addresses: any, client: any) {
  const details = [];
  const tran = await provider.getTransactionReceipt(transaction);
  try {
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
        const from = await Address.find({ address: tran.from.toLowerCase() });
        // console.log("----------");
        // console.log("Hash: " + tran.transactionHash);
        // console.log(
        //   "Etherscan link: " + "https://etherscan.io/tx/" + tran.transactionHash
        // );
        // console.log("to: " + tran.to);
        // console.log("from " + tran.from + " : " + from[0].label);
        // details.map((token) => {
        //   console.log("----------");
        //   console.log(token.token + ": " + token.sym);
        //   console.log("Amount: " + token.amount);
        //   console.log("https://dexscreener.com/ethereum/" + token.tokenAddress);
        // });
        const channel = client.channels.cache.get(config.CHANNELID);
        const embed = new EmbedBuilder()
          .setTitle(from[0].label + " made a transaction!")
          .setURL("https://etherscan.io/tx/" + tran.transactionHash)
          .setDescription(
            "[" +
              details[0].amount +
              " " +
              details[0].token +
              " (" +
              details[0].sym +
              ") ](https://dexscreener.com/ethereum/" +
              details[0].tokenAddress +
              ")" +
              "\n swapped for \n" +
              "[" +
              details[1].amount +
              " " +
              details[1].token +
              " (" +
              details[1].sym +
              ") ](https://dexscreener.com/ethereum/" +
              details[1].tokenAddress +
              ")"
          );

        channel.send({ embeds: [embed] });
      } catch (error) {
        console.log("wrong transaction type");
      }
    }
  } catch (error) {
    console.log("null address");
  }
}
