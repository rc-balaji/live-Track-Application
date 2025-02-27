import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
