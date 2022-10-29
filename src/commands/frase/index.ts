import {
  ChatInputCommandInteraction,
  Collection,
  CommandInteraction,
} from "discord.js";

import { readSubcommands } from "../../utils/read";
import {
  ICommand,
  ECommandType,
  ICommandOption,
  TSubcommandRun
} from "../../interfaces/command";

const subcommands: Collection<String, TSubcommandRun> = new Collection();

export const command: ICommand = {
  name: "frase",
  description: "Comandos de frases",
  type: ECommandType.chatInput,

  options: readSubcommands(__dirname, (
    subcommand: ICommandOption,
    run: TSubcommandRun,
  ) => subcommands.set(subcommand.name, run)),
};

export const run = async (
  interaction: ChatInputCommandInteraction,
): Promise<any> => {
  try {
    const subcommand: TSubcommandRun | undefined =
      subcommands.get(interaction.options.getSubcommand())
    if (!subcommand) return;
    await subcommand(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "Hubo un error ejecutando el comando.",
      ephemeral: true
    });
  }
};
