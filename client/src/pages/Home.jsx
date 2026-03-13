import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <section className="hero">
      <h1>Welcome to Gastroverse</h1>
      <p>Discover restaurants, reserve tables, and order your favorite meals.</p>
      <div className="hero-actions">
        <Link to="/restaurants" className="btn btn-primary">
          Browse Restaurants
        </Link>
        <Link to={user ? "/dashboard" : "/register"} className="btn btn-secondary">
          {user ? "Dashboard" : "Get Started"}
        </Link>
      </div>

      <style>{`
        .hero {
          text-align: center;
          padding: 6rem 1rem 4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .hero h1 {
          font-size: 3.2rem;
          font-weight: 800;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #fff 0%, var(--secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: none;
          line-height: 1.2;
        }
        .hero p {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 2.5rem;
          max-width: 520px;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
      `}</style>
    </section>
  );
}
