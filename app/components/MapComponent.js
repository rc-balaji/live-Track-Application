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

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000;
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

  useEffect(() => {
    if (validLocations.length > 1) {
      const { totalDistanceInKm, totalDistanceInMeters } =
        calculateDistance(validLocations);
      setTotalDistanceInKm(totalDistanceInKm);
      setTotalDistanceInMeters(totalDistanceInMeters);
    }
  }, [validLocations]);

  useEffect(() => {
    if (mapRef.current && !userInteracted) {
      const map = mapRef.current;
      const bounds = L.latLngBounds(
        validLocations.map((loc) => [loc.latitude, loc.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [validLocations, userInteracted]);

  const openInGoogleMaps = () => {
    const baseUrl = "https://www.google.com/maps/dir/";
    const coords = validLocations
      .map((loc) => `${loc.latitude},${loc.longitude}`)
      .join("/");
    window.open(`${baseUrl}${coords}`, "_blank");
  };

  return (
    <div className="map-container">
      {validLocations.length > 1 && (
        <div className="map-actions">
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
        style={{ height: "100vh", width: "100vw" }}
        whenCreated={(map) => (mapRef.current = map)}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapEvents setUserInteracted={setUserInteracted} />

        {validLocations.length === 1 ? (
          <Marker position={startPos} icon={liveMarker} />
        ) : (
          <>
            <Polyline
              positions={validLocations.map((loc) => [
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

      <button
        onClick={openInGoogleMaps}
        className="fixed bottom-10 right-10 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600"
      >
        Open in Google Maps
      </button>
    </div>
  );
}
