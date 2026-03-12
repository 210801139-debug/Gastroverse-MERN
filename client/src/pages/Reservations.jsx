import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({
    restaurant: "",
    date: "",
    time: "",
    partySize: 2,
    notes: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/reservations/my"), api.get("/restaurants")])
      .then(([resRes, restRes]) => {
        setReservations(resRes.data.data);
        setRestaurants(restRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/reservations", form);
      setReservations((prev) => [data.data, ...prev]);
      setForm({ restaurant: "", date: "", time: "", partySize: 2, notes: "" });
      toast.success("Reservation created!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create reservation");
    }
  };

  if (loading) return <p className="text-center mt-3">Loading...</p>;

  return (
    <section>
      <h2 className="mb-3">Reservations</h2>

      <div className="card mb-3">
        <h3>New Reservation</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Restaurant</label>
            <select
              value={form.restaurant}
              onChange={(e) => setForm({ ...form, restaurant: e.target.value })}
              required
            >
              <option value="">Select a restaurant</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Party Size</label>
            <input
              type="number"
              min="1"
              max="20"
              value={form.partySize}
              onChange={(e) => setForm({ ...form, partySize: Number(e.target.value) })}
              required
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
          <button type="submit" className="btn btn-primary">Reserve</button>
        </form>
      </div>

      {reservations.length === 0 ? (
        <p>No reservations yet.</p>
      ) : (
        <div className="grid">
          {reservations.map((r) => (
            <div key={r._id} className="card">
              <h3>{r.restaurant?.name || "Restaurant"}</h3>
              <p>Date: {new Date(r.date).toLocaleDateString()} at {r.time}</p>
              <p>Party: {r.partySize} &middot; Status: <strong>{r.status}</strong></p>
              {r.notes && <p>Notes: {r.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
