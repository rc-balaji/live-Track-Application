"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminLiveLocation() {
  const { user_id } = useParams();
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all"); // State for filtering by status
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/location/fetch?user_id=${user_id}`)
      .then((res) => res.json())
      .then((data) => {
        setLiveData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false)); // Handle errors and loading state
  }, [user_id]);

  // Filter locations based on selected status
  const filteredLiveData = liveData?.filter((loc) => {
    if (statusFilter === "all") return true; // Show all statuses
    return loc.status === statusFilter; // Filter based on status
  });

  // Sort locations by location_id in descending order
  const sortedLiveData = filteredLiveData?.sort((a, b) =>
    b._id > a._id ? 1 : -1
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 md:p-8 lg:p-10">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          Locations
        </h1>

        {/* Filter Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-lg text-white ${
                statusFilter === "all" ? "bg-blue-500" : "bg-gray-300"
              }`}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-white ${
                statusFilter === "live" ? "bg-green-500" : "bg-gray-300"
              }`}
              onClick={() => setStatusFilter("live")}
            >
              Live
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-white ${
                statusFilter === "end" ? "bg-red-500" : "bg-gray-300"
              }`}
              onClick={() => setStatusFilter("end")}
            >
              Ended
            </button>
          </div>
        </div>

        {loading ? (
          <ul className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <li
                key={index}
                className="p-4 flex justify-between items-center animate-pulse bg-gray-200 rounded-lg"
              >
                <div className="w-32 h-6 bg-gray-300 rounded-md"></div>
                <div className="w-24 h-8 bg-gray-300 rounded-lg"></div>
              </li>
            ))}
          </ul>
        ) : sortedLiveData?.length > 0 ? (
          <ul className="space-y-4 divide-y divide-gray-200">
            {sortedLiveData.map((loc) => (
              <li
                key={loc._id}
                className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() =>
                  router.push(`/admin/location/${user_id}/${loc._id}`)
                }
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-medium text-gray-700">
                    {loc.name}
                  </h2>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      loc.status === "live"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {loc.status}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  Location ID: {loc._id}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center mt-6">
            No live locations available.
          </p>
        )}
      </div>
    </div>
  );
}
