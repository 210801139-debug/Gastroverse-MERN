import { useEffect, useState } from "react";
import api from "../services/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/my")
      .then((res) => setOrders(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-3">Loading orders...</p>;

  return (
    <section>
      <h2 className="mb-3">My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="grid">
          {orders.map((order) => (
            <div key={order._id} className="card">
              <h3>{order.restaurant?.name || "Restaurant"}</h3>
              <p>Status: <strong>{order.status}</strong></p>
              <ul>
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.menuItem?.name || "Item"} x{item.quantity} — ${item.price.toFixed(2)}
                  </li>
                ))}
              </ul>
              <p className="mt-2">
                <strong>Total: ${order.totalAmount.toFixed(2)}</strong>
              </p>
              <small>{new Date(order.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
