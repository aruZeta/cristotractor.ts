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

export const backButton: ButtonComponentData = {
  type: ComponentType.Button,
  style: ButtonStyle.Secondary,
  emoji: { name: "⬅️" },
  customId: "backButton",
};

export const forwardButton: ButtonComponentData = {
  type: ComponentType.Button,
  style: ButtonStyle.Secondary,
  emoji: { name: "➡️" },
  customId: "forwardButton",
};

export const toolsButton: ButtonComponentData = {
  type: ComponentType.Button,
  style: ButtonStyle.Secondary,
  emoji: { name: "🛠️" },
  customId: "toolsButton",
};
