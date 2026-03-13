import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Restaurants from "./pages/Restaurants";
import Menu from "./pages/Menu";
import Orders from "./pages/Orders";
import Reservations from "./pages/Reservations";
import Dashboard from "./pages/Dashboard";

const authRoutes = ["/login", "/register", "/forgot-password"];

function App() {
  const location = useLocation();
  const isAuthPage = authRoutes.includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Navbar />}
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      ) : (
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/menu/:restaurantId" element={<Menu />} />

            {/* Customer routes */}
            <Route element={<ProtectedRoute roles={["customer"]} />}>
              <Route path="/orders" element={<Orders />} />
              <Route path="/reservations" element={<Reservations />} />
            </Route>

            {/* Owner routes */}
            <Route element={<ProtectedRoute roles={["owner"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Routes>
        </main>
      )}
      <Toaster position="top-right" />
    </>
  );
}

export default App;
