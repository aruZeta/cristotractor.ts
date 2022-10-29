import { Model, model, Schema, Types } from 'mongoose';

import { AuthorModel } from "./author";

export interface IPhrase {
  _id: Types.ObjectId,
  letter: number,
  phrase: string,
  bias: number,
  author: Types.ObjectId,
};

export const phraseSchema: Schema<IPhrase> = new Schema({
  _id: { type: Schema.Types.ObjectId },
  letter: { type: Number, required: true },
  phrase: { type: String, required: true },
  bias: { type: Number, required: true },
  author: { type: Schema.Types.ObjectId, ref: AuthorModel },
});

export const PhraseModel: Model<IPhrase> = model("Phrase", phraseSchema);
