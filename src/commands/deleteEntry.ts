import { SlashCommandBuilder } from "discord.js";
import { Address } from "../models/Address";

export const data = new SlashCommandBuilder()
  .setName("purge")
  .setDescription("Remove enitre entry")
  .addStringOption((option) =>
    option
      .setName("label")
      .setDescription("The label of the wallets you wish to purge.")
      .setRequired(true)
  );

export async function execute(interaction: any) {
  const lab = interaction.options.getString("label");
  await Address.findOneAndDelete({ label: lab });
  return interaction.reply(lab + " was deleted.");
}
