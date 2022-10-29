import { ChatInputCommandInteraction } from "discord.js";

import { genDefaultEmbed, IEmbed } from "../../../interfaces/embed";
import { ECommandOptionType, ICommandOption } from "../../../interfaces/command";

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
