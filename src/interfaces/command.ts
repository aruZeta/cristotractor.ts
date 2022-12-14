import { ChatInputCommandInteraction, CommandInteraction } from "discord.js";

export interface ICommand {
  name: string,
  description: string,
  type: ECommandType,
  options?: ICommandOption[],
};

export type TCommandRun = (
  interaction: CommandInteraction
) => Promise<any>;

export interface ICommandOption {
  name: string,
  description: string,
  type: ECommandOptionType;
  required?: boolean,
  choices?: ICommandOptionChoice[],
  options?: ICommandOption[],
  min_value?: number,
  max_value?: number,
  min_length?: number,
  max_length?: number,
};

export type TSubcommandRun = (
  interaction: ChatInputCommandInteraction,
) => Promise<any>;

export interface ICommandOptionChoice {
  name: string,
  value: string | number,
};

export enum ECommandType {
  chatInput = 1,
  user = 2,
  message = 3,
};

export enum ECommandOptionType {
  subCommand = 1,
  subCommandGroup = 2,
  string = 3,
  integer = 4,
  boolean = 5,
  user = 6,
  channel = 7,
  role = 8,
  mentionable = 9,
  number = 10,
  attachment = 11,
};
