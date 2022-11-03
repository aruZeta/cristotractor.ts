import { MessageComponentInteraction } from "discord.js";
import { updateReply } from "../../utils/phrase/updatePhraseList";

export const event = async (
  id: string,
  interaction: MessageComponentInteraction,
  cache: any,
): Promise<void> => {
  cache.currentIndex -= 1
  await interaction.update(updateReply(id));
}
