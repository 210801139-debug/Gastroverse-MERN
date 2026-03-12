import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

export default function Menu() {
  const { restaurantId } = useParams();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/menu/${restaurantId}`)
      .then((res) => setItems(res.data.data))
      .catch(() => toast.error("Failed to load menu"))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem === item._id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem === item._id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item._id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const placeOrder = async () => {
    try {
      const orderItems = cart.map(({ menuItem, quantity, price }) => ({ menuItem, quantity, price }));
      const totalAmount = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
      await api.post("/orders", { restaurant: restaurantId, items: orderItems, totalAmount });
      toast.success("Order placed!");
      setCart([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    }
  };

  if (loading) return <p className="text-center mt-3">Loading menu...</p>;

  return (
    <section>
      <h2 className="mb-3">Menu</h2>
      <div className="grid grid-3">
        {items.map((item) => (
          <div key={item._id} className="card">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p><strong>${item.price.toFixed(2)}</strong> &middot; {item.category}</p>
            {user?.role === "customer" && (
              <button className="btn btn-primary mt-2" onClick={() => addToCart(item)}>
                Add to Cart
              </button>
            )}
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="card mt-3">
          <h3>Cart</h3>
          <ul>
            {cart.map((c) => (
              <li key={c.menuItem}>
                {c.name} x{c.quantity} — ${(c.price * c.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <p className="mt-2">
            <strong>Total: ${cart.reduce((s, c) => s + c.price * c.quantity, 0).toFixed(2)}</strong>
          </p>
          <button className="btn btn-primary mt-2" onClick={placeOrder}>
            Place Order
          </button>
        </div>
      )}
    </section>
  );
}
