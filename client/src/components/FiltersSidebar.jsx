import { Link } from "react-router-dom";

export default function FiltersSidebar() {
  return (
    <aside className="filters-sidebar" aria-label="Filter panel">
      <div className="filter-block">
        <h3>Quick Filters</h3>
        <label className="filter-option">
          <input type="checkbox" /> Vegetarian
        </label>
        <label className="filter-option">
          <input type="checkbox" /> Fast Delivery
        </label>
        <label className="filter-option">
          <input type="checkbox" /> Family Friendly
        </label>
      </div>

      <div className="filter-block">
        <h3>Price Range</h3>
        <select defaultValue="any">
          <option value="any">Any</option>
          <option value="low">$ Budget</option>
          <option value="mid">$$ Mid</option>
          <option value="high">$$$ Premium</option>
        </select>
      </div>

      <div className="filter-block">
        <h3>Cuisine</h3>
        <select defaultValue="all">
          <option value="all">All Cuisines</option>
          <option value="indian">Indian</option>
          <option value="italian">Italian</option>
          <option value="continental">Continental</option>
          <option value="asian">Asian</option>
        </select>
      </div>

      <div className="filter-block">
        <h3>Explore</h3>
        <div className="filter-links">
          <Link to="/restaurants">Restaurants</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/reservations">Reservations</Link>
        </div>
      </div>
    </aside>
  );
}
