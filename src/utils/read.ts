import { Dirent, readdirSync } from "node:fs";
import { resolve } from "path";

import { Command } from "../interfaces/command";

const filterRequiredFiles = (
  item: Dirent
): boolean =>
  (item.isFile() && item.name.endsWith(".ts")) || item.isDirectory();

export interface CommandF {
  (command: Command): void;
};

export const readCommands = (
  path: string,
  func: CommandF
): void => {
  readdirSync(path, { withFileTypes: true })
    .filter((item: Dirent): boolean => filterRequiredFiles(item))
    .forEach(async (item: Dirent): Promise<void> => {
      const { command }: { command: Command } = await import(resolve(
        path,
        item.name + (item.isDirectory() ? "/index.js" : "")
      ));
      func(command);
    })
};
