import { Client, GatewayIntentBits } from "discord.js";
import config from "./config";
import * as commandsModules from "./commands";

console.log("Bot is starting...");

const commands = Object(commandsModules);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
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
