import { ChatInputCommandInteraction } from "discord.js";
import { Types } from "mongoose";

import { IEmbed } from "../../../interfaces/embed";
import { genDefaultEmbed } from "../../../utils/embed";
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
    const vehicles = (await AuthorModel.aggregate([
      { $match: { _id: authorID } },
      { $project: { _id: 0, vehicles: 1 } },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicles",
          foreignField: "_id",
          pipeline: [{ $project: { _id: 0, name: 1 } }],
          as: "vehicles",
        }
      },
    ]))[0].vehicles || [];
    msgEmbed.title = `${author}`;
    console.log(vehicles);
    msgEmbed.fields = [{
      name: "Vehiculos:",
      value: vehicles
        ? vehicles.map((v: any): string => `○ ${v.name}`).join("\n")
        : "Ninguno",
    }];
  } else {
    msgEmbed.title = "Autores";
    msgEmbed.description = (await AuthorModel.find({})).map(
      (author: IAuthor): string =>
        `○ ${author.name}`
    ).join("\n") ?? "Ninguno";
  }

  await interaction.reply({
    embeds: [msgEmbed],
  });
};
