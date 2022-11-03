import {
  ComponentType,
  MessageComponentInteraction,
  SelectMenuInteraction
} from "discord.js";
import { AuthorModel } from "../../models/author";
import Cristotractor from "../../client";
import { isAdmin } from "../../utils/checking";

export const event = async (
  interaction: MessageComponentInteraction,
  [id, pageIndex]: [string, number, number],
): Promise<void> => {
  const cache = Cristotractor.compInteractionCache.cache.get(id);

  if (cache.interaction.user != interaction.user) return;
  if (!isAdmin(interaction)) return;

  const selectedID: number =
    parseInt((<SelectMenuInteraction>interaction).values[0], 0);

  const prevAuthor =
    (await AuthorModel.findOne(
      { phrases: cache.ids[pageIndex][selectedID] }
    ))?.name || "Ninguno";
  console.log(Cristotractor.mongoCache.authors.get('Paco'));

  await interaction.update({
    content:
      `${interaction.user} Asigna un autor a la frase:\n`
      + `○ ${cache.phrases[pageIndex][selectedID]}\n`
      + `Anterior autor:\n○ ${prevAuthor}`,
    components: [{
      type: ComponentType.ActionRow,
      components: [{
        type: ComponentType.SelectMenu,
        placeholder: "Asignar autor",
        customId: `phrase->getAuthorToSet->${id}->${pageIndex}->${selectedID}->${prevAuthor}`,
        options: Cristotractor.mongoCache.authorOptions,
      }]
    }]
  });
};
