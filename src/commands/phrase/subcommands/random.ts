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
  onlyPhrase,
  onlyPhrases,
  getRandomPhrase
} from "../../../utils/mongoSearch";

export const subcommand: ICommandOption = {
  name: "aleatoria",
  description: "Muestra una frase aleatoria.",
  type: ECommandOptionType.subCommand,
  options: [{
    name: "letra",
    description: "Letra de las frases",
    type: ECommandOptionType.string,
    required: false,
  }, {
    name: "autor",
    description: "Autor de las frases",
    type: ECommandOptionType.string,
    required: false,
    choices: Cristotractor.mongoCache.authors.map(
      (_: any, key: string): ICommandOptionChoice => {
        return { name: key, value: key };
      }
    ),
  }],
};

export const run = async (
  interaction: ChatInputCommandInteraction,
): Promise<any> => {
  const letter: string | null = await checkLetter(
    interaction,
    interaction.options.getString("letra")
  );
  const author: string | null = interaction.options.getString("autor");
  const authorID: Types.ObjectId | null =
    author
      ? <Types.ObjectId>Cristotractor.mongoCache.authors.get(author)
      : null;

  let phrase: string;

  const msgEmbed: IEmbed = genDefaultEmbed();
  if (author && letter) {
    msgEmbed.title = `Frase aleatoria de \`${author}\` con la \`${letter}\``;
    phrase = (await AuthorModel.aggregate([
      { $match: { _id: authorID } },
      onlyPhrases,
      matchingPhrasesFromLetter(letter),
      { $unwind: { path: "$phrases" } },
      idsToPhrases("phrases.phrases", onlyPhrase),
      ...getRandomPhrase("$phrases"),
    ]))[0]?.phrases.phrase || "Ninguna";
  } else if (author) {
    msgEmbed.title = `Frase aleatoria de \`${author}\``;
    phrase = (await AuthorModel.aggregate([
      { $match: { _id: authorID } },
      onlyPhrases,
      idsToPhrases("phrases", onlyPhrase),
      ...getRandomPhrase("$phrases"),
    ]))[0]?.phrases.phrase || "Ninguna";
  } else if (letter) {
    msgEmbed.title = `Frase aleatoria con la \`${letter}\``;
    phrase = (await LetterModel.aggregate([
      { $match: { letter: letter } },
      onlyPhrases,
      idsToPhrases("phrases", onlyPhrase),
      ...getRandomPhrase("$phrases"),
    ]))[0]?.phrases.phrase || "Ninguna";
  } else {
    msgEmbed.title = `Frase aleatoria`;
    phrase = (await PhraseModel.aggregate([
      onlyPhrase,
      ...getRandomPhrase("$phrase"),
    ]))[0]?.phrase || "Ninguna";
  }

  msgEmbed.description = `○ ${phrase}`;

  await interaction.reply({
    embeds: [msgEmbed],
  });
};
