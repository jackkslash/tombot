import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("List Address")
  .setDescription("List address");

export async function execute(interaction: CommandInteraction) {
  return interaction.reply("test");
}
