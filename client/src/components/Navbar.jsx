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
          background: var(--white);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
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
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary);
        }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .navbar-links a {
          font-weight: 500;
          transition: color 0.2s;
        }
        .navbar-links a:hover {
          color: var(--primary);
        }
        .navbar-user {
          font-weight: 600;
          color: var(--secondary);
        }
      `}</style>
    </nav>
  );
}
