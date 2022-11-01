import { ButtonComponentData, ButtonStyle, ComponentType, Emoji } from "discord.js";
import Cristotractor from "../client";
import { IEmbed } from "../interfaces/embed";

export const genDefaultEmbed = (): IEmbed => {
  return {
    color: 0x1abc96,
    timestamp: new Date().toISOString(),
    author: {
      name: "Cristotractor",
      url: "https://github.com/aruZeta/cristotractor.ts",
      icon_url: Cristotractor.config.bot.userPfp,
    },
  }
};
