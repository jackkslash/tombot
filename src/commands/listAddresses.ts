import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Address } from "../models/Address";
import { add } from ".";

export const data = new SlashCommandBuilder()
  .setName("list")
  .setDescription("List address");

export async function execute(interaction: CommandInteraction) {
  const adds = await Address.find({}, { address: 1, label: 1, _id: 0 });

  return interaction.reply(adds + "");
}
