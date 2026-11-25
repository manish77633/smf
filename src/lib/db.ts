import mongoose, { Schema } from "mongoose";
const state = globalThis as typeof globalThis & {
  mongo?: Promise<typeof mongoose>;
};
export async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri || !/^mongodb(?:\+srv)?:\/\//.test(uri))
    throw new Error("Configure a valid MongoDB URI");
  state.mongo ??= mongoose
    .connect(uri, { serverSelectionTimeoutMS: 5000 })
    .catch((error) => {
      delete state.mongo;
      throw error;
    });
  return state.mongo;
}
const model = (name: string, schema: Schema) =>
  mongoose.models[name] || mongoose.model(name, schema);
const singleton = { key: { type: String, required: true, unique: true } };
const payload = { type: Schema.Types.Mixed, required: true };
const timestamps = { timestamps: true };
export const Page = model(
  "Page",
  new Schema(
    {
      ...singleton,
      draft: payload,
      published: Schema.Types.Mixed,
      revision: { type: Number, default: 0 },
    },
    timestamps,
  ),
);
export const SiteSettings = model(
  "SiteSettings",
  new Schema({ ...singleton, value: payload }, timestamps),
);
export const Navigation = model(
  "Navigation",
  new Schema({ ...singleton, value: payload }, timestamps),
);
const contentRecord = () =>
  new Schema(
    { key: { type: String, required: true, unique: true }, value: payload },
    timestamps,
  );
export const ContentModels = {
  loans: model("Loan", contentRecord()),
  blogs: model("Blog", contentRecord()),
  videos: model("Video", contentRecord()),
  faqs: model("FAQ", contentRecord()),
  testimonials: model("Testimonial", contentRecord()),
};
export const AdminUser = model(
  "AdminUser",
  new Schema(
    {
      email: { type: String, required: true, unique: true },
      hash: { type: String, required: true },
      version: { type: Number, default: 0 },
    },
    timestamps,
  ),
);
const enquiry = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    loan: { type: String, required: true },
    message: String,
    source: String,
    sourcePage: String,
    consentAt: Date,
    status: {
      type: String,
      enum: ["New", "Contacted", "In Progress", "Converted", "Closed", "Spam"],
      default: "New",
    },
    notes: { type: String, default: "" },
    notification: {
      type: String,
      enum: ["Pending", "Sent", "Failed", "Unconfigured"],
      default: "Pending",
    },
    dedupe: { type: String, unique: true, required: true },
  },
  timestamps,
);
enquiry.index({ status: 1, createdAt: -1 });
enquiry.index({ createdAt: -1 });
export const Enquiry = model("Enquiry", enquiry);
export const RateLimit = model(
  "RateLimit",
  new Schema({
    _id: String,
    count: Number,
    expiresAt: { type: Date, expires: 0 },
  }),
);
export const AuditLog = model(
  "AuditLog",
  new Schema({ actor: String, action: String, target: String }, timestamps),
);
export const Redirect = model(
  "Redirect",
  new Schema(
    { from: { type: String, unique: true }, to: String, permanent: Boolean },
    timestamps,
  ),
);
export const Media = model(
  "Media",
  new Schema(
    {
      publicId: { type: String, unique: true },
      url: { type: String, unique: true },
      format: String,
      width: Number,
      height: Number,
      bytes: Number,
      alt: String,
      deleting: { type: Boolean, default: false },
    },
    timestamps,
  ),
);
export const MediaBlob = model(
  "MediaBlob",
  new Schema({
    publicId: { type: String, required: true, unique: true },
    data: { type: Buffer, required: true },
  }),
);
