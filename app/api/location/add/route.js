import { connectDB } from "@/app/lib/db";
import Location from "@/app/models/Location";

export async function POST(req) {
  await connectDB();

  // Parse query parameters using URLSearchParams
  const url = new URL(req.url);

  const user_id = url.searchParams.get("user_id");
  const name = url.searchParams.get("name");

  console.log("Called", user_id, name); // Check the values

  if (!user_id || !name) {
    return new Response(
      JSON.stringify({ message: "Missing user_id or name" }),
      { status: 400 }
    );
  }

  const existingLocation = await Location.findOne({
    user_id: user_id,
    status: "live",
  });

  if (existingLocation) {
    return new Response(
      JSON.stringify({ message: "A location is already live for this user." }),
      { status: 400 }
    );
  }

  const location = new Location({
    name: name,
    user_id: user_id, // Save the ObjectId instead of the string
    status: "live",
    locations: [],
  });

  await location.save();

  return new Response(
    JSON.stringify({ message: "Location added", location_id: location._id }),
    {
      status: 201,
    }
  );
}
