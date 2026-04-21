import { useDeferredValue, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../contexts/AuthContext";

export default function CatalogPage() {
  const { access, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("min_price") || "",
    maxPrice: searchParams.get("max_price") || "",
  });
  const [error, setError] = useState("");

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    api
      .get("/catalog/categories/")
      .then(setCategories)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (deferredSearch) params.set("search", deferredSearch);
    if (filters.category) params.set("category", filters.category);
    if (filters.minPrice) params.set("min_price", filters.minPrice);
    if (filters.maxPrice) params.set("max_price", filters.maxPrice);
    setSearchParams(params);

    api
      .get(`/catalog/products/?${params.toString()}`)
      .then((data) => {
        setProducts(data);
        if (isAuthenticated && access && deferredSearch) {
          api.post(
            "/recommendations/interactions/",
            { action: "search", search_query: deferredSearch },
            access,
          ).catch(() => null);
        }
      })
      .catch((err) => setError(err.message));
  }, [deferredSearch, filters, setSearchParams, isAuthenticated, access]);

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Catalog</span>
            <h1>Search, filter, and compare electronics</h1>
          </div>
        </div>
        <div className="filter-grid">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by product name, brand, or category"
          />
          <select
            value={filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            value={filters.minPrice}
            onChange={(event) => setFilters((current) => ({ ...current, minPrice: event.target.value }))}
            placeholder="Min ETB"
            type="number"
          />
          <input
            value={filters.maxPrice}
            onChange={(event) => setFilters((current) => ({ ...current, maxPrice: event.target.value }))}
            placeholder="Max ETB"
            type="number"
          />
        </div>
      </section>

      {error && <div className="error-banner">{error}</div>}

      <section className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
      {!products.length && <div className="panel">No products matched your search yet.</div>}
    </div>
  );
}
