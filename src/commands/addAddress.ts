import { SlashCommandBuilder } from "discord.js";
import { Address } from "../models/Address";

export const data = new SlashCommandBuilder()
  .setName("add")
  .setDescription("Add Address")
  .addStringOption((option) =>
    option
      .setName("label")
      .setDescription("The label of the wallet.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("address")
      .setDescription("The ethereum address.")
      .setRequired(true)
  );

export async function execute(interaction: any) {
  const label = interaction.options.getString("label");
  const add = interaction.options.getString("address");

  Address.create({
    address: add,
    label: label,
  });

  return interaction.reply("Address added.");
}
