import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const navigate = useNavigate();
  const { access, isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/catalog/products/?featured=true"),
      isAuthenticated ? api.get("/recommendations/for-you/", access) : api.get("/recommendations/trending/"),
    ])
      .then(([featuredProducts, recommendedProducts]) => {
        setFeatured(featuredProducts);
        setRecommended(recommendedProducts);
      })
      .catch((err) => setError(err.message));
  }, [access, isAuthenticated]);

  const onSearch = (event) => {
    event.preventDefault();
    navigate(`/catalog?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Web-Based Electronics Device E-Commerce Management System</span>
          <h1>From academic documentation to a real React + Django storefront.</h1>
          <p>
            Browse electronics, track your cart, pay through a simulated CHAPA flow, and receive category-based
            recommendations built from user interactions.
          </p>
          <form className="hero-search" onSubmit={onSearch}>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Samsung Galaxy phone less than 20,000 ETB"
            />
            <button type="submit" className="primary-button">
              Explore catalog
            </button>
          </form>
          <div className="hero-actions">
            <Link className="primary-link" to="/catalog">
              Shop devices
            </Link>
            <Link className="ghost-link" to="/admin">
              View admin dashboard
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <strong>Guest, Customer, Admin</strong>
            <span>Role-based flows from the document are mapped into the UI.</span>
          </div>
          <div className="stat-card">
            <strong>Recommendation-ready</strong>
            <span>Browsing, cart, and purchase interactions feed product suggestions.</span>
          </div>
          <div className="stat-card">
            <strong>Sandbox payments</strong>
            <span>Checkout simulates CHAPA verification and invoice generation.</span>
          </div>
        </div>
      </section>

      {error && <div className="error-banner">{error}</div>}

      <section className="section-head">
        <div>
          <span className="eyebrow">Featured Products</span>
          <h2>Popular devices for daily work, study, and gaming</h2>
        </div>
      </section>
      <section className="product-grid">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      <section className="section-head">
        <div>
          <span className="eyebrow">{isAuthenticated ? "For You" : "Trending"}</span>
          <h2>{isAuthenticated ? "Personalized recommendations" : "Top selling picks for new visitors"}</h2>
        </div>
      </section>
      <section className="product-grid">
        {recommended.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </div>
  );
}
