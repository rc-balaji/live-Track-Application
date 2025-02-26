import { connectDB } from "@/app/lib/db";
import Location from "@/app/models/Location";

export async function GET(req) {
  const url = new URL(req.url);
  const user_id = url.searchParams.get("user_id");
  console.log("API ", user_id);

  try {
    await connectDB();
    const location = await Location.find({ user_id });

    if (!location) {
      return Response.json({ message: "Location not found" }, { status: 404 });
    }

    return Response.json(location, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Error fetching location", error },
      { status: 500 }
    );
  }
}
