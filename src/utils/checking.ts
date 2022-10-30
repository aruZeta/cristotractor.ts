import { CommandInteraction } from "discord.js";
import Cristotractor from "../client/index";

export const checkLetter = async (
  interaction: CommandInteraction,
  letter: string
): Promise<string> => {
  letter.toLowerCase();
  if (letter.length != 1 || !Cristotractor.config.letters.includes(letter)) {
    await interaction.reply({
      content: `\`${letter}\` no es una letra aceptada!`,
      ephemeral: true
    });
    throw 'Check failed';
  }
  return letter;
}
