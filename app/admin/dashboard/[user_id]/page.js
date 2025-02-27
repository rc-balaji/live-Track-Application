"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/get-users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg p-8 md:p-10 lg:p-12">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-6 text-center">
          Admin Dashboard
        </h1>

        {loading ? (
          <ul className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <li
                key={index}
                className="p-4 flex justify-between items-center animate-pulse"
              >
                <div className="w-32 h-6 bg-gray-300 rounded-md"></div>
                <div className="w-24 h-8 bg-gray-300 rounded-lg"></div>
              </li>
            ))}
          </ul>
        ) : users.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li
                key={user._id}
                className="p-4 flex justify-between items-center hover:bg-gray-50 transition duration-300 ease-in-out cursor-pointer rounded-lg transform hover:scale-105"
                onClick={() => router.push(`/admin/location/${user._id}`)}
              >
                <span className="text-lg font-medium text-gray-700">
                  {user.username}
                </span>
                <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
                  View Locations
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center text-lg mt-6">
            No users found.
          </p>
        )}
      </div>
    </div>
  );
}
