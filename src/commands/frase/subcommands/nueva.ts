import { ChatInputCommandInteraction } from "discord.js";

import { genDefaultEmbed, IEmbed } from "../../../interfaces/embed";
import { ECommandOptionType, ICommandOption, ICommandOptionChoice } from "../../../interfaces/command";
import Cristotractor from "../../../client";

export const subcommand: ICommandOption = {
  name: "nueva",
  description: "Añade una nueva frase a la DB (solo admins).",
  type: ECommandOptionType.subCommand,
  options: [
    {
      name: "letra",
      description: "Letra de la frase",
      type: ECommandOptionType.string,
      required: true,
    },
    {
      name: "frase",
      description: "La frase en si",
      type: ECommandOptionType.string,
      required: true,
    },
    {
      name: "autor",
      description: "Autor de la frase",
      type: ECommandOptionType.string,
      required: false,
      choices: Cristotractor.mongoCache.authors.map(
        (_: any, key: string): ICommandOptionChoice => {
          return { name: key, value: key };
        }
      ),
    },
  ],
};

export const run = async (
  interaction: ChatInputCommandInteraction,
): Promise<any> => {
  const msgEmbed: IEmbed = genDefaultEmbed();
  msgEmbed.title = "Frase añadida";

  await interaction.reply({
    embeds: [msgEmbed],
  });
};
