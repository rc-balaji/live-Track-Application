"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

// Dynamically import the MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import("@/app/components/MapComponent"), {
  ssr: false,
});

export default function LiveLocation() {
  const { location_id, user_id } = useParams();

  const [liveData, setLiveData] = useState(null);

  // Fetch live location data for the given location_id
  useEffect(() => {
    fetch(`/api/location/fetch/${location_id}?user_id=${user_id}`)
      .then((res) => res.json())
      .then(setLiveData);
  }, [location_id]);

  const location_data = liveData ? liveData.location : [];

  return (
    <div>
      <h1>Location</h1>
      {/* {liveData && liveData.message} */}
      {location_data.length !== 0 ? (
        <MapComponent locations={location_data[0].locations} />
      ) : (
        "Not Found"
      )}
    </div>
  );
}
