import { MessageComponentInteraction, SelectMenuInteraction } from "discord.js";
import { Types } from "mongoose";
import Cristotractor from "../../client";
import { AuthorModel } from "../../models/author";
import { isAdmin } from "../../utils/checking";
import { genDefaultEmbed } from "../../utils/embed";

export const event = async (
  id: string,
  interaction: MessageComponentInteraction,
  cache: any,
  pageIndex: number,
  itemIndex: number,
): Promise<void> => {
  if (cache.interaction.user != interaction.user) return;
  if (!isAdmin(interaction)) return;

  const author: string = (<SelectMenuInteraction>interaction).values[0];
  const authorID: Types.ObjectId =
    <Types.ObjectId>Cristotractor.mongoCache.authors.get(author)

  const embed = genDefaultEmbed();
  embed.title = "Autor asignado";
  embed.fields = [{
    name: "Frase",
    value: `○ ${cache.phrases[pageIndex][itemIndex]}`,
  }, {
    name: "Autor",
    value: author,
  }];

  await AuthorModel.updateOne(
    { _id: authorID },
    { $push: { phrases: cache.ids[pageIndex][itemIndex] } }
  );

  await interaction.update({
    content: `Por ${interaction.user}`,
    embeds: [embed],
    components: [],
  });
};
