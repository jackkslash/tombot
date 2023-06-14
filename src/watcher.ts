import { ethers } from "ethers";
import ABI from "./abi/ERC20ABI.json";
import { Address } from "./models/Address";

const NODE_URL = "https://ethereum-mainnet-rpc.allthatnode.com";
const provider = new ethers.providers.JsonRpcProvider(NODE_URL);
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
      //console.log(block.number);
      for (const transaction of block.transactions) {
        logCheck(transaction, Addresses);
      }
    } catch (error) {
      console.error(error);
    }
  });
}

async function logCheck(transaction: any, Addresses: any) {
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
