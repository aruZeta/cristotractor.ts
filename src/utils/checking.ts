import { CommandInteraction } from "discord.js";
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
    letter.toLowerCase();
    if (!Cristotractor.config.letters.includes(letter)) {
      await interaction.reply({
        content: `\`${letter}\` no es una letra registrada!`,
        ephemeral: true
      });
      throw "Check failed";
    }
    return letter;
  }
}
}
