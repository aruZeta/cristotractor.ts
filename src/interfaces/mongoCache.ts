import { Collection, SelectMenuComponentOptionData } from "discord.js";
import { Types } from "mongoose";

export interface IMongoCache {
  authors: TMongoNameToIdCollection,
  vehicles: TMongoNameToIdCollection,
  authorOptions: SelectMenuComponentOptionData[],
};

export type TMongoNameToIdCollection = Collection<string, Types.ObjectId>;
