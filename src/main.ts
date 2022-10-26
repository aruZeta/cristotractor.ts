import { Client } from "discord.js";
import { config as setupEnvVars } from "dotenv";
import { inviteLink } from "./utils/invite";

setupEnvVars();

console.log("Bot is starting ...");

const discord = new Client({ intents: [] });
discord.login(process.env.token);

discord.once("ready", () => {
    console.log(`Logged in as ${discord.user?.tag}!`);
    console.log(inviteLink);

    discord.user?.setActivity("ping pong inestable");
    discord.user?.setUsername("Cristotractor 2.0 (unstable)");
});
