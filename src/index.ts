import { IntentsBitField } from "discord.js";
import Cristotractor from "./client";

const cristotractor = new Cristotractor({
  intents: [IntentsBitField.Flags.Guilds]
});

cristotractor.init();
