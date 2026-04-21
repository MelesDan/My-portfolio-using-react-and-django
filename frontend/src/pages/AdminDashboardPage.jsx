import { useEffect, useMemo, useState } from "react";

import { api } from "../api/client";
import { useAuth } from "../contexts/AuthContext";

const emptyProduct = {
  category: "",
  name: "",
  sku: "",
  brand: "",
  description: "",
  image_url: "",
  price: "",
  stock_qty: "",
  stock_alert_threshold: 5,
  is_featured: false,
  is_active: true,
  specifications: {},
};

export default function AdminDashboardPage() {
  const { access } = useAuth();
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [productForm, setProductForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories],
  );

  const loadAll = () =>
    Promise.all([
      api.get("/dashboard/overview/", access),
      api.get("/catalog/admin/products/", access),
      api.get("/orders/admin/orders/", access),
      api.get("/auth/admin/users/", access),
      api.get("/catalog/categories/", access),
    ]).then(([overviewData, productData, orderData, userData, categoryData]) => {
      setOverview(overviewData);
      setProducts(productData);
      setOrders(orderData);
      setUsers(userData);
      setCategories(categoryData);
    });

  useEffect(() => {
    loadAll().catch((err) => setError(err.message));
  }, [access]);

  const resetForm = () => {
    setEditingId(null);
    setProductForm(emptyProduct);
  };

  const onProductSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        stock_qty: Number(productForm.stock_qty),
        stock_alert_threshold: Number(productForm.stock_alert_threshold),
      };
      if (editingId) {
        await api.patch(`/catalog/admin/products/${editingId}/`, payload, access);
        setNotice("Product updated.");
      } else {
        await api.post("/catalog/admin/products/", payload, access);
        setNotice("Product created.");
      }
      resetForm();
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const onCategorySubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/catalog/admin/categories/", categoryForm, access);
      setCategoryForm({ name: "", description: "" });
      setNotice("Category created.");
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setProductForm({
      category: product.category.id,
      name: product.name,
      sku: product.sku,
      brand: product.brand,
      description: product.description,
      image_url: product.image_url || "",
      price: product.price,
      stock_qty: product.stock_qty,
      stock_alert_threshold: product.stock_alert_threshold || 5,
      is_featured: product.is_featured,
      is_active: product.is_active,
      specifications: product.specifications || {},
    });
  };

  const deleteProduct = async (productId) => {
    try {
      await api.delete(`/catalog/admin/products/${productId}/`, access);
      setNotice("Product removed.");
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      await api.delete(`/catalog/admin/categories/${categoryId}/`, access);
      setNotice("Category removed.");
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateOrderStatus = async (orderReference, status) => {
    try {
      await api.patch(`/orders/admin/orders/${orderReference}/`, { status }, access);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleUser = async (userId, isActive) => {
    try {
      await api.patch(`/auth/admin/users/${userId}/`, { is_active: !isActive }, access);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!overview) {
    return <div className="panel">Loading dashboard...</div>;
  }

  return (
    <div className="page-stack">
      {error && <div className="error-banner">{error}</div>}
      {notice && <div className="success-banner">{notice}</div>}

      <section className="section-head">
        <div>
          <span className="eyebrow">Administrative Portal</span>
          <h1>Inventory, orders, users, and sales reporting</h1>
        </div>
      </section>

      <section className="metrics-grid">
        <div className="metric-card">
          <span>Total sales</span>
          <strong>ETB {overview.metrics.total_sales}</strong>
        </div>
        <div className="metric-card">
          <span>Total orders</span>
          <strong>{overview.metrics.total_orders}</strong>
        </div>
        <div className="metric-card">
          <span>Active customers</span>
          <strong>{overview.metrics.active_users}</strong>
        </div>
        <div className="metric-card">
          <span>Featured products</span>
          <strong>{overview.metrics.featured_products}</strong>
        </div>
      </section>

      <section className="admin-grid">
        <article className="panel">
          <h2>{editingId ? "Update product" : "Add product"}</h2>
          <form className="form-grid" onSubmit={onProductSubmit}>
            <label>
              Category
              <select
                value={productForm.category}
                onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))}
                required
              >
                <option value="">Select category</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Product name
              <input
                value={productForm.name}
                onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label>
              SKU
              <input
                value={productForm.sku}
                onChange={(event) => setProductForm((current) => ({ ...current, sku: event.target.value }))}
                required
              />
            </label>
            <label>
              Brand
              <input
                value={productForm.brand}
                onChange={(event) => setProductForm((current) => ({ ...current, brand: event.target.value }))}
                required
              />
            </label>
            <label>
              Price
              <input
                type="number"
                value={productForm.price}
                onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))}
                required
              />
            </label>
            <label>
              Stock quantity
              <input
                type="number"
                value={productForm.stock_qty}
                onChange={(event) => setProductForm((current) => ({ ...current, stock_qty: event.target.value }))}
                required
              />
            </label>
            <label>
              Image URL
              <input
                value={productForm.image_url}
                onChange={(event) => setProductForm((current) => ({ ...current, image_url: event.target.value }))}
              />
            </label>
            <label>
              Description
              <textarea
                value={productForm.description}
                onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                required
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={productForm.is_featured}
                onChange={(event) => setProductForm((current) => ({ ...current, is_featured: event.target.checked }))}
              />
              Mark as featured
            </label>
            <div className="button-row">
              <button className="primary-button" type="submit">
                {editingId ? "Save changes" : "Create product"}
              </button>
              {editingId && (
                <button className="ghost-button" type="button" onClick={resetForm}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </article>

        <article className="panel">
          <h2>Low stock alerts</h2>
          <div className="mini-list">
            {overview.low_stock.map((item) => (
              <div key={item.id} className="summary-line">
                <span>{item.name}</span>
                <strong>{item.stock_qty} left</strong>
              </div>
            ))}
          </div>
          <h2 className="subheading">Categories</h2>
          <form className="form-grid" onSubmit={onCategorySubmit}>
            <label>
              Category name
              <input
                value={categoryForm.name}
                onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </label>
            <button className="primary-button" type="submit">
              Create category
            </button>
          </form>
          <div className="mini-list">
            {categories.map((category) => (
              <div key={category.id} className="summary-line">
                <span>{category.name}</span>
                <button className="ghost-button danger-button" onClick={() => deleteCategory(category.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
          <h2 className="subheading">Top sellers</h2>
          <div className="mini-list">
            {overview.top_products.map((item) => (
              <div key={item.id} className="summary-line">
                <span>{item.name}</span>
                <strong>{item.units_sold} sold</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel">
        <h2>Products</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category.name}</td>
                  <td>ETB {product.price}</td>
                  <td>{product.stock_qty}</td>
                  <td className="table-actions">
                    <button className="ghost-button" onClick={() => startEdit(product)}>
                      Edit
                    </button>
                    <button className="ghost-button danger-button" onClick={() => deleteProduct(product.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>Orders</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Ship to</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.order_reference}>
                  <td>{order.order_reference}</td>
                  <td>{order.user?.full_name || order.user?.email}</td>
                  <td>{order.shipping_address}</td>
                  <td>ETB {order.total_amount}</td>
                  <td>
                    <select value={order.status} onChange={(event) => updateOrderStatus(order.order_reference, event.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>Customer accounts</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button className="ghost-button" onClick={() => toggleUser(user.id, user.is_active)}>
                      {user.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
