import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          Gastroverse
        </Link>

        <div className="navbar-links">
          <Link to="/restaurants">Restaurants</Link>

          {user ? (
            <>
              {user.role === "customer" && (
                <>
                  <Link to="/orders">My Orders</Link>
                  <Link to="/reservations">Reservations</Link>
                </>
              )}
              {user.role === "owner" && <Link to="/dashboard">Dashboard</Link>}
              <span className="navbar-user">{user.name}</span>
              <button className="btn btn-outline" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        .navbar {
          background: rgba(43, 24, 16, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
          padding: 0.8rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .navbar-brand {
          font-size: 1.6rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.02em;
        }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }
        .navbar-links a {
          font-weight: 500;
          color: var(--text-primary);
          transition: all 0.3s ease;
          position: relative;
        }
        .navbar-links a:not(.btn)::after {
          content: "";
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--secondary);
          transition: width 0.3s ease;
        }
        .navbar-links a:not(.btn):hover::after {
          width: 100%;
        }
        .navbar-links a:hover {
          color: var(--secondary);
        }
        .navbar-user {
          font-weight: 600;
          color: var(--secondary);
        }
      `}</style>
    </nav>
  );
}
