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

// Custom icons for first and last marker
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

// Haversine formula to calculate distance
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c * 1000; // Returns the distance in meters
};

// Helper function to calculate total distance in km and meters
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

  const totalDistanceInKm = totalDistanceInMeters / 1000; // Convert to kilometers
  return { totalDistanceInKm, totalDistanceInMeters };
};

// Component to track user map interactions (zoom/pan)
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

  // Validate the locations array
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

  // Ref to store map instance
  const mapRef = useRef(null);

  // Effect to calculate total distance when valid locations change
  useEffect(() => {
    if (validLocations.length > 1) {
      const { totalDistanceInKm, totalDistanceInMeters } =
        calculateDistance(validLocations);
      setTotalDistanceInKm(totalDistanceInKm);
      setTotalDistanceInMeters(totalDistanceInMeters);
    }
  }, [validLocations]);

  // Preserve map zoom and center state
  useEffect(() => {
    if (mapRef.current && !userInteracted) {
      const map = mapRef.current;
      const bounds = L.latLngBounds(
        validLocations.map((loc) => [loc.latitude, loc.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [validLocations, userInteracted]);

  return (
    <div className="map-container">
      {validLocations.length > 1 && (
        <div className="map-actions">
          {/* Show total distance in kilometers and meters */}
          <p className="text-xl font-semibold">
            Total Distance: {totalDistanceInKm.toFixed(2)} km /{" "}
            {totalDistanceInMeters.toFixed(0)} meters
          </p>
        </div>
      )}

      <MapContainer
        center={endPos}
        zoom={20}
        maxZoom={18}
        
        style={{ height: "100vh", width: "100vw" }} // Full page size
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Detect user interaction to prevent auto-reset */}
        <MapEvents setUserInteracted={setUserInteracted} />

        {validLocations.length === 1 ? (
          <Marker position={startPos} icon={liveMarker} />
        ) : (
          <>
            {/* Draw Polyline for multiple locations */}
            <Polyline
              positions={validLocations.map((loc) => [
                loc.latitude,
                loc.longitude,
              ])}
              color="blue"
              weight={4}
            />

            {/* First Marker */}
            <Marker position={startPos} icon={firstMarkerIcon} />

            {/* Last Marker */}
            <Marker position={endPos} icon={lastMarkerIcon} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
