import { Model, model, Schema, Types } from 'mongoose';

import { VehicleModel } from "./vehicle";

export interface IAuthor {
  _id: Types.ObjectId,
  name: string,
  nickname: string,
  vehicles: Types.ObjectId[],
};

export const authorSchema: Schema<IAuthor> = new Schema({
  _id: { type: Schema.Types.ObjectId },
  name: { type: String, required: true },
  nickname: { type: String, required: true },
  vehicles: { type: [Schema.Types.ObjectId], ref: VehicleModel },
});

export const AuthorModel: Model<IAuthor> = model("Author", authorSchema);

AuthorModel.createCollection();
