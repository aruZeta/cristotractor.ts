import { ChatInputCommandInteraction } from "discord.js";

import { checkAdmin, commonCheck } from "../../../utils/checking";
import { ECommandOptionType, ICommandOption } from "../../../interfaces/command";
import { capitalize } from "../../../utils/string";
import { AuthorModel } from "../../../models/author";
import { IEmbed } from "../../../interfaces/embed";
import { genDefaultEmbed } from "../../../utils/embed";

export const subcommand: ICommandOption = {
  name: "nuevo",
  description: "Añade un nuevo autor a la DB (solo admins).",
  type: ECommandOptionType.subCommand,
  options: [{
    name: "nombre",
    description: "Nombre del autor",
    type: ECommandOptionType.string,
    required: true
  }],
};

export const run = async (
  interaction: ChatInputCommandInteraction,
): Promise<any> => {
  await checkAdmin(interaction);

  const author: string = capitalize(
    <string>interaction.options.getString("nombre")
  );

  if (await AuthorModel.findOne({ name: author })) {
    await commonCheck(interaction, `El autor \`${author}\` ya existe`);
  }

  AuthorModel.create({
    name: author,
    vehicles: [],
    phrases: [],
    bias: 0,
  });

  const msgEmbed: IEmbed = genDefaultEmbed();
  msgEmbed.title = "Autor añadido";
  msgEmbed.fields = [{
    name: "Nombre:",
    value: author,
    inline: true,
  }];

  await interaction.reply({
    embeds: [msgEmbed],
  });
};
