import { CommandInteraction } from "discord.js";

export interface Command {
  name: string,
  description: string,
  type: CommandType,
  options?: CommandOption[],
  run: (
    interaction: CommandInteraction
  ) => Promise<any> | any,
};

export interface CommandOption {
  name: string,
  description: string,
  type: CommandOptionType;
  required: boolean,
  choices?: CommandOptionChoices[],
  options?: CommandOption[],
  min_value?: number,
  max_value?: number,
  min_length?: number,
  max_length?: number,
};

export interface CommandOptionChoices {
  name: string,
  value: string | number,
};

export enum CommandType {
  chatInput = 1,
  user = 2,
  message = 3,
};

export enum CommandOptionType {
  subCommand = 1,
  subCommandGroup = 2,
  string = 3,
  integer = 4,
  boolean = 5,
  user = 6,
  channel = 7,
  role = 8,
  mentionable = 9,
  number = 1,
  attachment = 1,
};
