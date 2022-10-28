import { Client } from "discord.js";
import { config as setupEnvVars } from "dotenv";
import Config from "../interfaces/config";
import config from "../config.json";

export default class Cristotractor extends Client {
  public static config: Config = config;

  public static genInviteLink = (): string =>
    "https://discord.com/api/oauth2/authorize"
    + `?client_id=${this.config.bot.clientId}`
    + `&permissions=${this.config.bot.permissions}`
    + `&scope=bot%20applications.commands`;

  public init = async (
  ): Promise<void> => {
    setupEnvVars();

    console.log("Cristotractor is starting the tractor's engine ...");
    this.login(process.env.token).then((): void => {
      console.log("Cristotractor succesfully started the tractor's engine!");
      console.log(`Tractor started: ${this.user?.tag}`);
    }).catch((err: Error): void => {
      console.log("Cristotractor failed to start the engine, exploding");
      console.error(err);
      process.exit(1);
    });

    this.once("ready", async (
    ): Promise<void> => {
      if (!this.user) throw "F";
      console.log(Cristotractor.genInviteLink());
      this.user.setActivity("tractor go brrr");
      this.user.setUsername("Cristotractor (exploding)");
    });
  };
}
