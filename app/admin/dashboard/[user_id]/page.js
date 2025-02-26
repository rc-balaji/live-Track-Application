"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/get-users")
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ul>
        {users.map((user) => (
          <li
            key={user._id}
            onClick={() => router.push(`/admin/location/${user._id}`)}
          >
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
}
