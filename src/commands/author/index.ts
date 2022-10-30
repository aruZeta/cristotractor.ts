import {
  ChatInputCommandInteraction,
  Collection,
} from "discord.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { readSubcommands } from "../../utils/read";
import {
  ICommand,
  ECommandType,
  ICommandOption,
  TSubcommandRun
} from "../../interfaces/command";

const subcommands: Collection<String, TSubcommandRun> = new Collection();

export const command: ICommand = {
  name: "autor",
  description: "Comandos de autores",
  type: ECommandType.chatInput,

  options: await readSubcommands(dirname(fileURLToPath(import.meta.url)), (
    subcommand: ICommandOption,
    run: TSubcommandRun,
  ) => subcommands.set(subcommand.name, run)),
};

export const run = async (
  interaction: ChatInputCommandInteraction,
): Promise<any> => {
  const subcommand: TSubcommandRun | undefined =
    subcommands.get(interaction.options.getSubcommand())
  if (!subcommand) return;
  await subcommand(interaction);
};
