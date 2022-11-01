import {
  ChatInputCommandInteraction,
  ComponentType,
  MessageComponentInteraction,
  SelectMenuComponentOptionData,
  SelectMenuInteraction,
  TextInputStyle
} from "discord.js";
import { Types } from "mongoose";

import { IEmbed } from "../../../interfaces/embed";
import {
  forwardButton,
  genDefaultEmbed,
  toolsButton
} from "../../../utils/embed";
import {
  ECommandOptionType,
  ICommandOption,
  ICommandOptionChoice
} from "../../../interfaces/command";
import Cristotractor from "../../../client";
import { checkLetter, isAdmin } from "../../../utils/checking";
import { LetterModel } from "../../../models/letter";
import { PhraseModel } from "../../../models/phrase";
import { AuthorModel } from "../../../models/author";
import { backButton } from "../../../utils/embed";
import {
  onlyPhrases,
  onlyPhraseAndId,
  toLimitedSizeArr,
  matchingPhrasesFromLetter,
  toPhrasesArray,
  groupBy,
} from "../../../utils/mongoSearch";

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

  type TPhraseAndIds = { phrases: string[][] | undefined, ids: Types.ObjectId[][] | undefined };

  const { phrases, ids }: TPhraseAndIds = await (async (): Promise<TPhraseAndIds> => {
    if (author && letter) {
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

  let currentIndex: number = 0;
  let options: SelectMenuComponentOptionData[][] = Array(phrases.length);

  const checkOptionsCache = (): void => {
    if (!options[currentIndex]) {
      options[currentIndex] = phrases[currentIndex].map(
        (phrase: string, i: number): SelectMenuComponentOptionData => {
          return { label: phrase, value: i.toString() }
        }
      );
    }
  }

  const updateEmbedPhrases = (): void => {
    msgEmbed.description = phrases[currentIndex].map(
      (phrase: string): string => `○ ${phrase}`
    ).join("\n");
    msgEmbed.footer = {
      text: `Pagina ${currentIndex + 1}/${phrases.length}`
    };
  };

  const updateReply = (comps: boolean = true): any => {
    checkOptionsCache();
    updateEmbedPhrases();
    return {
      embeds: [msgEmbed],
      components: comps ? [{
        type: ComponentType.ActionRow,
        components: [
          ...(currentIndex == 0 ? [] : [backButton]),
          ...(currentIndex == phrases.length - 1 ? [] : [forwardButton]),
          toolsButton,
        ]
      }] : [],
    };
  };

  await interaction.reply(updateReply());

  const collector =
    interaction.channel!.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 15000
    });

  collector.on("collect", async (
    compInteraction: MessageComponentInteraction
  ): Promise<void> => {
    if (compInteraction.customId == "backButton") {
      currentIndex -= 1
      await compInteraction.update(updateReply());
    } else if (compInteraction.customId == "forwardButton") {
      currentIndex += 1
      await compInteraction.update(updateReply());
    } else if (compInteraction.customId == "toolsButton") {
      if (compInteraction.user != interaction.user) return;
      if (!isAdmin(compInteraction)) return;

      interaction.editReply(updateReply(false));

      await compInteraction.reply({
        content: `${compInteraction.user} que quieres hacer?`,
        components: [{
          type: ComponentType.ActionRow,
          components: [{
            type: ComponentType.SelectMenu,
            placeholder: "Eliminar frases",
            customId: "delete",
            minValues: 1,
            maxValues: options[currentIndex].length,
            options: options[currentIndex],
          }],
        }, {
          type: ComponentType.ActionRow,
          components: [{
            type: ComponentType.SelectMenu,
            placeholder: "Modificar frase",
            customId: "edit",
            minValues: 1,
            maxValues: 1,
            options: options[currentIndex],
          }],
        }],
      });

      const toolsCollector =
        compInteraction.channel!.createMessageComponentCollector({
          filter: (i) => i.user.id == interaction.user.id,
          componentType: ComponentType.SelectMenu,
          time: 15000
        });

      toolsCollector.on("collect", async (
        toolsInteraction: SelectMenuInteraction
      ): Promise<void> => {
        const toolsIndex: number = currentIndex
        const toolsIds: number[] =
          toolsInteraction.values.map(
            (id: string): number => parseInt(id, 10)
          );

        const toolsEmbed = genDefaultEmbed();
        let interactionToUpdate;

        if (toolsInteraction.customId == "delete") {
          interactionToUpdate = toolsInteraction;

          toolsEmbed.title = "Frases borradas";
          toolsEmbed.description = toolsIds.map(
            (id: number): string => `○ ${phrases[toolsIndex][id]}`
          ).join("\n");

          const phraseIDs: Types.ObjectId[] = toolsIds.map(
            (id: number): Types.ObjectId => ids[currentIndex][id]
          );

          await PhraseModel.deleteMany({ _id: { $in: phraseIDs } });
          if (authorID) {
            await AuthorModel.updateOne(
              { _id: authorID },
              { $pull: { phrases: { $in: phraseIDs } } }
            );
          } else {
            await AuthorModel.updateMany(
              { $pull: { phrases: { $in: phraseIDs } } }
            );
          }
          if (letter) {
            await LetterModel.updateOne(
              { letter: letter },
              { $pull: { phrases: { $in: phraseIDs } } }
            );
          } else {
            await LetterModel.updateMany(
              { $pull: { phrases: { $in: phraseIDs } } }
            );
          }
        } else if (toolsInteraction.customId == "edit") {
          await toolsInteraction.showModal({
            customId: "phraseEditModal",
            title: "Editar frase",
            components: [{
              type: ComponentType.ActionRow,
              components: [{
                type: ComponentType.TextInput,
                customId: "phraseEdit",
                value: phrases[toolsIndex][toolsIds[0]],
                label: "Nueva frase:",
                style: TextInputStyle.Paragraph,
                required: true,
              }]
            }]
          });

          const modalInteracton = await toolsInteraction.awaitModalSubmit({
            time: 30000
          });

          if (!modalInteracton.isFromMessage()) return;
          interactionToUpdate = modalInteracton

          const editPhrase = modalInteracton.fields.getTextInputValue("phraseEdit");

          toolsEmbed.title = "Frase modificada";
          toolsEmbed.fields = [{
            name: "Antigua frase",
            value: `○ ${phrases[toolsIndex][toolsIds[0]]}`
          }, {
            name: "Nueva frase",
            value: `○ ${editPhrase}` // TODO
          }];

          await PhraseModel.updateOne(
            { _id: ids[toolsIndex][toolsIds[0]] },
            { phrase: editPhrase }
          )
        }

        await interactionToUpdate?.update({
          content: `Por ${toolsInteraction.user}`,
          embeds: [toolsEmbed],
          components: []
        });

        toolsCollector.stop();
        collector.stop();
      })
    }
  });
};
