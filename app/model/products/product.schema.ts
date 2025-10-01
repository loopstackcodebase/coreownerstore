import mongoose, { Schema, Document } from "mongoose";

/* ---------------------- Interface ---------------------- */
export interface IProduct extends Document {
  name: string;
  description: string;
  category: string;
  images: string[];
  actualPrice: number;
  offerPrice?: number;
  totalQuantity: number;
  availableLocation: string;
  inStock: boolean;
  keyFeatures: string[];
  totalViews: number;
  totalBuys: number;
  storeId: mongoose.Types.ObjectId;
  softDelete: boolean;
}

/* ---------------------- Product Schema ---------------------- */
const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    actualPrice: {
      type: Number,
      required: true,
    },
    offerPrice: {
      type: Number,
      default: 0,
    },
    totalQuantity: {
      type: Number,
      required: true,
    },
    availableLocation: {
      type: String,
      default: "",
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    keyFeatures: {
      type: [String],
      default: [],
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    totalBuys: {
      type: Number,
      default: 0,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    softDelete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ProductModel =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
