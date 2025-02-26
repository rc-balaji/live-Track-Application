"use client";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapComponent({ locations }) {
  if (!locations.length) return <p>No location data available.</p>;

  const position = [
    locations[locations.length - 1].latitude,
    locations[locations.length - 1].longitude,
  ];

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {locations.map((loc, index) => (
        <Marker key={index} position={[loc.latitude, loc.longitude]} />
      ))}
      <Polyline
        positions={locations.map((loc) => [loc.latitude, loc.longitude])}
        color="blue"
      />
    </MapContainer>
  );
}
