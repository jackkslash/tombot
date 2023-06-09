import { Client, GatewayIntentBits } from "discord.js";
import config from "./config";
import * as commandsModules from "./commands";
import { transactionTracker } from "./watcher";
import { clientdb } from "./db";

console.log("Bot is starting...");

const commands = Object(commandsModules);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
  clientdb.connect();
  console.log("DB connected");
  transactionTracker(client);
  console.log("Alive");
});

client.on("interactionCreate", async (interaction: any) => {
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName } = interaction;
  commands[commandName].execute(interaction, client);
});

client.login(config.DISCORDBOTTOKEN);
