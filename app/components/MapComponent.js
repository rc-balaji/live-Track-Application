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

// Component to track user map interactions (zoom/pan)
const MapEvents = ({ setUserInteracted }) => {
  useMapEvents({
    moveend: () => setUserInteracted(true),
    zoomend: () => setUserInteracted(true),
  });

  return null;
};

export default function MapComponent({ locations }) {
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
  const [userInteracted, setUserInteracted] = useState(false);

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
      <MapContainer
        center={endPos}
        zoom={18}
        style={{ height: "100vh", width: "100vw" }} // Full page size
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Detect user interaction to prevent auto-reset */}
        <MapEvents setUserInteracted={setUserInteracted} />

        {validLocations.length === 1 ? (
          <Marker position={startPos} icon={firstMarkerIcon} />
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
