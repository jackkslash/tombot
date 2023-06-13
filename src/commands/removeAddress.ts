import { SlashCommandBuilder } from "discord.js";
import { Address } from "../models/Address";

export const data = new SlashCommandBuilder()
  .setName("remove")
  .setDescription("Remove address")
  .addStringOption((option) =>
    option
      .setName("address")
      .setDescription("The address of the wallet.")
      .setRequired(true)
  );

export async function execute(interaction: any) {
  const add = interaction.options.getString("address");
  await Address.findOneAndUpdate(
    { address: add },
    {
      $pull: {
        address: add,
      },
    }
  );
  return interaction.reply(add + "was deleted.");
}
