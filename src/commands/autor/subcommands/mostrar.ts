import { ChatInputCommandInteraction } from "discord.js";
import { Types } from "mongoose";

import { genDefaultEmbed, IEmbed } from "../../../interfaces/embed";
import {
  ECommandOptionType,
  ICommandOption,
  ICommandOptionChoice
} from "../../../interfaces/command";
import Cristotractor from "../../../client";
import { AuthorModel, IAuthor } from "../../../models/author";
import { VehicleModel } from "../../../models/vehicle";

export const subcommand: ICommandOption = {
  name: "mostrar",
  description: "Muestra los autores (o info del autor dado).",
  type: ECommandOptionType.subCommand,
  options: [{
    name: "autor",
    description: "Nombre del autor",
    type: ECommandOptionType.string,
    required: false,
    choices: Cristotractor.mongoCache.authors.map(
      (_: any, key: string): ICommandOptionChoice => {
        return { name: key, value: key };
      }
    ),
  }],
};

export const run = async (
  interaction: ChatInputCommandInteraction,
): Promise<any> => {
  const author: string | null = interaction.options.getString("autor");
  const authorID: Types.ObjectId | null =
    author
      ? <Types.ObjectId>Cristotractor.mongoCache.authors.get(author)
      : null;

  const msgEmbed: IEmbed = genDefaultEmbed();

  if (authorID) {
    let desc: string = "";
    (await AuthorModel.findById(authorID))?.vehicles.forEach(
      async (vehicleID: Types.ObjectId): Promise<string> =>
        desc += <string>(await VehicleModel.findById(vehicleID))?.name + "\n"
    );
    msgEmbed.title = `${author}`;
    msgEmbed.fields = [{
      name: "Vehiculos:",
      value: desc.length == 0 ? "Ninguno" : desc,
    }];
  } else {
    msgEmbed.title = "Autores";
    msgEmbed.description = (await AuthorModel.find({})).map(
      (author: IAuthor): string =>
        `${author.name} (id: \`${author._id.toString()}\`)`
    ).join("\n") ?? "Ninguno";
  }

  await interaction.reply({
    embeds: [msgEmbed],
  });
};
