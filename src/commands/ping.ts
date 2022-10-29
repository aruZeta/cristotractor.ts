import { CommandInteraction } from "discord.js";

import { ICommand, ECommandType } from "../interfaces/command";

export const command: ICommand = {
  name: "ping",
  description: "Responde con un pong.",
  type: ECommandType.chatInput,
  run: async (interaction: CommandInteraction): Promise<any> => {
    await interaction.reply("Pong!")
  },
};
