import {
  ComponentType,
  MessageComponentInteraction,
  SelectMenuInteraction
} from "discord.js";
import Cristotractor from "../../client";
import { isAdmin } from "../../utils/checking";

export const event = async (
  id: string,
  interaction: MessageComponentInteraction,
  cache: any,
  index: number,
): Promise<void> => {
  if (cache.interaction.user != interaction.user) return;
  if (!isAdmin(interaction)) return;

  const selectedID: number =
    parseInt((<SelectMenuInteraction>interaction).values[0], 0);

  await interaction.update({
    content:
      `${interaction.user} Asigna un autor a la frase:\n`
      + `○ ${cache.phrases[index][selectedID]}`,
    components: [{
      type: ComponentType.ActionRow,
      components: [{
        type: ComponentType.SelectMenu,
        placeholder: "Asignar autor",
        customId: `phrase->getAuthorToSet->${id}->${index}->${selectedID}`,
        options: Cristotractor.mongoCache.authorOptions,
      }]
    }]
  });
};
