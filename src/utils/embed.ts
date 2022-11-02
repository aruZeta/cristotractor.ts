import { ButtonComponentData, ButtonStyle, ComponentType } from "discord.js";
import { Types } from "mongoose";
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

export const backButton = (
  command: string,
  id: string,
): ButtonComponentData => ({
  type: ComponentType.Button,
  style: ButtonStyle.Secondary,
  emoji: { name: "⬅️" },
  customId: `${command}->backButton->${id}`,
});

export const forwardButton = (
  command: string,
  id: string,
): ButtonComponentData => ({
  type: ComponentType.Button,
  style: ButtonStyle.Secondary,
  emoji: { name: "➡️" },
  customId: `${command}->forwardButton->${id}`,
});

export const toolsButton = (
  command: string,
  id: string,
): ButtonComponentData => ({
  type: ComponentType.Button,
  style: ButtonStyle.Secondary,
  emoji: { name: "🛠️" },
  customId: `${command}->toolsButton->${id}`,
});
