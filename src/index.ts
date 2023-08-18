import { Client, GatewayIntentBits } from "discord.js";
import config from "./config";
import * as commandsModules from "./commands";
import { transactionTracker, transactionTrackerTest } from "./watcher";
import mongoose from "mongoose";
import { newPairSocket } from "./ws";

console.log("Bot is starting...");

const commands = Object(commandsModules);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  await mongoose.connect(config.MONGODB);
  console.log("DB connected");
  //transactionTracker(client);
  transactionTrackerTest(client);
  // newPairSocket(client);
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
