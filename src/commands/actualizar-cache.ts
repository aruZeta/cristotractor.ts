import { CommandInteraction } from "discord.js";

import Cristotractor from "../client";
import { ICommand, ECommandType } from "../interfaces/command";
import { genDefaultEmbed, IEmbed } from "../interfaces/embed";
import { checkAdmin } from "../utils/checking";

export const command: ICommand = {
  name: "actualizar-cache",
  description: "Actualiza la cache de Cristotractor.",
  type: ECommandType.chatInput,
};

export const run = async (
  interaction: CommandInteraction
): Promise<any> => {
  await checkAdmin(interaction);
  await Cristotractor.updateMongoCache();

  const msgEmbed: IEmbed = genDefaultEmbed()
  msgEmbed.title = "Cache de Cristotractor actualizada!";

  await interaction.reply({
    embeds: [msgEmbed],
  });
};
