import { ConnectionVisibility, EmbedBuilder } from "discord.js";
import config from "./config";
import WebSocket from "ws";

export function newPairSocket(client: any) {
  const socket = new WebSocket("wss://ws.dextools.io/");
  const channel = client.channels.cache.get(config.PAIRCHANNEL);

  const subscribe = {
    jsonrpc: "2.0",
    method: "subscribe",
    params: { chain: "ether", channel: "uni:pools" },
    id: 2,
  };

  socket.addEventListener("open", (event) => {
    socket.send(JSON.stringify(subscribe));
  });

  socket.addEventListener("message", async (event) => {
    const data = JSON.parse(event.data.toString());
    if (data.result.data.event == "create") {
      console.log("Token created");

      const embed = new EmbedBuilder()
        .setTitle("A new pair found!")
        .setDescription(
          data.result.data.pair.token0.name +
            " " +
            " (" +
            data.result.data.pair.token0.symbol +
            ") " +
            " / " +
            data.result.data.pair.token1.name +
            " " +
            " (" +
            data.result.data.pair.token1.symbol +
            ") \n" +
            "\n [Dexscreener]" +
            "(https://dexscreener.com/ethereum/" +
            data.result.data.pair.id +
            ")" +
            "\n [Dextools]" +
            "(https://www.dextools.io/app/en/ether/pair-explorer/" +
            data.result.data.pair.id +
            ")" +
            "\n [Honeypot]" +
            "(https://honeypot.is/ethereum?address=" +
            data.result.data.pair.id +
            ")" +
            "\n [Defined]" +
            "(https://www.defined.fi/eth/" +
            data.result.data.pair.id +
            ")" +
            "\n [Etherscan]" +
            "(https://etherscan.io/token/" +
            data.result.data.pair.id +
            ")"
        );

      channel.send({ embeds: [embed] });
    }
  });
}
