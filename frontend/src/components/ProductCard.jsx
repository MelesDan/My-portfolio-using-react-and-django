import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {product.image_url ? (
          <img className="product-image" src={product.image_url} alt={product.name} />
        ) : (
          <div className="image-fallback">{product.brand}</div>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-meta">
          <span>{product.category?.name}</span>
          <span>{product.brand}</span>
        </div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-card-footer">
          <strong>ETB {product.price}</strong>
          <Link to={`/products/${product.slug}`} className="primary-link">
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
