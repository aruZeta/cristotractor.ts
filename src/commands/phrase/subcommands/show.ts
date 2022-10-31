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

  if (author && letter) {
    msgEmbed.title = `Frases de \`${author}\` con la \`${letter}\``;
    msgEmbed.description = (await AuthorModel.aggregate([{
      $match: { _id: authorID }
    }, {
      $project: { _id: 0, phrases: 1 }
    }, {
      $lookup: {
        from: "letters",
        pipeline: [
          {
            $match: { letter: letter }
          }, {
            $project: { _id: 0, phrases: 1 }
          }, {
            $project: {
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
          }
        ],
        as: "phrases",
        let: { vals: "$phrases" }
      }
    }, {
      $unwind: { path: "$phrases" }
    }, {
      $lookup: {
        from: "phrases",
        localField: "phrases.phrases",
        foreignField: "_id",
        pipeline: [{ $project: { _id: 0, phrase: 1 } }],
        as: "phrases"
      }
    }]))[0]?.phrases.map(
      (phrase: IPhrase): string => `○ ${phrase.phrase}`
    ).join("\n");
  } else if (author) {
    msgEmbed.title = `Frases de \`${author}\``;
    msgEmbed.description = (await AuthorModel.aggregate([{
      $match: { _id: authorID },
    }, {
      $project: { _id: 0, phrases: 1 }
    }, {
      $lookup: {
        from: "phrases",
        localField: "phrases",
        foreignField: "_id",
        pipeline: [{ $project: { _id: 0, phrase: 1 } }],
        as: "phrases",
      },
    }]))[0]?.phrases.map(
      (phrase: IPhrase): string => `○ ${phrase.phrase}`
    ).join("\n");
  } else if (letter) {
    msgEmbed.title = `Frases con la \`${letter}\``;
    msgEmbed.description = (await LetterModel.aggregate([{
      $match: { letter: letter },
    }, {
      $project: { _id: 0, phrases: 1 }
    }, {
      $lookup: {
        from: "phrases",
        localField: "phrases",
        foreignField: "_id",
        pipeline: [{ $project: { _id: 0, phrase: 1 } }],
        as: "phrases",
      },
    }]))[0]?.phrases.map(
      (phrase: IPhrase): string => `○ ${phrase.phrase}`
    ).join("\n");
  } else {
    msgEmbed.title = "Todas las frases";
    msgEmbed.description = (await PhraseModel.find({})).map(
      (phrase: IPhrase): string => `○ ${phrase.phrase}`
    ).join("\n");
  }

  if (!msgEmbed.description || msgEmbed.description.length == 0)
    msgEmbed.description = "Ninguna";

  await interaction.reply({
    embeds: [msgEmbed],
  });
};
