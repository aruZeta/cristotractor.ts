import {
  Client,
  Collection,
  Interaction,
  Routes
} from "discord.js";
import { REST } from "@discordjs/rest";
import { config as setupEnvVars } from "dotenv";
import { resolve } from "path";

import Config from "../interfaces/config";
import config from "../config.json";
import { readCommands } from "../utils/read";
import { ICommand, TCommandRun } from "../interfaces/command";
import mongoose from "mongoose";

const commands: Collection<String, TCommandRun> = new Collection();

export default class Cristotractor extends Client {
  public commands: ICommand[] = readCommands(
    resolve(__dirname, "../commands"),
    (command: ICommand, run: TCommandRun) => commands.set(command.name, run)
  );
  public static config: Config = config;

  public static mongoCache: IMongoCache = {
    authors: new Collection(),
    vehicles: new Collection(),
  };

  public static rest: REST = new REST({
    version: "10"
  });

  public static genInviteLink = (): string =>
    "https://discord.com/api/oauth2/authorize"
    + `?client_id=${this.config.bot.clientId}`
    + `&permissions=${this.config.bot.permissions}`
    + `&scope=bot%20applications.commands`;

  public init = async (
  ): Promise<void> => {
    setupEnvVars();

    Cristotractor.rest.setToken(<string>process.env.token);

    console.log("Cristotractor is starting the tractor's engine ...");
    this.login(process.env.token).then((): void => {
      console.log("Cristotractor succesfully started the tractor's engine!");
      console.log(`Tractor started: ${this.user?.tag}`);
    }).catch((err: Error): void => {
      console.log("Cristotractor failed to start the engine, exploding");
      console.error(err);
      process.exit(1);
    });

    console.log("Cristotractor is starting to connect the data cable");
    mongoose.connect(
      `mongodb+srv://${process.env.mongoUser}:${process.env.mongoPswd}`
      + "@data.0t392.mongodb.net/cristotractor?retryWrites=true&w=majority",
      { dbName: "cristotractor" }
    ).then((): void => {
      console.log("Cristotractor succesfully connected the data cable!");
    }).catch((err: Error): void => {
      console.log("The data cable exploded");
      console.error(err);
      process.exit(1);
    });

    this.once("ready", async (
    ): Promise<void> => {
      if (!this.user) throw "F";
      console.log("Cristotractor is starting to remember it's powers");
      await rest.put(
        Routes.applicationGuildCommands(
          config.bot.clientId,
          config.bot.mainGuild.id
        ),
        { body: this.commands }
      );
      console.log("Cristotractor remembered it's powers! It became bald tho.");
      console.log(Cristotractor.genInviteLink());
      this.user.setActivity("tractor go brrr");
      this.user.setUsername("Cristotractor (exploding)");
    });

    this.on("interactionCreate", async (
      interaction: Interaction
    ): Promise<void> => {
      if (!interaction.isCommand()) return;
      try {
        const command: TCommandRun | undefined =
          commands.get(interaction.commandName);
        if (!command) return;
        await command(interaction);
      }
      catch (error) {
        console.error(error);
        await interaction.reply({
          content: "Hubo un error ejecutando el comando.",
          ephemeral: true
        });
      }
    })
  };
}
