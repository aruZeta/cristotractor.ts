import { ComponentType, MessageComponentInteraction } from "discord.js";
import Cristotractor from "../../client";
import { isAdmin } from "../../utils/checking";

export const event = async (
  interaction: MessageComponentInteraction,
  [id]: [string, number, number],
): Promise<void> => {
  const cache = Cristotractor.compInteractionCache.cache.get(id);

  if (cache.interaction.user != interaction.user) return;
  if (!isAdmin(interaction)) return;
  const index = cache.currentIndex;

  await interaction.reply({
    content: `${interaction.user} que quieres hacer?`,
    components: [{
      type: ComponentType.ActionRow,
      components: [{
        type: ComponentType.SelectMenu,
        placeholder: "Eliminar frases",
        customId: `phrase->delete->${id}->${index}`,
        minValues: 1,
        maxValues: cache.options[index].length,
        options: cache.options[index],
      }],
    }, {
      type: ComponentType.ActionRow,
      components: [{
        type: ComponentType.SelectMenu,
        placeholder: "Modificar frase",
        customId: `phrase->edit->${id}->${index}`,
        minValues: 1,
        maxValues: 1,
        options: cache.options[index],
      }],
    }, {
      type: ComponentType.ActionRow,
      components: [{
        type: ComponentType.SelectMenu,
        placeholder: "Asignar autor",
        customId: `phrase->setAuthor->${id}->${index}`,
        minValues: 1,
        maxValues: 1,
        options: cache.options[index],
      }],
    }],
  });
}
