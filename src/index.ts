import { IntentsBitField } from "discord.js";

import Cristotractor from "./client";

const cristotractor: Cristotractor = new Cristotractor({
  intents: [IntentsBitField.Flags.Guilds]
});

cristotractor.init();
