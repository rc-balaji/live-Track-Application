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
  const [tracking, setTracking] = useState(false);

  // Fetch live location data for the given location_id
  useEffect(() => {
    fetch(`/api/location/fetch/${location_id}?user_id=${user_id}`)
      .then((res) => res.json())
      .then(setLiveData);
  }, [location_id]);

  // Start location tracking
  const startTracking = () => {
    setTracking(true);
    const interval = setInterval(async () => {
      const pos = await new Promise((resolve) =>
        navigator.geolocation.getCurrentPosition(resolve)
      );
      const { latitude, longitude } = pos.coords;

      await fetch("/api/location/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location_id, latitude, longitude }),
      });

      // Fetch updated live data
      fetch(`/api/location/fetch?location_id=${location_id}`)
        .then((res) => res.json())
        .then(setLiveData);
    }, 5000);

    return () => clearInterval(interval); // Clear interval when tracking stops
  };

  // Stop location tracking
  const stopTracking = async () => {
    await fetch("/api/location/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location_id }),
    });
    setTracking(false);
  };

  return (
    <div>
      <h1>Live Tracking: {location_id}</h1>
      {tracking ? (
        <button onClick={stopTracking}>Stop</button>
      ) : (
        <button onClick={startTracking}>Start</button>
      )}
      {liveData && <MapComponent locations={liveData.locations} />}
    </div>
  );
}
