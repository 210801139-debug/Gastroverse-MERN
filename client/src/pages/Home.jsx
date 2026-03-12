import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="hero">
      <h1>Welcome to Gastroverse</h1>
      <p>Discover restaurants, reserve tables, and order your favorite meals.</p>
      <div className="hero-actions">
        <Link to="/restaurants" className="btn btn-primary">
          Browse Restaurants
        </Link>
        <Link to="/register" className="btn btn-secondary">
          Get Started
        </Link>
      </div>

      <style>{`
        .hero {
          text-align: center;
          padding: 4rem 1rem;
        }
        .hero h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        .hero p {
          font-size: 1.2rem;
          color: var(--gray);
          margin-bottom: 2rem;
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
