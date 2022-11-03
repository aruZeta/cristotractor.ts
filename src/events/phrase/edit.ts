import { ComponentType, MessageComponentInteraction, SelectMenuInteraction, TextInputStyle } from "discord.js";
import Cristotractor from "../../client";
import { PhraseModel } from "../../models/phrase";
import { isAdmin } from "../../utils/checking";
import { genDefaultEmbed } from "../../utils/embed";
import { updateReply } from "../../utils/phrase/updatePhraseList";

export const event = async (
  interaction: MessageComponentInteraction,
  [id, pageIndex]: [string, number],
): Promise<void> => {
  const cache = Cristotractor.compInteractionCache.cache.get(id);

  if (cache.interaction.user != interaction.user) return;
  if (!isAdmin(interaction)) return;

  const selectedID: number =
    parseInt((<SelectMenuInteraction>interaction).values[0], 0);
  const embed = genDefaultEmbed();

  await interaction.showModal({
    customId: "phraseEditModal",
    title: "Editar frase",
    components: [{
      type: ComponentType.ActionRow,
      components: [{
        type: ComponentType.TextInput,
        customId: "phraseEdit",
        value: cache.phrases[pageIndex][selectedID],
        label: "Nueva frase:",
        style: TextInputStyle.Paragraph,
        required: true,
      }],
    }]
  });

  const modalInteracton = await interaction.awaitModalSubmit({
    time: 30000
  });

  if (!modalInteracton.isFromMessage()) return;

  const editPhrase = modalInteracton.fields.getTextInputValue("phraseEdit");

  embed.title = "Frase modificada";
  embed.fields = [{
    name: "Antigua frase",
    value: `○ ${cache.phrases[pageIndex][selectedID]}`
  }, {
    name: "Nueva frase",
    value: `○ ${editPhrase}`
  }];

  await PhraseModel.updateOne(
    { _id: cache.ids[pageIndex][selectedID] },
    { phrase: editPhrase }
  )

  await modalInteracton.update({
    content: `Por ${interaction.user}`,
    embeds: [embed],
    components: []
  });

  cache.phrases[pageIndex][selectedID] = editPhrase;
  await cache.interaction.editReply(updateReply(id, pageIndex));
};
