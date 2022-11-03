import { ComponentType, MessageComponentInteraction } from "discord.js";
import { isAdmin } from "../../utils/checking";

export const event = async (
  id: string,
  interaction: MessageComponentInteraction,
  cache: any,
): Promise<void> => {
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
    }],
  });
}
