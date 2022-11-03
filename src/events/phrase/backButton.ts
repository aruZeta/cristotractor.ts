import { MessageComponentInteraction } from "discord.js";
import Cristotractor from "../../client";
import { updateReply } from "../../utils/phrase/updatePhraseList";

export const event = async (
  interaction: MessageComponentInteraction,
  [id]: [string],
): Promise<void> => {
  const cache = Cristotractor.compInteractionCache.cache.get(id);

  cache.currentIndex -= 1
  await interaction.update(updateReply(id));
}
