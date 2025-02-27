"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";

export default function AdminLiveLocation() {
  const { user_id } = useParams();
  const [liveData, setLiveData] = useState(null);

  const router = useRouter();

  useEffect(() => {
    fetch(`/api/location/fetch?user_id=${user_id}`)
      .then((res) => res.json())
      .then(setLiveData);
  }, []);

  console.log(liveData);

  return (
    <div>
      <h1>Locations</h1>
      {liveData &&
        liveData.map((loc, index) => {
          return (
            <div
              onClick={() =>
                router.push(`/admin/location/${user_id}/${loc._id}`)
              }
              key={loc._id}
            >
              <p>{loc.name}</p>
              <p>Status : {loc.status}</p>
            </div>
          );
        })}
    </div>
  );
}
