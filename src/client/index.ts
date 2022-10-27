import { Client } from "discord.js";
import { config as setupEnvVars } from "dotenv";
import { inviteLink } from "../utils/invite";
import Config from "../interfaces/config";
import config from "../config.json";

export default class Cristotractor extends Client {
  public config: Config = config;

  public init = async (
  ) => {
    setupEnvVars();

    console.log("Cristotractor is starting the tractor's engine ...");
    this.login(process.env.token).then(() => {
      console.log("Cristotractor succesfully started the tractor's engine!");
      console.log(`Tractor started: ${this.user?.tag}`)
    }).catch((err: Error) => {
      console.log("Cristotractor failed to start the engine, exploding");
      console.error(err);
      process.exit(1);
    });

    this.once("ready", (
    ) => {
      console.log(inviteLink);
      this.user?.setActivity("tractor go brrr");
      this.user?.setUsername("Cristotractor (exploding)");
    });
  };
}
