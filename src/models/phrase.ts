import { Model, model, Schema, Types } from "mongoose";

export interface IPhrase {
  _id: Types.ObjectId,
  phrase: string,
  bias: number,
};

export const phraseSchema: Schema<IPhrase> = new Schema({
  phrase: { type: String, required: true },
  bias: { type: Number, required: true },
});

export const PhraseModel: Model<IPhrase> = model("Phrase", phraseSchema);

PhraseModel.createCollection();
