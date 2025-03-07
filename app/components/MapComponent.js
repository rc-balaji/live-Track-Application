"use client";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";

// Custom icons
const firstMarkerIcon = new L.Icon({
  iconUrl: "/icon-green.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const lastMarkerIcon = new L.Icon({
  iconUrl: "/icon-red.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const liveMarker = new L.Icon({
  iconUrl: "/icon-live.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Kalman Filter for smoothing the GPS data
function kalmanFilter(data, R = 1, Q = 1) {
  const result = [];
  let P = 1;
  let X = data[0]; // Initial estimate

  for (let i = 1; i < data.length; i++) {
    const Z = data[i]; // Current measurement

    // Prediction step
    P = P + Q;

    // Update step
    const K = P / (P + R);
    X = X + K * (Z - X);
    P = (1 - K) * P;

    result.push(X);
  }

  return result;
}

// Smooth the GPS path
const smoothPath = (locations) => {
  const latitudes = locations.map((loc) => loc.latitude);
  const longitudes = locations.map((loc) => loc.longitude);

  const smoothedLatitudes = kalmanFilter(latitudes);
  const smoothedLongitudes = kalmanFilter(longitudes);

  return smoothedLatitudes.map((lat, i) => ({
    latitude: lat,
    longitude: smoothedLongitudes[i],
  }));
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Distance in meters
};

const calculateDistance = (locations) => {
  let totalDistanceInMeters = 0;
  for (let i = 1; i < locations.length; i++) {
    totalDistanceInMeters += haversineDistance(
      locations[i - 1].latitude,
      locations[i - 1].longitude,
      locations[i].latitude,
      locations[i].longitude
    );
  }
  return {
    totalDistanceInKm: totalDistanceInMeters / 1000,
    totalDistanceInMeters,
  };
};

const MapEvents = ({ setUserInteracted }) => {
  useMapEvents({
    moveend: () => setUserInteracted(true),
    zoomend: () => setUserInteracted(true),
  });
  return null;
};

export default function MapComponent({ locations }) {
  const [totalDistanceInKm, setTotalDistanceInKm] = useState(0);
  const [totalDistanceInMeters, setTotalDistanceInMeters] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const [smoothedPath, setSmoothedPath] = useState([]);

  // If locations are invalid, return a message early
  if (!Array.isArray(locations) || locations.length === 0) {
    return <p>No location data available.</p>;
  }

  const validLocations = locations.filter(
    (loc) => loc?.latitude && loc?.longitude
  );

  if (validLocations.length === 0) {
    return <p>No valid location data available.</p>;
  }

  const startPos = [validLocations[0].latitude, validLocations[0].longitude];
  const endPos = [
    validLocations[validLocations.length - 1].latitude,
    validLocations[validLocations.length - 1].longitude,
  ];

  const mapRef = useRef(null);

  // Effect hook for calculating distance and smoothing path
  useEffect(() => {
    if (validLocations.length > 1) {
      const { totalDistanceInKm, totalDistanceInMeters } =
        calculateDistance(validLocations);
      setTotalDistanceInKm(totalDistanceInKm);
      setTotalDistanceInMeters(totalDistanceInMeters);

      // Smooth the path only if the locations are different
      const smoothedLocations = smoothPath(validLocations);
      setSmoothedPath((prevState) => {
        // Only update if the path has changed
        if (
          prevState.length !== smoothedLocations.length ||
          prevState.some(
            (loc, index) =>
              loc.latitude !== smoothedLocations[index].latitude ||
              loc.longitude !== smoothedLocations[index].longitude
          )
        ) {
          return smoothedLocations;
        }
        return prevState;
      });
    }
  }, [validLocations]); // Only re-run when 'validLocations' change

  // Effect hook for handling map bounds and user interaction
  useEffect(() => {
    if (mapRef.current && !userInteracted) {
      const map = mapRef.current;
      const bounds = L.latLngBounds(
        validLocations.map((loc) => [loc.latitude, loc.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [validLocations, userInteracted]); // Only run when 'validLocations' or 'userInteracted' change

  const openInGoogleMaps = () => {
    const baseUrl = "https://www.google.com/maps/dir/?api=1";
    const origin = `${validLocations[0].latitude},${validLocations[0].longitude}`;
    const destination = `${
      validLocations[validLocations.length - 1].latitude
    },${validLocations[validLocations.length - 1].longitude}`;

    let fullUrl;
    if (validLocations.length == 1) {
      fullUrl = `${baseUrl}&origin=${origin}`;
    } else {
      fullUrl = `${baseUrl}&origin=${origin}&destination=${destination}`;
    }

    window.open(fullUrl, "_blank");
  };

  return (
    <div className="map-container">
      <div className="flex m-8 justify-between">
        {validLocations.length > 1 && (
          <div className="map-actions">
            <p className="text-xl font-semibold">
              Total Distance: {totalDistanceInKm.toFixed(2)} km /{" "}
              {totalDistanceInMeters.toFixed(0)} meters
            </p>
          </div>
        )}

        <button
          onClick={openInGoogleMaps}
          className=" bottom-10 right-10 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600"
        >
          Open in Google Maps
        </button>
      </div>

      <MapContainer
        center={endPos}
        zoom={20}
        maxZoom={18}
        style={{ height: "100vh", width: "100vw" }}
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents setUserInteracted={setUserInteracted} />

        {smoothedPath.length === 1 ? (
          <Marker position={startPos} icon={liveMarker} />
        ) : (
          <>
            <Polyline
              positions={smoothedPath.map((loc) => [
                loc.latitude,
                loc.longitude,
              ])}
              color="blue"
              weight={4}
            />
            <Marker position={startPos} icon={firstMarkerIcon} />
            <Marker position={endPos} icon={lastMarkerIcon} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
