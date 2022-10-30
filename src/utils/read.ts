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
  (item.isFile() && item.name.endsWith(".js")) || item.isDirectory();

export type TCommandFn = (
  command: ICommand,
  run: TCommandRun,
) => void;

const getItems = (path: string): Dirent[] =>
  readdirSync(path, { withFileTypes: true })
    .filter((item: Dirent): boolean => filterRequiredFiles(item))

export const readCommands = async (
  path: string,
  func: TCommandFn
): Promise<ICommand[]> => {
  const result: ICommand[] = Array();

  for (let item of getItems(path)) {
    const { command, run }: { command: ICommand, run: TCommandRun } =
      await import(resolve(
        path,
        item.name + (item.isDirectory() ? "/index.js" : "")
      ));
    func(command, run);
    result.push(command);
  }

  return result;
};

export type TSubcommandFn = (
  subcommand: ICommandOption,
  run: TSubcommandRun,
) => void;

export const readSubcommands = async (
  path: string,
  func: TSubcommandFn,
): Promise<ICommandOption[]> => {
  const result: ICommandOption[] = Array();
  const actualPath: string = resolve(path, "subcommands");

  for (let item of getItems(actualPath)) {
    const { subcommand, run }: {
      subcommand: ICommandOption,
      run: TSubcommandRun,
    } = await import(resolve(
      actualPath,
      item.name + (item.isDirectory() ? "/index.js" : "")
    ));
    func(subcommand, run);
    result.push(subcommand);
  }

  return result;
};
