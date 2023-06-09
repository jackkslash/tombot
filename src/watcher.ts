import { ethers } from "ethers";
import ABI from "./abi/ERC20ABI.json";

const NODE_URL = "https://ethereum-mainnet-rpc.allthatnode.com";
const provider = new ethers.providers.JsonRpcProvider(NODE_URL);
const utils = ethers.utils;

const Addresses = [
  "0x6d2c2297d211eB3f801d0661805E0E80F5f489b4",
  "0x7431931094e8bae1ecaa7d0b57d2284e121f760e",
  "0xa640ce460dcfd2693008c1c38ced030b8ce8ecc4",
  "0xe26027e219998c0aCfBD00b74795dC850AEE244A",
  "0x5Eb67a3b141f3036899EE77822A41277166c540e",
  "0x4A6c660B1EA3F599C785715CBA79d0aDfCC75521",
  "0x4a2C786651229175407d3A2D405d1998bcf40614",
  "0x5e59ac40c4d661e55a97c317a5002bf6d9e7109c",
  "0xd77a8cde26afb5b711f0e25c23a48562d5259bf3",
  "0xe5C4107d6F45da1F5e97Ad678367464937401cC5",
  "0xaaa3f05f25eed87ee3a268f4582ec914e6245577",
  "0x49c3feafddaefc3bed06f4ff87ce86610c2c1076",
  "0x4dbe965abcb9ebc4c6e9d95aeb631e5b58e70d5b",
  "0x97c9fc6dec6e937c86f439426008b21ba22c981d",
  "0x00453979eec8d0d2f204e742039494dd796bae4f",
  "0xbde70adfd16ab60f7307787c97a8fe959a80827a",
];

export function transactionTracker(client: any) {
  console.log("tracker active");
  provider.on("block", async (blockNumber: any) => {
    try {
      const block = await provider.getBlock(blockNumber);
      console.log(block.number);
      for (const transaction of block.transactions) {
        logCheck(transaction);
      }
    } catch (error) {
      console.error(error);
    }
  });
}

async function logCheck(transaction: any) {
  const details = [];
  const tran = await provider.getTransactionReceipt(transaction);
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

      console.log("----------");
      console.log("Hash: " + tran.transactionHash);
      console.log(
        "Etherscan link: " + "https://etherscan.io/tx/" + tran.transactionHash
      );
      console.log("to: " + tran.to);
      console.log("from " + tran.from);
      details.map((token) => {
        console.log("----------");
        console.log(token.token + ": " + token.sym);
        console.log("Amount: " + token.amount);
        console.log("https://dexscreener.com/ethereum/" + token.tokenAddress);
      });
    } catch (error) {
      console.log("wrong transaction type");
    }
  }
}
