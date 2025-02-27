import { connectDB } from "@/app/(api)/api/lib/db";
import Location from "@/app/(api)/api/models/Location";
import mongoose from "mongoose"; // Import mongoose

export async function GET(req, { params }) {
  await connectDB();

  // Parse the URL to get the location_id and user_id
  const url = new URL(req.url);
  const { location_id } = await params; // Extract location_id from path
  const user_id = url.searchParams.get("user_id");

  console.log("sadasdsad", location_id);

  console.log(location_id, user_id); // Check the values

  if (!location_id || !user_id) {
    return new Response(
      JSON.stringify({ message: "Missing location_id or user_id" }),
      { status: 400 }
    );
  }

  // Find the location based on user_id and location_id
  const location = await Location.find({ _id: location_id, user_id: user_id });

  if (!location) {
    return new Response(JSON.stringify({ message: "Location not found" }), {
      status: 404,
    });
  }

  return new Response(JSON.stringify({ message: "Location found", location }), {
    status: 200,
  });
}
