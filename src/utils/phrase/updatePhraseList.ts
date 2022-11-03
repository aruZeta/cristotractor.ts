import { ComponentType, SelectMenuComponentOptionData } from "discord.js";
import Cristotractor from "../../client";
import { backButton, forwardButton, toolsButton } from "../embed";

export const updateReply = (
  compID: string,
  refresh: number | null = null,
  comps: boolean = true
): any => {
  const cache = Cristotractor.compInteractionCache.cache.get(compID);
  if (!cache.options[cache.currentIndex] || refresh != null) {
    const index = refresh ? refresh : cache.currentIndex;
    cache.options[index] = cache.phrases[index].map(
      (phrase: string, i: number): SelectMenuComponentOptionData => {
        return { label: phrase, value: i.toString() }
      }
    );
  }
  cache.msgEmbed.description = cache.phrases[cache.currentIndex].map(
    (phrase: string): string => `○ ${phrase}`
  ).join("\n");
  cache.msgEmbed.footer = {
    text: `Pagina ${cache.currentIndex + 1}/${cache.phrases.length}`
  };
  return {
    embeds: [cache.msgEmbed],
    components: comps ? [{
      type: ComponentType.ActionRow,
      components: [
        ...(cache.currentIndex == 0
          ? []
          : [backButton("phrase", compID)]
        ),
        ...(cache.currentIndex == cache.phrases.length - 1
          ? []
          : [forwardButton("phrase", compID)]
        ),
        toolsButton("phrase", compID),
      ]
    }] : [],
  };
};
