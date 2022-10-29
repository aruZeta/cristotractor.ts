import { Command, CommandType } from "../interfaces/command";

export const command: Command = {
  name: "ping",
  description: "Responde con un pong.",
  type: CommandType.chatInput,
  run: async (interaction) => {
    await interaction.reply("Pong!")
  },
};
