import { connectDB } from "@/app/(api)/api/lib/db";
import User from "@/app/(api)/api/models/User";

export async function POST(req) {
  await connectDB();
  const { email, username, password, role } = await req.json();
  const user = new User({ email, username, password, role });
  await user.save();
  return new Response(JSON.stringify({ message: "User registered", user }), {
    status: 201,
  });
}
