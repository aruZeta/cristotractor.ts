import { Model, model, Schema, Types } from 'mongoose';

export interface IVehicle {
  _id: Types.ObjectId,
  name: string,
};

export const vehicleSchema: Schema<IVehicle> = new Schema({
  name: { type: String, required: true },
});

export const VehicleModel: Model<IVehicle> = model("Vehicle", vehicleSchema);

VehicleModel.createCollection();
