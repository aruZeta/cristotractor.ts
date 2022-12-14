import { CommandInteraction } from "discord.js";

import { ICommand, ECommandType } from "../interfaces/command";
import { IEmbed } from "../interfaces/embed";
import { genDefaultEmbed } from "../utils/embed";

export const command: ICommand = {
  name: "ping",
  description: "Responde con un pong.",
  type: ECommandType.chatInput,
};

export const run = async (
  interaction: CommandInteraction
): Promise<any> => {
  const msgEmbed: IEmbed = genDefaultEmbed()
  msgEmbed.title = "Pong!";

  await interaction.reply({
    embeds: [msgEmbed],
  });
};
