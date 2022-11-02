import {
  Client,
  Collection,
  Interaction,
  Routes
} from "discord.js";
import { REST } from "@discordjs/rest";
import { config as setupEnvVars } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import Config from "../interfaces/config";
import config from "../config.json" assert {type: "json"};
import { readCommands } from "../utils/read";
import { ICommand, TCommandRun } from "../interfaces/command";
import { IMongoCache } from "../interfaces/mongoCache";
import { AuthorModel, IAuthor } from "../models/author";
import { IVehicle, VehicleModel } from "../models/vehicle";

const commands: Collection<String, TCommandRun> = new Collection();
const __dirname: string = dirname(fileURLToPath(import.meta.url));

export default class Cristotractor extends Client {
  public static commands: ICommand[] = [];
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

  public static removeAllCommands = (): void => {
    Cristotractor.rest.put(
      Routes.applicationGuildCommands(
        config.bot.clientId,
        config.bot.mainGuild.id
      ), { body: [] }
    ).then(() => console.log("Successfully deleted all guild commands!")
    ).catch(console.error);
  }

  public static updateMongoCache = async (): Promise<void> => {
    try {
      console.log("Fetching cache ...");
      (await AuthorModel.find({})).forEach((author: IAuthor): void => {
        Cristotractor.mongoCache.authors.set(author.name, author._id);
      });
      (await VehicleModel.find({})).forEach((vehicle: IVehicle): void => {
        Cristotractor.mongoCache.authors.set(vehicle.name, vehicle._id);
      });
      console.log("Cristotractor is starting to remember it's powers ...");
      Cristotractor.commands = await readCommands(
        resolve(__dirname, "../commands"),
        (command: ICommand, run: TCommandRun): void => {
          commands.set(command.name, run)
        }
      );
      Cristotractor.rest.put(
        Routes.applicationGuildCommands(
          config.bot.clientId,
          config.bot.mainGuild.id
        ), { body: Cristotractor.commands }
      );
      console.log("Cristotractor remembered it's powers! It became bald tho.");
    } catch (err) {
      console.log("Cristotractor couldn't remembered it's powers :(");
      console.error(err);
      process.exit(1);
    }
  };

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

    console.log("Cristotractor is starting to connect the data cable ...");
    mongoose.connect(
      `mongodb+srv://${process.env.mongoUser}:${process.env.mongoPswd}`
      + "@data.0t392.mongodb.net/cristotractor?retryWrites=true&w=majority",
      { dbName: "cristotractor" }
    ).then((): void => {
      console.log("Cristotractor succesfully connected the data cable!");
      Cristotractor.updateMongoCache()
    }).catch((err: Error): void => {
      console.log("The data cable exploded");
      console.error(err);
      process.exit(1);
    });

    this.once("ready", async (
    ): Promise<void> => {
      if (!this.user) throw "F";
      console.log(Cristotractor.genInviteLink());
      this.user.setActivity("tractor go brrr");
      this.user.setUsername("Cristotractor 2.0");
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
      } catch (error) {
        if (error != "Check failed") {
          console.error(error);
          await interaction.reply({
            content: "Hubo un error ejecutando el comando.",
            ephemeral: true
          });
        }
      }
    })
  };
}
