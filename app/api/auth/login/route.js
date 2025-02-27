import { connectDB } from "@/app/api/lib/db";
import User from "@/app/api/models/User";

export async function POST(req) {
  await connectDB();
  const { email, password } = await req.json();
  const user = await User.findOne({ email, password });

  if (!user)
    return new Response(JSON.stringify({ message: "Invalid credentials" }), {
      status: 401,
    });

  return new Response(JSON.stringify(user), { status: 200 });
}
