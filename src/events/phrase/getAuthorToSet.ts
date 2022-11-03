import { MessageComponentInteraction, SelectMenuInteraction } from "discord.js";
import { Types } from "mongoose";
import Cristotractor from "../../client";
import { AuthorModel } from "../../models/author";
import { isAdmin } from "../../utils/checking";
import { genDefaultEmbed } from "../../utils/embed";

export const event = async (
  interaction: MessageComponentInteraction,
  [id, pageIndex, itemIndex, prevAuthor]:
    [string, number, number, string],
): Promise<void> => {
  const cache = Cristotractor.compInteractionCache.cache.get(id);
  if (!cache) return;

  if (cache.interaction.user != interaction.user) return;
  if (!isAdmin(interaction)) return;

  const author: string = (<SelectMenuInteraction>interaction).values[0];
  const authorID: Types.ObjectId =
    <Types.ObjectId>Cristotractor.mongoCache.authors.get(author);

  const embed = genDefaultEmbed();
  embed.title = "Autor asignado";
  embed.fields = [{
    name: "Frase",
    value: `○ ${cache.phrases[pageIndex][itemIndex]}`,
  }, {
    name: "Autor previo:",
    value: prevAuthor,
  }, {
    name: "Autor nuevo:",
    value: author,
  }];

  const prevAuthorId = Cristotractor.mongoCache.authors.get(prevAuthor);

  console.table([pageIndex, itemIndex]);
  console.log(cache.ids[pageIndex][itemIndex]);
  console.table([prevAuthor, author]);
  console.log(authorID);

  if (prevAuthorId) {
    console.log("Remove old");
    await AuthorModel.updateOne(
      { _id: prevAuthorId },
      { $pull: { phrases: cache.ids[pageIndex][itemIndex] } }
    );
  }

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
