import { MessageComponentInteraction, SelectMenuInteraction } from "discord.js";
import { Types } from "mongoose";
import { AuthorModel } from "../../models/author";
import { LetterModel } from "../../models/letter";
import { PhraseModel } from "../../models/phrase";
import { isAdmin } from "../../utils/checking";
import { genDefaultEmbed } from "../../utils/embed";
import { updateReply } from "../../utils/phrase/updatePhraseList";

export const event = async (
  id: string,
  interaction: MessageComponentInteraction,
  cache: any,
  index: number,
): Promise<void> => {
  if (cache.interaction.user != interaction.user) return;
  if (!isAdmin(interaction)) return;

  const selectedIDs: number[] = (<SelectMenuInteraction>interaction).values.map(
    (id: string): number => parseInt(id, 10)
  );
  const embed = genDefaultEmbed();
  embed.title = "Frases borradas";
  embed.description = selectedIDs.map(
    (id: number): string => `○ ${cache.phrases[index][id]}`
  ).join("\n");

  const phraseIDs: Types.ObjectId[] = selectedIDs.map(
    (id: number): Types.ObjectId => cache.ids[index][id]
  );

  await PhraseModel.deleteMany({ _id: { $in: phraseIDs } });
  if (cache.authorID) {
    await AuthorModel.updateOne(
      { _id: cache.authorID },
      { $pull: { phrases: { $in: phraseIDs } } }
    );
  } else {
    await AuthorModel.updateMany(
      { $pull: { phrases: { $in: phraseIDs } } }
    );
  }
  if (cache.letter) {
    await LetterModel.updateOne(
      { letter: cache.letter },
      { $pull: { phrases: { $in: phraseIDs } } }
    );
  } else {
    await LetterModel.updateMany(
      { $pull: { phrases: { $in: phraseIDs } } }
    );
  }

  await interaction.update({
    content: `Por ${interaction.user}`,
    embeds: [embed],
    components: []
  });

  selectedIDs.forEach((id: number) => {
    cache.phrases[index].splice(id, 1);
    cache.ids[index].splice(id, 1);
  });
  await cache.interaction.editReply(updateReply(id, index));
};
