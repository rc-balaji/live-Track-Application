"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LiveLocation() {
  const params = useParams();
  const router = useRouter();

  const location_id = params?.location_id || null;
  const user_id = params?.user_id || null;

  const [tracking, setTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestPermission(); // Check permission on mount
    startTracking();
  }, []);

  // Function to check & request location permission
  const requestPermission = async () => {
    if (!navigator.permissions) return;
    try {
      const permissionStatus = await navigator.permissions.query({
        name: "geolocation",
      });

      if (permissionStatus.state === "denied") {
        alert(
          "Location access is blocked. Please enable it in browser settings."
        );
      }
    } catch (error) {
      console.error("Permission check error:", error);
    }
    setLoading(false);
  };

  // Start tracking user location
  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setTracking(true);

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        if (!latitude || !longitude) {
          console.warn("Invalid location data received.");
          return;
        }

        try {
          await fetch(
            `/api/location/update?location_id=${location_id}&latitude=${latitude}&longitude=${longitude}&user_id=${user_id}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (error) {
          console.error("Error updating location:", error);
        }
      },
      (error) => {
        console.error("Location error:", error);
        handleGeolocationError(error);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    setWatchId(id);
  };

  // Stop tracking
  const stopTracking = async () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }

    try {
      await fetch("/api/location/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location_id }),
      });
    } catch (error) {
      console.error("Error stopping location tracking:", error);
    }

    setTracking(false);
    router.back();
  };

  // Handle geolocation errors
  const handleGeolocationError = (error) => {
    setTracking(false);
    if (error.code === error.PERMISSION_DENIED) {
      alert("Location permission denied. Enable it in browser settings.");
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      alert("Location unavailable. Try again later.");
    } else if (error.code === error.TIMEOUT) {
      alert("Location request timed out. Retry.");
    } else {
      alert("Unknown location error. Please try again.");
    }
  };

  if (loading) {
    return <p>Checking location permission...</p>;
  }

  return (
    <div>
      <h1>Live Tracking: {location_id || "Unknown"}</h1>
      {tracking ? (
        <button onClick={stopTracking}>Stop Tracking</button>
      ) : (
        <button onClick={startTracking}>Start Tracking</button>
      )}
    </div>
  );
}
