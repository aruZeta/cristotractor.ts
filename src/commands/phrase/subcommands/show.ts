import { ChatInputCommandInteraction } from "discord.js";
import { Types } from "mongoose";

import { genDefaultEmbed, IEmbed } from "../../../interfaces/embed";
import {
  ECommandOptionType,
  ICommandOption,
  ICommandOptionChoice
} from "../../../interfaces/command";
import Cristotractor from "../../../client";
import { checkLetter } from "../../../utils/checking";
import { LetterModel } from "../../../models/letter";
import { IPhrase, PhraseModel } from "../../../models/phrase";
import { AuthorModel } from "../../../models/author";

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

  const msgEmbed: IEmbed = genDefaultEmbed();
  msgEmbed.description = "";

  const onlyPhrases = {
    $project: { _id: 0, phrases: 1 }
  };

  const onlyPhrasesAndIds = {
    $project: { _id: 1, phrase: 1 }
  };

  const toPhrases = {
    $lookup: {
      from: "phrases",
      localField: "phrases",
      foreignField: "_id",
      pipeline: [onlyPhrasesAndIds],
      as: "phrases",
    },
  };

  const toStringArr = [{
    $unwind: { path: '$phrases' }
  }, {
    $group: {
      _id: null,
      phrases: { $push: '$phrases.phrase' },
      ids: { $push: '$phrases._id' },
    }
  }];

  const toLimitedSizeArr = [{
    $addFields: { subArraySize: 25 }
  }, {
    $addFields: {
      startingIndices: { $range: [0, { $size: '$phrases' }, '$subArraySize'] }
    }
  }, {
    $project: {
      _id: 0,
      phrases: {
        $map: {
          input: '$startingIndices',
          as: 'i',
          in: { $slice: ['$phrases', '$$i', '$subArraySize'] }
        }
      },
      ids: {
        $map: {
          input: '$startingIndices',
          as: 'i',
          in: { $slice: ['$ids', '$$i', '$subArraySize'] }
        }
      }
    }
  }];

  type TPhraseAndIds = { phrases: string[][], ids: Types.ObjectId[][] };

  const { phrases, ids }: TPhraseAndIds = await (async (): Promise<TPhraseAndIds> => {
    if (author && letter) {
      msgEmbed.title = `Frases de \`${author}\` con la \`${letter}\``;
      return (await AuthorModel.aggregate([{
        $match: { _id: authorID }
      }, onlyPhrases, {
        $lookup: {
          from: "letters",
          let: { vals: "$phrases" },
          pipeline: [{
            $match: { letter: letter }
          }, {
            $project: {
              _id: 0,
              phrases: {
                $map: {
                  input: "$phrases",
                  as: "pID",
                  in: {
                    $cond: {
                      if: { $in: ["$$pID", "$$vals"] },
                      then: "$$pID",
                      else: null
                    }
                  }
                }
              }
            }
          }],
          as: "phrases",
        }
      }, {
        $unwind: { path: "$phrases" }
      }, {
        $lookup: {
          from: "phrases",
          localField: "phrases.phrases",
          foreignField: "_id",
          pipeline: [onlyPhrasesAndIds],
          as: "phrases"
        }
      }, ...toStringArr, ...toLimitedSizeArr]))[0];
    } else if (author) {
      msgEmbed.title = `Frases de \`${author}\``;
      return (await AuthorModel.aggregate([{
        $match: { _id: authorID },
      }, onlyPhrases, toPhrases, ...toStringArr, ...toLimitedSizeArr]))[0]
    } else if (letter) {
      msgEmbed.title = `Frases con la \`${letter}\``;
      return (await LetterModel.aggregate([{
        $match: { letter: letter },
      }, onlyPhrases, toPhrases, ...toStringArr, ...toLimitedSizeArr]))[0]
    } else {
      msgEmbed.title = "Todas las frases";
      return (await PhraseModel.aggregate([
        onlyPhrasesAndIds, {
          $group: {
            _id: null,
            phrases: { $push: '$phrase' },
            ids: { $push: '$_id' }
          }
        }, ...toLimitedSizeArr
      ]))[0]
    };
  })();

  let currentIndex: number = 0;
  }

  const updateEmbedPhrases = (): void => {
    msgEmbed.description = phrases[currentIndex].map(
      (phrase: string): string => `○ ${phrase}`
    ).join("\n");
  };

  updateEmbedPhrases();

  // TODO
  if (!msgEmbed.description || msgEmbed.description.length == 0)
    msgEmbed.description = "Ninguna";

  await interaction.reply({
    embeds: [msgEmbed],
  });
};
