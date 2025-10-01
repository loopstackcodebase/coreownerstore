import mongoose, { Schema, Document } from "mongoose";

/* ---------------------- Interface ---------------------- */
export interface ISocialLinkItem {
  title: string;
  url: string;
}

export interface ISocialLinks extends Document {
  storeId: mongoose.Types.ObjectId;
  socialLinks: ISocialLinkItem[];
}

/* ---------------------- Social Links Schema ---------------------- */
const SocialLinksSchema = new Schema<ISocialLinks>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      unique: true, // Ensure only one document per store
    },
    socialLinks: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const SocialLinksModel =
  mongoose.models.SocialLinks ||
  mongoose.model<ISocialLinks>("SocialLinks", SocialLinksSchema);
