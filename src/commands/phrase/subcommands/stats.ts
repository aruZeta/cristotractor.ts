import { ChatInputCommandInteraction } from "discord.js";
import { Types } from "mongoose";

import { IEmbed } from "../../../interfaces/embed";
import { genDefaultEmbed } from "../../../utils/embed";
import {
  ECommandOptionType,
  ICommandOption,
  ICommandOptionChoice
} from "../../../interfaces/command";
import { PhraseModel } from "../../../models/phrase";
import { checkLetter } from "../../../utils/checking";
import Cristotractor from "../../../client";
import { LetterModel } from "../../../models/letter";
import { AuthorModel } from "../../../models/author";
import {
  idsToPhrases,
  matchingPhrasesFromLetter,
  onlyPhraseAndId,
  onlyPhrase,
  toStringArr,
  onlyPhrases,
  getRandomPhrase
} from "../../../utils/mongoSearch";

export const subcommand: ICommandOption = {
  name: "estadisticas",
  description: "Muestra las estadisticas de frases.",
  type: ECommandOptionType.subCommand,
};

export const run = async (
  interaction: ChatInputCommandInteraction,
): Promise<any> => {
  const total = await PhraseModel.countDocuments();

  const authors = await AuthorModel.aggregate([{
    $project: {
      _id: 0,
      name: 1,
      count: { $size: "$phrases" }
    }
  }]);

  const noAuthor: number = total - authors.map(
    ({ count }) => count
  ).reduce((prev: number, curr: number) => prev + curr);

  const letters = await LetterModel.aggregate([{
    $project: {
      _id: 0,
      letter: 1,
      count: { $size: "$phrases" }
    }
  }]);

  const msgEmbed = genDefaultEmbed();
  msgEmbed.title = "Estadisticas de frases";
  msgEmbed.fields = [{
    name: "Total",
    value: `${total}`,
  }, {
    name: "Autores",
    value: authors.map(
      ({ name, count }) => `○ \`${name}\`: \`${count}\``
    ).join("\n")
      + `\n○ \`Sin hogar\`: \`${noAuthor}\``,
  }, {
    name: "Letras",
    value: letters.map(
      ({ letter, count }) => `○ \`${letter}\`: \`${count}\``
    ).join("\n"),
  }];

  await interaction.reply({
    embeds: [msgEmbed],
  });
};
