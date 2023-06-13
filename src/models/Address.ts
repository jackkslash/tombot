import { model, Schema, Document } from "mongoose";

interface IAddress extends Document {
  address: [string];
  label: string;
}

const addressSchema: Schema = new Schema({
  address: { type: [String], required: true },
  label: { type: String, required: true },
});

export const Address = model<IAddress>("Address", addressSchema);
