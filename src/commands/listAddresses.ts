import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Address } from "../models/Address";
import { add } from ".";

export const data = new SlashCommandBuilder()
  .setName("list")
  .setDescription("List address, debug command for admin to see raw db output");

export async function execute(interaction: CommandInteraction) {
  const adds = await Address.find({}, { address: 1, label: 1, _id: 0 });
  console.log(adds);
  return interaction.reply(adds + "");
}
