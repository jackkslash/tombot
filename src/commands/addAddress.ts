import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("Add Address")
  .setDescription("Add address");

export async function execute(interaction: CommandInteraction) {
  return interaction.reply("test");
}
