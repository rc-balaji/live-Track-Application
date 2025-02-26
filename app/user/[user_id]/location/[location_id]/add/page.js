"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";

export default function LiveLocation() {
  const { location_id, user_id } = useParams();
  const [tracking, setTracking] = useState(false);
  const router = useRouter();

  // Start location tracking
  const startTracking = () => {
    setTracking(true);
    const interval = setInterval(async () => {
      const pos = await new Promise((resolve) =>
        navigator.geolocation.getCurrentPosition(resolve)
      );
      const { latitude, longitude } = pos.coords;

      await fetch(
        `/api/location/update?location_id=${location_id}&latitude=${latitude}&longitude=${longitude}&user_id=${user_id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
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
    router.back();
  };

  return (
    <div>
      <h1>Live Tracking: {location_id}</h1>
      {tracking ? (
        <button onClick={stopTracking}>Stop</button>
      ) : (
        <button onClick={startTracking}>Start</button>
      )}
    </div>
  );
}
