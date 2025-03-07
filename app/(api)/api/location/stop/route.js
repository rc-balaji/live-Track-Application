import { connectDB } from "@/app/(api)/api/lib/db";
import Location from "@/app/(api)/api/models/Location";

export async function POST(req) {
  // Parse query parameters using URLSearchParams
  const url = new URL(req.url);

  const location_id = url.searchParams.get("location_id");


  console.log();
  

  try {
    await connectDB();
    const location = await Location.findOne({ location_id, status: "live" });

    if (location) {
      location.status = "end";
      await location.save();
      return Response.json({ message: "Tracking stopped" }, { status: 200 });
    }

    return Response.json(
      { message: "No live location found" },
      { status: 404 }
    );
  } catch (error) {
    return Response.json(
      { message: "Error stopping location tracking", error },
      { status: 500 }
    );
  }
}
