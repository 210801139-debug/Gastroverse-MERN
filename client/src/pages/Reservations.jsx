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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
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

  const validate = (field, value) => {
    const newErrors = { ...errors };

    if (field === "restaurant") {
      if (!value) newErrors.restaurant = "Please select a restaurant";
      else delete newErrors.restaurant;
    }
    if (field === "date") {
      if (!value) {
        newErrors.date = "Date is required";
      } else if (new Date(value) < new Date(new Date().toDateString())) {
        newErrors.date = "Date cannot be in the past";
      } else {
        delete newErrors.date;
      }
    }
    if (field === "time") {
      if (!value) newErrors.time = "Time is required";
      else delete newErrors.time;
    }
    if (field === "partySize") {
      const num = Number(value);
      if (!value || isNaN(num)) newErrors.partySize = "Party size is required";
      else if (num < 1 || num > 20) newErrors.partySize = "Party size must be between 1 and 20";
      else delete newErrors.partySize;
    }

    setErrors(newErrors);
    return !newErrors[field];
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate(field, form[field]);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) validate(field, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ restaurant: true, date: true, time: true, partySize: true });
    const v1 = validate("restaurant", form.restaurant);
    const v2 = validate("date", form.date);
    const v3 = validate("time", form.time);
    const v4 = validate("partySize", form.partySize);
    if (!v1 || !v2 || !v3 || !v4) return;

    try {
      const { data } = await api.post("/reservations", form);
      setReservations((prev) => [data.data, ...prev]);
      setForm({ restaurant: "", date: "", time: "", partySize: 2, notes: "" });
      setTouched({});
      setErrors({});
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
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Restaurant</label>
            <select
              value={form.restaurant}
              onChange={(e) => handleChange("restaurant", e.target.value)}
              onBlur={() => handleBlur("restaurant")}
              className={touched.restaurant && errors.restaurant ? "input-error" : ""}
            >
              <option value="">Select a restaurant</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
            {touched.restaurant && errors.restaurant && <span className="error-text">{errors.restaurant}</span>}
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              onBlur={() => handleBlur("date")}
              className={touched.date && errors.date ? "input-error" : ""}
            />
            {touched.date && errors.date && <span className="error-text">{errors.date}</span>}
          </div>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => handleChange("time", e.target.value)}
              onBlur={() => handleBlur("time")}
              className={touched.time && errors.time ? "input-error" : ""}
            />
            {touched.time && errors.time && <span className="error-text">{errors.time}</span>}
          </div>
          <div className="form-group">
            <label>Party Size</label>
            <input
              type="number"
              min="1"
              max="20"
              placeholder="Number of guests (1-20)"
              value={form.partySize}
              onChange={(e) => handleChange("partySize", Number(e.target.value))}
              onBlur={() => handleBlur("partySize")}
              className={touched.partySize && errors.partySize ? "input-error" : ""}
            />
            {touched.partySize && errors.partySize && <span className="error-text">{errors.partySize}</span>}
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              placeholder="Any special requests or dietary requirements..."
              value={form.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
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
