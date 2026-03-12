import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/restaurants")
      .then((res) => setRestaurants(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-3">Loading restaurants...</p>;

  return (
    <section>
      <h2 className="mb-3">Restaurants</h2>
      {restaurants.length === 0 ? (
        <p>No restaurants found.</p>
      ) : (
        <div className="grid grid-3">
          {restaurants.map((r) => (
            <div key={r._id} className="card">
              <h3>{r.name}</h3>
              <p>{r.cuisine?.join(", ")}</p>
              <p className="text-muted">{r.description}</p>
              <Link to={`/menu/${r._id}`} className="btn btn-primary mt-2">
                View Menu
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
