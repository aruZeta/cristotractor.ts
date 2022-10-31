import { Model, model, Schema, Types } from "mongoose";

import { VehicleModel } from "./vehicle";
import { PhraseModel } from "./phrase";

export interface IAuthor {
  _id: Types.ObjectId,
  name: string,
  vehicles: Types.ObjectId[],
  phrases: Types.ObjectId[],
  bias: number,
};

export const authorSchema: Schema<IAuthor> = new Schema({
  name: { type: String, required: true },
  vehicles: { type: [Schema.Types.ObjectId], ref: VehicleModel, required: true },
  phrases: { type: [Schema.Types.ObjectId], ref: PhraseModel, required: true },
  bias: { type: Number, required: true },
});

export const AuthorModel: Model<IAuthor> = model("Author", authorSchema);

AuthorModel.createCollection();
