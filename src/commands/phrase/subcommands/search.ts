import {
  ChatInputCommandInteraction,
  SelectMenuComponentOptionData,
} from "discord.js";
import { Types } from "mongoose";

import { IEmbed } from "../../../interfaces/embed";
import {
  genDefaultEmbed,
} from "../../../utils/embed";
import {
  ECommandOptionType,
  ICommandOption,
} from "../../../interfaces/command";
import Cristotractor from "../../../client";
import { PhraseModel } from "../../../models/phrase";
import {
  onlyPhraseAndId,
  toLimitedSizeArr,
  groupBy,
} from "../../../utils/mongoSearch";
import { updateReply } from "../../../utils/phrase/updatePhraseList";

export const subcommand: ICommandOption = {
  name: "buscar",
  description: "Muestra las frases que coinciden con la busqueda pasada.",
  type: ECommandOptionType.subCommand,
  options: [{
    name: "busqueda",
    description: "String de busqueda (admite regex)",
    type: ECommandOptionType.string,
    required: true,
  }],
};

export const run = async (
  interaction: ChatInputCommandInteraction,
): Promise<any> => {
  const search: string = <string>interaction.options.getString("busqueda");

  const msgEmbed: IEmbed = genDefaultEmbed();
  msgEmbed.title = `Frases buscadas con \`${search}\``;

  type TPhraseAndIds = { phrases: string[][] | undefined, ids: Types.ObjectId[][] | undefined };

  const { phrases, ids }: TPhraseAndIds = (await PhraseModel.aggregate([
    onlyPhraseAndId,
    { $match: { phrase: { $regex: search, $options: "i" } } },
    groupBy("$phrase", "$_id"),
    ...toLimitedSizeArr(true),
  ]))[0] || [];

  if (!phrases || !ids) {
    msgEmbed.description = "Ninguna";
    await interaction.reply({
      embeds: [msgEmbed],
    });
    return;
  }

  const compID = new Types.ObjectId().toString();

  Cristotractor.compInteractionCache.add(
    compID,
    {
      msgEmbed: msgEmbed,
      authorID: null,
      letter: null,
      phrases: phrases,
      ids: ids,
      currentIndex: 0,
      options: <SelectMenuComponentOptionData[][]>Array(phrases.length),
      interaction: interaction,
    }
  );

  await interaction.reply(updateReply(compID));
}
