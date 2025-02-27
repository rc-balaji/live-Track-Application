"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function UserDashboard() {
  const { user_id } = useParams();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const [addingLocation, setAddingLocation] = useState(false); // Track adding state
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/location/fetch?user_id=${user_id}`)
      .then((res) => res.json())
      .then((data) => {
        setLocations(data);
        setLoading(false);
      });
  }, [user_id]);

  const addLocation = async () => {
    const name = prompt("Enter Location Name:");
    if (!name || name.trim() === "") {
      alert("Location name is required.");
      return;
    }

    setAddingLocation(true);

    const res = await fetch(
      `/api/location/add?user_id=${user_id}&name=${name}`,
      {
        method: "POST",
      }
    );

    const body = await res.json();

    if (res.status === 201) {
      const location_id = body.location_id;
      alert(body.message);
      router.push(`/user/${user_id}/location/${location_id}/add`);
    } else {
      alert(body.message);
    }

    setAddingLocation(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">
        User Dashboard
      </h1>

      {/* Add Location Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={addLocation}
          disabled={addingLocation}
          className={`bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
            addingLocation ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {addingLocation ? "Adding..." : "Add Location"}
        </button>
      </div>

      {/* Loading State (Shimmer Effect) */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, idx) => (
            <div
              key={idx}
              className="bg-gray-300 p-4 rounded-lg shimmer animate-pulse"
            />
          ))}
        </div>
      ) : (
        <ul className="space-y-4">
          {locations.map((loc) => (
            <li
              key={loc._id}
              onClick={() => {
                if (loc.status === "live") {
                  router.push(`/user/${user_id}/location/${loc._id}/add`);
                } else {
                  router.push(`/user/${user_id}/location/${loc._id}`);
                }
              }}
              className="flex justify-between items-center bg-white shadow-lg rounded-lg p-4 cursor-pointer hover:bg-blue-50 transition-all"
            >
              <span className="text-lg font-semibold">{loc.name}</span>
              <span
                className={`px-3 py-1 rounded-full text-white ${
                  loc.status === "live" ? "bg-green-500" : "bg-gray-500"
                }`}
              >
                {loc.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
