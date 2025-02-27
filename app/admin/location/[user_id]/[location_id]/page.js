"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const MapComponent = dynamic(() => import("@/app/components/MapComponent"), {
  ssr: false,
});

export default function AdminLiveLocation() {
  const { user_id, location_id } = useParams();
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      fetch(`/api/location/fetch/${location_id}?user_id=${user_id}`)
        .then((res) => res.json())
        .then(setLiveData)
        .catch((error) => console.error("Error fetching data:", error));
    };

    // Initial fetch
    fetchData();

    // Fetch every 3 seconds
    const intervalId = setInterval(fetchData, 3000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [user_id, location_id]); // Re-run effect when params change

  const location_data = liveData ? liveData.location : [];
  console.log(location_data);

  return (
    <div>
      <h1>Live Location for User</h1>
      {location_data.length !== 0 ? (
        <MapComponent
          locations={
            location_data[0].status === "live"
              ? [location_data[0].locations[0]]
              : location_data[0].locations
          }
        />
      ) : (
        "Not Found"
      )}
    </div>
  );
}
