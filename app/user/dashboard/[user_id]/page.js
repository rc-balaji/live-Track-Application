"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function UserDashboard() {
  const { user_id } = useParams();
  const [locations, setLocations] = useState([]);
  const router = useRouter();
  useEffect(() => {
    fetch(`/api/location/fetch?user_id=${user_id}`)
      .then((res) => res.json())
      .then(setLocations);
  }, []);

  const addLocation = async () => {
    const name = prompt("Enter Location Name:");
    if (!name) return;

    const res = await fetch(
      `/api/location/add?user_id=${user_id}&name=${name}`,
      {
        method: "POST",
      }
    );
    const body = await res.json();

    if (res.status === 201) {
      // console.log(body);

      const location_id = body.location_id;

      alert(body.message);

      router.push(`/user/${user_id}/location/${location_id}/add`);
    } else {
      alert(body.message);
    }
  };

  return (
    <div>
      <h1>User Dashboard</h1>
      <button onClick={addLocation}>Add Location</button>
      <ul>
        {locations.map(
          (loc) =>
            loc.status === "end" && (
              <li
                key={loc._id}
                onClick={() =>
                  router.push(`/user/${user_id}/location/${loc._id}`)
                }
              >
                {loc.name} - {loc.status}
              </li>
            )
        )}
      </ul>
    </div>
  );
}
