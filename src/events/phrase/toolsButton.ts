import { ComponentType, MessageComponentInteraction } from "discord.js";
import { isAdmin } from "../../utils/checking";

export const event = async (
  id: string,
  interaction: MessageComponentInteraction,
  cache: any,
): Promise<void> => {
  if (cache.interaction.user != interaction.user) return;
  if (!isAdmin(interaction)) return;

  await interaction.reply({
    content: `${interaction.user} que quieres hacer?`,
    components: [{
      type: ComponentType.ActionRow,
      components: [{
        type: ComponentType.SelectMenu,
        placeholder: "Eliminar frases",
        customId: `phrase->delete->${id}`,
        minValues: 1,
        maxValues: cache.options[cache.currentIndex].length,
        options: cache.options[cache.currentIndex],
      }],
    }, {
      type: ComponentType.ActionRow,
      components: [{
        type: ComponentType.SelectMenu,
        placeholder: "Modificar frase",
        customId: `phrase->edit->${id}`,
        minValues: 1,
        maxValues: 1,
        options: cache.options[cache.currentIndex],
      }],
    }],
  });
}
