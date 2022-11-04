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
  ICommandOptionChoice
} from "../../../interfaces/command";
import Cristotractor from "../../../client";
import { checkLetter } from "../../../utils/checking";
import { LetterModel } from "../../../models/letter";
import { PhraseModel } from "../../../models/phrase";
import { AuthorModel } from "../../../models/author";
import {
  onlyPhrases,
  onlyPhraseAndId,
  toLimitedSizeArr,
  matchingPhrasesFromLetter,
  toPhrasesArray,
  groupBy,
  mergeArrayOfArrays,
  getNotAssignedPhrases,
  idsToPhrases,
} from "../../../utils/mongoSearch";
import { updateReply } from "../../../utils/phrase/updatePhraseList";

export const subcommand: ICommandOption = {
  name: "mostrar",
  description: "Muestra frases segun los criterios dados.",
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
    choices: ((): ICommandOptionChoice[] => {
      const options = Cristotractor.mongoCache.authors.map(
        (_: any, key: string): ICommandOptionChoice => {
          return { name: key, value: key };
        }
      )
      options.push({ name: "Ninguno", value: "Ninguno" });
      return options;
    })(),
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

  const msgEmbed: IEmbed = genDefaultEmbed();

  type TPhraseAndIds = { phrases: string[][] | undefined, ids: Types.ObjectId[][] | undefined };

  const { phrases, ids }: TPhraseAndIds = await (async (
  ): Promise<TPhraseAndIds> => {
    if (author == "Ninguno") {
      msgEmbed.title = `Frases sin autor`;
      return (await AuthorModel.aggregate([
        onlyPhrases,
        groupBy("$phrases", "", false),
        mergeArrayOfArrays("$phrases"),
        ...getNotAssignedPhrases("$mergedArray"),
        ...toLimitedSizeArr(true),
      ]))[0] || [];
    } else if (author && letter) {
      msgEmbed.title = `Frases de \`${author}\` con la \`${letter}\``;
      return (await AuthorModel.aggregate([
        { $match: { _id: authorID } },
        onlyPhrases,
        matchingPhrasesFromLetter(letter),
        { $unwind: { path: "$phrases" } },
        ...toPhrasesArray("phrases.phrases", onlyPhraseAndId),
      ]))[0] || [];
    } else if (author) {
      msgEmbed.title = `Frases de \`${author}\``;
      return (await AuthorModel.aggregate([
        { $match: { _id: authorID } },
        onlyPhrases,
        ...toPhrasesArray("phrases", onlyPhraseAndId),
      ]))[0] || [];
    } else if (letter) {
      msgEmbed.title = `Frases con la \`${letter}\``;
      return (await LetterModel.aggregate([
        { $match: { letter: letter } },
        onlyPhrases,
        ...toPhrasesArray("phrases", onlyPhraseAndId),
      ]))[0] || [];
    } else {
      msgEmbed.title = "Todas las frases";
      return (await PhraseModel.aggregate([
        onlyPhraseAndId,
        groupBy("$phrase", "$_id"),
        ...toLimitedSizeArr(true),
      ]))[0] || [];
    };
  })();

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
      authorID: authorID,
      letter: letter,
      phrases: phrases,
      ids: ids,
      currentIndex: 0,
      options: <SelectMenuComponentOptionData[][]>Array(phrases.length),
      interaction: interaction,
    }
  );

  await interaction.reply(updateReply(compID));
}
