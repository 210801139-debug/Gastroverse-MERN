import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

export default function Dashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/restaurants/my")
      .then((res) => {
        setRestaurants(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedRestaurant(res.data.data[0]._id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedRestaurant) return;
    Promise.all([
      api.get(`/orders/restaurant/${selectedRestaurant}`),
      api.get(`/reservations/restaurant/${selectedRestaurant}`),
    ])
      .then(([ordRes, resRes]) => {
        setOrders(ordRes.data.data);
        setReservations(resRes.data.data);
      })
      .catch(() => {});
  }, [selectedRestaurant]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
      toast.success("Order updated");
    } catch {
      toast.error("Failed to update order");
    }
  };

  const updateReservationStatus = async (resId, status) => {
    try {
      await api.patch(`/reservations/${resId}/status`, { status });
      setReservations((prev) =>
        prev.map((r) => (r._id === resId ? { ...r, status } : r))
      );
      toast.success("Reservation updated");
    } catch {
      toast.error("Failed to update reservation");
    }
  };

  if (loading) return <p className="text-center mt-3">Loading dashboard...</p>;

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <section>
      <h2 className="mb-3">Owner Dashboard</h2>

      {restaurants.length === 0 ? (
        <p>You haven&apos;t created any restaurants yet.</p>
      ) : (
        <>
          <div className="form-group">
            <label>Select Restaurant</label>
            <select
              value={selectedRestaurant || ""}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
            >
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Analytics */}
          <div className="grid grid-3 mb-3">
            <div className="card text-center">
              <h3>{orders.length}</h3>
              <p>Total Orders</p>
            </div>
            <div className="card text-center">
              <h3>${totalRevenue.toFixed(2)}</h3>
              <p>Revenue</p>
            </div>
            <div className="card text-center">
              <h3>{reservations.length}</h3>
              <p>Reservations</p>
            </div>
          </div>

          {/* Orders */}
          <h3 className="mb-2">Recent Orders</h3>
          <div className="grid mb-3">
            {orders.slice(0, 10).map((order) => (
              <div key={order._id} className="card">
                <p><strong>{order.customer?.name}</strong> — ${order.totalAmount.toFixed(2)}</p>
                <p>Status: <strong>{order.status}</strong></p>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {["confirmed", "preparing", "ready", "delivered"].map((s) => (
                    <button
                      key={s}
                      className="btn btn-outline"
                      style={{ fontSize: "0.8rem" }}
                      onClick={() => updateOrderStatus(order._id, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Reservations */}
          <h3 className="mb-2">Reservations</h3>
          <div className="grid">
            {reservations.slice(0, 10).map((res) => (
              <div key={res._id} className="card">
                <p><strong>{res.customer?.name}</strong> — Party of {res.partySize}</p>
                <p>{new Date(res.date).toLocaleDateString()} at {res.time}</p>
                <p>Status: <strong>{res.status}</strong></p>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {["confirmed", "cancelled"].map((s) => (
                    <button
                      key={s}
                      className="btn btn-outline"
                      style={{ fontSize: "0.8rem" }}
                      onClick={() => updateReservationStatus(res._id, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
