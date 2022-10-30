import { Collection } from "discord.js";
import { Types } from "mongoose";

export interface IMongoCache {
  authors: TMongoNameToIdCollection,
  vehicles: TMongoNameToIdCollection,
};

export type TMongoNameToIdCollection = Collection<string, Types.ObjectId>;
