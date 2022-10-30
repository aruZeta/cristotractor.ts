import { CommandInteraction, GuildMemberRoleManager } from "discord.js";
import Cristotractor from "../client/index";

export const checkLetter = async (
  interaction: CommandInteraction,
  letter: string
): Promise<string> | never => {
  if (letter.length != 1) {
    await interaction.reply({
      content: `\`${letter}\` no es una letra!`,
      ephemeral: true
    });
    throw "Check failed";
  } else {
    const actualLetter = letter.toLowerCase();
    if (!Cristotractor.config.letters.includes(actualLetter)) {
      await interaction.reply({
        content: `\`${letter}\` no es una letra registrada!`,
        ephemeral: true
      });
      throw "Check failed";
    }
    return actualLetter;
  }
}

export const checkAdmin = async (
  interaction: CommandInteraction
): Promise<void> => {
  if (!(<GuildMemberRoleManager>interaction.member?.roles).cache.has(
    Cristotractor.config.bot.mainGuild.adminRoleId
  )) {
    await interaction.reply({
      content: "Solo un admin puede ejecutar este comando.",
      ephemeral: true
    });
    throw "Check failed";
  }
}

export const commonCheck = async (
  interaction: CommandInteraction,
  text: string
): Promise<void> => {
  await interaction.reply({
    content: text,
    ephemeral: true
  });
  throw "Check failed";
}
