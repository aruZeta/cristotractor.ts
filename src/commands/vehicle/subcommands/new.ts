import { ChatInputCommandInteraction } from "discord.js";

import { checkAdmin } from "../../../utils/checking";
import { ECommandOptionType, ICommandOption, ICommandOptionChoice } from "../../../interfaces/command";
import { AuthorModel } from "../../../models/author";
import { VehicleModel } from "../../../models/vehicle";
import { IEmbed } from "../../../interfaces/embed";
import { genDefaultEmbed } from "../../../utils/embed";
import Cristotractor from "../../../client";
import { Types } from "mongoose";

export const subcommand: ICommandOption = {
  name: "nuevo",
  description: "Añade un nuevo vehiculo a la DB (solo admins).",
  type: ECommandOptionType.subCommand,
  options: [{
    name: "nombre",
    description: "Nombre del vehiculo",
    type: ECommandOptionType.string,
    required: true
  }, {
    name: "autor",
    description: "Autor propietario del vehiculo",
    type: ECommandOptionType.string,
    required: true,
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
  await checkAdmin(interaction);

  const name: string = <string>interaction.options.getString("nombre")
  const author: string = <string>interaction.options.getString("autor");
  const authorID: Types.ObjectId =
    <Types.ObjectId>Cristotractor.mongoCache.authors.get(author)

  VehicleModel.create({
    name: name,
  }).then(async (vehicleDoc): Promise<void> => {
    await AuthorModel.updateOne(
      { _id: authorID },
      { $push: { vehicles: vehicleDoc._id } }
    );
  });

  const msgEmbed: IEmbed = genDefaultEmbed();
  msgEmbed.title = "Vehiculo añadido";
  msgEmbed.fields = [{
    name: "Dueño:",
    value: author,
    inline: true,
  }, {
    name: "Nombre:",
    value: name,
    inline: true,
  }];

  await interaction.reply({
    embeds: [msgEmbed],
  });
};
