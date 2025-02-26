import { connectDB } from "../../../lib/db";
import User from "@/app/models/User";

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({ role: "user" }, { password: 0 }); // Exclude password for security
    return Response.json(users, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Error fetching users", error },
      { status: 500 }
    );
  }
}
