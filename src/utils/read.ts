import { Dirent, readdirSync } from "node:fs";
import { resolve } from "path";

import {
  ICommand,
  ICommandOption,
  TCommandRun,
  TSubcommandRun
} from "../interfaces/command";

const filterRequiredFiles = (
  item: Dirent
): boolean =>
  (item.isFile() && item.name.endsWith(".ts")) || item.isDirectory();

export type TCommandFn = (
  command: ICommand,
  run: TCommandRun,
) => void;

export const readCommands = (
  path: string,
  func: TCommandFn
): ICommand[] => {
  const result: ICommand[] = Array();

  readdirSync(path, { withFileTypes: true })
    .filter((item: Dirent): boolean => filterRequiredFiles(item))
    .forEach(async (item: Dirent): Promise<void> => {
      const { command, run }: {
        command: ICommand,
        run: TCommandRun,
      } = await import(resolve(
        path,
        item.name + (item.isDirectory() ? "/index.ts" : "")
      ));
      func(command, run);
      result.push(command);
    })

  return result;
};

export type TSubcommandFn = (
  subcommand: ICommandOption,
  run: TSubcommandRun,
) => void;

export const readSubcommands = (
  path: string,
  func: TSubcommandFn,
): ICommandOption[] => {
  const result: ICommandOption[] = Array();

  readdirSync(resolve(path, "subcommands"), { withFileTypes: true })
    .filter((item: Dirent): boolean => filterRequiredFiles(item))
    .forEach(async (item: Dirent): Promise<void> => {
      const { subcommand, run }: {
        subcommand: ICommandOption,
        run: TSubcommandRun,
      } = await import(resolve(
        path,
        item.name + (item.isDirectory() ? "/index.ts" : "")
      ));
      func(subcommand, run);
      result.push(subcommand);
    })

  return result;
};
