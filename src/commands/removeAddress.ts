import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("Remove Address")
  .setDescription("Remove address");

export async function execute(interaction: CommandInteraction) {
  return interaction.reply("test");
}
