import { Model, model, Schema, Types } from "mongoose";

import { PhraseModel } from "./phrase";

export interface ILetter {
  _id: Types.ObjectId,
  letter: string,
  phrases: Types.ObjectId[],
  bias: number,
};

export const letterSchema: Schema<ILetter> = new Schema({
  letter: { type: String, required: true, unique: true },
  phrases: { type: [Schema.Types.ObjectId], ref: PhraseModel },
  bias: { type: Number, required: true },
});

export const LetterModel: Model<ILetter> = model("Letter", letterSchema);

LetterModel.createCollection();
