import { ChatInputCommandInteraction } from "discord.js";
import { Types } from "mongoose";

import { genDefaultEmbed, IEmbed } from "../../../interfaces/embed";
import {
  ECommandOptionType,
  ICommandOption,
  ICommandOptionChoice
} from "../../../interfaces/command";
import { PhraseModel } from "../../../models/phrase";
import { capitalize } from "../../../utils/string";
import { checkAdmin, checkLetter } from "../../../utils/checking";
import Cristotractor from "../../../client";
import { LetterModel } from "../../../models/letter";
import { AuthorModel } from "../../../models/author";

export const subcommand: ICommandOption = {
  name: "nueva",
  description: "Añade una nueva frase a la DB (solo admins).",
  type: ECommandOptionType.subCommand,
  options: [{
    name: "letra",
    description: "Letra de la frase",
    type: ECommandOptionType.string,
    required: true,
  }, {
    name: "frase",
    description: "La frase en si",
    type: ECommandOptionType.string,
    required: true,
  }, {
    name: "autor",
    description: "Autor de la frase",
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
  await checkAdmin(interaction);

  const letter: string = <string>await checkLetter(
    interaction,
    <string>interaction.options.getString("letra")
  );
  const phrase: string = capitalize(
    <string>interaction.options.getString("frase")
  );
  const author: string | null = interaction.options.getString("autor");
  const authorID: Types.ObjectId | null =
    author
      ? <Types.ObjectId>Cristotractor.mongoCache.authors.get(author)
      : null;

  PhraseModel.create({
    phrase: phrase,
    bias: 0,
  }).then(async (phraseDoc): Promise<void> => {
    const letterDoc = await LetterModel.findOne({ letter: letter });
    if (letterDoc) {
      await LetterModel.updateOne(
        { _id: letterDoc._id },
        { $push: { phrases: phraseDoc._id } }
      );
    } else {
      await LetterModel.create({
        letter: letter,
        phrases: [phraseDoc._id],
        bias: 0
      });
    }
    if (authorID) await AuthorModel.updateOne(
      { _id: authorID },
      { $push: { phrases: phraseDoc._id } }
    );
  });

  const msgEmbed: IEmbed = genDefaultEmbed();
  msgEmbed.title = "Frase añadida";
  msgEmbed.fields = [{
    name: "Letra:",
    value: letter,
    inline: true,
  }, {
    name: "Frase:",
    value: phrase,
    inline: false,
  }];

  if (author != null) msgEmbed.fields.splice(1, 0, {
    name: "Autor:",
    value: author,
    inline: true,
  });

  await interaction.reply({
    embeds: [msgEmbed],
  });
};
