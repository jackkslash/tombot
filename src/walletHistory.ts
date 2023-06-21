import { ethers } from "ethers";
import config from "./config";
let address = ["0x15c92560b75dae892d6be088a0249f967b6a93fd"];
let ethprovider = new ethers.providers.EtherscanProvider();
let provider = new ethers.providers.InfuraProvider(config.RPCULR1);

//all contracts that needs to be tracked
//submit all needed transactions to db
//then submit address once finished to start live tracking

address.forEach((add) => {
  getHistory(add);
});

function getHistory(address: string) {
  ethprovider.getHistory(address).then((history) => {
    history.forEach(async (tx) => {
      const test = await provider.getTransactionReceipt(tx.hash);
      console.log(test);
      await sleep(1000);
    });
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
