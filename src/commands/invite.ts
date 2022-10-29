import { CommandInteraction } from "discord.js";

import Cristotractor from "../client";
import { ICommand, ECommandType } from "../interfaces/command";
import { genDefaultEmbed, IEmbed } from "../interfaces/embed";

export const command: ICommand = {
  name: "invite",
  description: "Muestra un link de invitacion del bot.",
  type: ECommandType.chatInput,
  run: async (interaction: CommandInteraction): Promise<any> => {
    const msgEmbed: IEmbed = genDefaultEmbed()
    msgEmbed.title = "Link de invitacion";
    msgEmbed.url = Cristotractor.genInviteLink();

    await interaction.reply({
      embeds: [msgEmbed],
    });
  },
}
