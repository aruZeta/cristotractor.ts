import {
  Client,
  Collection,
  ComponentType,
  Interaction,
  Routes,
  SelectMenuInteraction,
  TextInputStyle
} from "discord.js";
import { REST } from "@discordjs/rest";
import { config as setupEnvVars } from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import mongoose, { Types } from "mongoose";

import Config from "../interfaces/config";
import config from "../config.json" assert {type: "json"};
import { readCommands } from "../utils/read";
import { ICommand, TCommandRun } from "../interfaces/command";
import { IMongoCache } from "../interfaces/mongoCache";
import { AuthorModel, IAuthor } from "../models/author";
import { IVehicle, VehicleModel } from "../models/vehicle";
import ComponentInteractionCache from "../utils/componentInteractionCache";
import { isAdmin } from "../utils/checking";
import { updateReply } from "../utils/updateReply";
import { genDefaultEmbed } from "../utils/embed";
import { PhraseModel } from "../models/phrase";
import { LetterModel } from "../models/letter";

const commands: Collection<String, TCommandRun> = new Collection();
const __dirname: string = dirname(fileURLToPath(import.meta.url));

export default class Cristotractor extends Client {
  public static commands: ICommand[] = [];
  public static config: Config = config;

  public static mongoCache: IMongoCache = {
    authors: new Collection(),
    vehicles: new Collection(),
  };

  public static compInteractionCache: ComponentInteractionCache =
    new ComponentInteractionCache();

  public static rest: REST = new REST({
    version: "10"
  });

  public static genInviteLink = (): string =>
    "https://discord.com/api/oauth2/authorize"
    + `?client_id=${this.config.bot.clientId}`
    + `&permissions=${this.config.bot.permissions}`
    + `&scope=bot%20applications.commands`;

  public static removeAllCommands = (): void => {
    Cristotractor.rest.put(
      Routes.applicationGuildCommands(
        config.bot.clientId,
        config.bot.mainGuild.id
      ), { body: [] }
    ).then(() => console.log("Successfully deleted all guild commands!")
    ).catch(console.error);
  }

  public static updateMongoCache = async (): Promise<void> => {
    try {
      console.log("Fetching cache ...");
      (await AuthorModel.find({})).forEach((author: IAuthor): void => {
        Cristotractor.mongoCache.authors.set(author.name, author._id);
      });
      (await VehicleModel.find({})).forEach((vehicle: IVehicle): void => {
        Cristotractor.mongoCache.authors.set(vehicle.name, vehicle._id);
      });
      console.log("Cristotractor is starting to remember it's powers ...");
      Cristotractor.commands = await readCommands(
        resolve(__dirname, "../commands"),
        (command: ICommand, run: TCommandRun): void => {
          commands.set(command.name, run)
        }
      );
      Cristotractor.rest.put(
        Routes.applicationGuildCommands(
          config.bot.clientId,
          config.bot.mainGuild.id
        ), { body: Cristotractor.commands }
      );
      console.log("Cristotractor remembered it's powers! It became bald tho.");
    } catch (err) {
      console.log("Cristotractor couldn't remembered it's powers :(");
      console.error(err);
      process.exit(1);
    }
  };

