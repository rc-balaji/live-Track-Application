import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
  name: String,
  user_id: String,
  status: { type: String, enum: ["live", "end"], default: "live" },
  locations: [
    {
      latitude: Number,
      longitude: Number,
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.models.Location ||
  mongoose.model("Location", LocationSchema);
