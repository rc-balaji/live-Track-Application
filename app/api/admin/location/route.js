import { connectDB } from "@/app/lib/db";
import Location from "@/app/models/Location";

export async function GET(req) {
  const { user_id, location_id } = req.url.split("?")[1].split("=")[1]; // Get user_id from query params

  try {
    await connectDB();
    const location = await Location.findOne({
      user_id: user_id,
      status: "live",
    });

    console.log(location);

    if (!location) {
      return Response.json(
        { message: "No live location found" },
        { status: 404 }
      );
    }

    return Response.json(location, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Error fetching live location", error },
      { status: 500 }
    );
  }
}