  public init = async (
  ): Promise<void> => {
    setupEnvVars();

    Cristotractor.rest.setToken(<string>process.env.token);

    console.log("Cristotractor is starting the tractor's engine ...");
    this.login(process.env.token).then((): void => {
      console.log("Cristotractor succesfully started the tractor's engine!");
      console.log(`Tractor started: ${this.user?.tag}`);
    }).catch((err: Error): void => {
      console.log("Cristotractor failed to start the engine, exploding");
      console.error(err);
      process.exit(1);
    });

    console.log("Cristotractor is starting to connect the data cable ...");
    mongoose.connect(
      `mongodb+srv://${process.env.mongoUser}:${process.env.mongoPswd}`
      + "@data.0t392.mongodb.net/cristotractor?retryWrites=true&w=majority",
      { dbName: "cristotractor" }
    ).then((): void => {
      console.log("Cristotractor succesfully connected the data cable!");
      Cristotractor.updateMongoCache()
    }).catch((err: Error): void => {
      console.log("The data cable exploded");
      console.error(err);
      process.exit(1);
    });

    this.once("ready", async (
    ): Promise<void> => {
      if (!this.user) throw "F";
      console.log(Cristotractor.genInviteLink());
      this.user.setActivity("tractor go brrr");
      this.user.setUsername("Cristotractor 2.0");
    });

    this.on("interactionCreate", async (
      interaction: Interaction
    ): Promise<void> => {
      if (interaction.isCommand()) {
        try {
          const command: TCommandRun | undefined =
            commands.get(interaction.commandName);
          if (!command) return;
          await command(interaction);
        } catch (error) {
          if (error != "Check failed") {
            console.error(error);
            await interaction.reply({
              content: "Hubo un error ejecutando el comando.",
              ephemeral: true
            });
          }
        }
      } else if (interaction.isMessageComponent()) {
        const [command, item, id] = interaction.customId.split("->");
        const cache = Cristotractor.compInteractionCache.cache.get(id);
        if (!cache) return;
        if (command == "phrase/show") {
          if (item == "backButton") {
            cache.currentIndex -= 1
            await interaction.update(updateReply(id));
          } else if (item == "forwardButton") {
            cache.currentIndex += 1
            await interaction.update(updateReply(id));
          } else if (item == "toolsButton") {
            if (cache.interaction.user != interaction.user) return;
            if (!isAdmin(interaction)) return;

            await interaction.reply({
              content: `${interaction.user} que quieres hacer?`,
              components: [{
                type: ComponentType.ActionRow,
                components: [{
                  type: ComponentType.SelectMenu,
                  placeholder: "Eliminar frases",
                  customId: `${command}->delete->${id}`,
                  minValues: 1,
                  maxValues: cache.options[cache.currentIndex].length,
                  options: cache.options[cache.currentIndex],
                }],
              }, {
                type: ComponentType.ActionRow,
                components: [{
                  type: ComponentType.SelectMenu,
                  placeholder: "Modificar frase",
                  customId: `${command}->edit->${id}`,
                  minValues: 1,
                  maxValues: 1,
                  options: cache.options[cache.currentIndex],
                }],
              }],
            });
          } else if (item == "delete") {
            if (cache.interaction.user != interaction.user) return;
            if (!isAdmin(interaction)) return;

            const index: number = cache.currentIndex;
            const selectedIDs: number[] = (<SelectMenuInteraction>interaction).values.map(
              (id: string): number => parseInt(id, 10)
            );
            const embed = genDefaultEmbed();
            embed.title = "Frases borradas";
            embed.description = selectedIDs.map(
              (id: number): string => `○ ${cache.phrases[index][id]}`
            ).join("\n");

            const phraseIDs: Types.ObjectId[] = selectedIDs.map(
              (id: number): Types.ObjectId => cache.ids[index][id]
            );

            await PhraseModel.deleteMany({ _id: { $in: phraseIDs } });
            if (cache.authorID) {
              await AuthorModel.updateOne(
                { _id: cache.authorID },
                { $pull: { phrases: { $in: phraseIDs } } }
              );
            } else {
              await AuthorModel.updateMany(
                { $pull: { phrases: { $in: phraseIDs } } }
              );
            }
            if (cache.letter) {
              await LetterModel.updateOne(
                { letter: cache.letter },
                { $pull: { phrases: { $in: phraseIDs } } }
              );
            } else {
              await LetterModel.updateMany(
                { $pull: { phrases: { $in: phraseIDs } } }
              );
            }

            await interaction.update({
              content: `Por ${interaction.user}`,
              embeds: [embed],
              components: []
            });

            selectedIDs.forEach((id: number) => {
              cache.phrases[index].splice(id, 1);
              cache.ids[index].splice(id, 1);
            });
            await cache.interaction.editReply(updateReply(id, index));
          } else if (item == "edit") {
            if (cache.interaction.user != interaction.user) return;
            if (!isAdmin(interaction)) return;

            const index: number = cache.currentIndex;
            const selectedIDs: number[] = (<SelectMenuInteraction>interaction).values.map(
              (id: string): number => parseInt(id, 10)
            );
            const embed = genDefaultEmbed();

            await interaction.showModal({
              customId: "phraseEditModal",
              title: "Editar frase",
              components: [{
                type: ComponentType.ActionRow,
                components: [{
                  type: ComponentType.TextInput,
                  customId: "phraseEdit",
                  value: cache.phrases[index][selectedIDs[0]],
                  label: "Nueva frase:",
                  style: TextInputStyle.Paragraph,
                  required: true,
                }]
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
              value: `○ ${cache.phrases[index][selectedIDs[0]]}`
            }, {
              name: "Nueva frase",
              value: `○ ${editPhrase}` // TODO
            }];

            await PhraseModel.updateOne(
              { _id: cache.ids[index][selectedIDs[0]] },
              { phrase: editPhrase }
            )

            await modalInteracton.update({
              content: `Por ${interaction.user}`,
              embeds: [embed],
              components: []
            });

            cache.phrases[index][selectedIDs[0]] = editPhrase;
            await cache.interaction.editReply(updateReply(id, index));
          }
        }
      }
    })
  };
}
