import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { access, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    Promise.all([
      api.get(`/catalog/products/${slug}/`, access || undefined),
      isAuthenticated ? api.get("/recommendations/for-you/", access) : api.get("/recommendations/trending/"),
    ])
      .then(([productData, recommendationData]) => {
        setProduct(productData);
        setRecommended(recommendationData.filter((item) => item.slug !== slug).slice(0, 4));
      })
      .catch((err) => setError(err.message));
  }, [slug, access, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await addToCart(product.id, 1);
      setNotice("Added to cart.");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!product) {
    return <div className="panel">Loading product...</div>;
  }

  return (
    <div className="page-stack">
      {error && <div className="error-banner">{error}</div>}
      {notice && <div className="success-banner">{notice}</div>}

      <section className="product-hero">
        <div className="product-detail-image">
          {product.image_url ? <img src={product.image_url} alt={product.name} /> : <div>{product.brand}</div>}
        </div>
        <div className="product-detail-copy">
          <span className="eyebrow">{product.category?.name}</span>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="inline-badges">
            <span className="badge">Brand: {product.brand}</span>
            <span className="badge">SKU: {product.sku}</span>
            <span className={`badge ${product.is_low_stock ? "warning-badge" : ""}`}>
              Stock: {product.stock_qty}
            </span>
          </div>
          <div className="purchase-strip">
            <strong>ETB {product.price}</strong>
            <button className="primary-button" onClick={handleAddToCart}>
              Add to cart
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Specifications</span>
            <h2>Technical details</h2>
          </div>
        </div>
        <div className="spec-grid">
          {Object.entries(product.specifications || {}).map(([key, value]) => (
            <div key={key} className="spec-card">
              <span>{key}</span>
              <strong>{String(value)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-head">
        <div>
          <span className="eyebrow">Recommended For You</span>
          <h2>Related models and accessories</h2>
        </div>
      </section>
      <section className="product-grid">
        {recommended.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </section>
    </div>
  );
}
