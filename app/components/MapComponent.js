"use client";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Custom icons for first and last marker
const firstMarkerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // Red Pin Icon for Start
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const lastMarkerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684913.png", // Blue Pin Icon for End
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Auto-fit map bounds to markers
const FitBounds = ({ locations }) => {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map((loc) => [loc.latitude, loc.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);

  return null;
};

export default function MapComponent({ locations }) {
  if (!Array.isArray(locations) || locations.length === 0) {
    return <p>No location data available.</p>;
  }

  // Remove null or undefined locations
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

  return (
    <MapContainer
      center={endPos} // Center on last known location
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds locations={validLocations} />

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
          <Marker position={endPos} icon={firstMarkerIcon} />
        </>
      )}
    </MapContainer>
  );
}
