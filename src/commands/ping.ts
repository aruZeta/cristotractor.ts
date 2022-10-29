import { CommandInteraction } from "discord.js";

import { ICommand, ECommandType } from "../interfaces/command";
import { genDefaultEmbed, IEmbed } from "../interfaces/embed";

export const command: ICommand = {
  name: "ping",
  description: "Responde con un pong.",
  type: ECommandType.chatInput,
  run: async (interaction: CommandInteraction): Promise<any> => {
    const msgEmbed: IEmbed = genDefaultEmbed()
    msgEmbed.title = "Pong!";

    await interaction.reply({
      embeds: [msgEmbed],
    });
  },
};
