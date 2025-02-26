import { connectDB } from "@/app/lib/db";
import Location from "@/app/models/Location";

export async function POST(req) {
  const url = new URL(req.url);

  const location_id = url.searchParams.get("location_id");
  const latitude = url.searchParams.get("latitude");
  const longitude = url.searchParams.get("longitude");
  const user_id = url.searchParams.get("user_id");

  try {
    await connectDB();

    const existingLocation = await Location.findOne({
      user_id: user_id,
      _id: location_id,
      status: "live",
    });

    if (existingLocation) {
      existingLocation.locations.push({
        latitude,
        longitude,
        timestamp: new Date(),
      });
      await existingLocation.save();
    }

    return Response.json(
      { message: "Location updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { message: "Error updating location", error },
      { status: 500 }
    );
  }
}
