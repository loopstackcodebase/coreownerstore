import mongoose, { Schema, Document } from "mongoose";

/* ---------------------- Interfaces ---------------------- */

interface BusinessHour {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  isOpen: boolean;
}

interface QuickHelpOptions {
  liveChatSupport: boolean;
  technicalSupport: boolean;
  accountHelp: boolean;
}

interface ContactInfo {
  getInTouchContent: string;
  whatsAppSupport: string;
  emailSupport: string;
  available24x7: boolean;
  responseTime: string;
}

interface AboutUsValues {
  trust: string;
  excellence: string;
  sustainability: string;
  community: string;
}

interface WhyChooseUs {
  secureShopping: string;
  fastDelivery: string;
  customerFirst: string;
}

interface AboutUsStats {
  happyCustomers: string;
  products: string;
  countriesServed: string;
  uptime: string;
}

interface AboutUs {
  ourStory: string;
  mission: string;
  vision: string;
  values: AboutUsValues;
  whyChooseUs: WhyChooseUs;
  statistics: AboutUsStats;
  ourTeam: string;
}

export interface IStore extends Document {
  displayName: string;
  ownerId: mongoose.Types.ObjectId;
  description: string;
  email: string;
  logo: string;

  contact: ContactInfo;
  businessHours: BusinessHour[];
  quickHelp: QuickHelpOptions;
  aboutUs: AboutUs;
}

/* ---------------------- Sub Schemas ---------------------- */

const BusinessHourSchema = new Schema<BusinessHour>({
  day: {
    type: String,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  isOpen: { type: Boolean, default: false },
});

const QuickHelpSchema = new Schema<QuickHelpOptions>({
  liveChatSupport: { type: Boolean, default: false },
  technicalSupport: { type: Boolean, default: false },
  accountHelp: { type: Boolean, default: false },
});

const ContactSchema = new Schema<ContactInfo>({
  getInTouchContent: { type: String, default: "" },
  whatsAppSupport: { type: String, default: "" },
  emailSupport: { type: String, default: "" },
  available24x7: { type: Boolean, default: false },
  responseTime: { type: String, default: "" },
});

const AboutUsSchema = new Schema<AboutUs>({
  ourStory: { type: String, default: "" },
  mission: { type: String, default: "" },
  vision: { type: String, default: "" },
  values: {
    trust: { type: String, default: "" },
    excellence: { type: String, default: "" },
    sustainability: { type: String, default: "" },
    community: { type: String, default: "" },
  },
  whyChooseUs: {
    secureShopping: { type: String, default: "" },
    fastDelivery: { type: String, default: "" },
    customerFirst: { type: String, default: "" },
  },
  statistics: {
    happyCustomers: { type: String, default: "" },
    products: { type: String, default: "" },
    countriesServed: { type: String, default: "" },
    uptime: { type: String, default: "" },
  },
  ourTeam: { type: String, default: "" },
});

/* ---------------------- Store Schema ---------------------- */

const StoreSchema = new Schema<IStore>(
  {
    displayName: { type: String, required: true, unique: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    description: { type: String, default: "" },
    email: { type: String, default: "", unique: true },
    logo: { type: String, default: "" },

    contact: { type: ContactSchema, default: () => ({}) },
    businessHours: {
      type: [BusinessHourSchema] as unknown as Schema<BusinessHour>[],
      default: (): BusinessHour[] =>
        [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((day) => ({
          day: day as BusinessHour["day"],
          isOpen: false,
        })),
    },

    quickHelp: { type: QuickHelpSchema, default: () => ({}) },
    aboutUs: { type: AboutUsSchema, default: () => ({}) },
  },
  {
    timestamps: true,
  }
);

export const StoreModel =
  mongoose.models.Store || mongoose.model<IStore>("Store", StoreSchema);
