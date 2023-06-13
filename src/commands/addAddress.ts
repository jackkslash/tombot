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
  //if null create
  //if label exist push to address array
  const label = interaction.options.getString("label");
  const add = interaction.options.getString("address");
  const search = await Address.findOne({ label: label });

  if (search == null) {
    Address.create({
      address: [add],
      label: label,
    });

    return interaction.reply(
      "Address added and new entry for that person created."
    );
  } else if (search != null) {
    await Address.findOneAndUpdate(
      { label: label },
      {
        $push: {
          address: add,
        },
      }
    );
    return interaction.reply(
      "Address added and added to previous entry for that person."
    );
  }
}
