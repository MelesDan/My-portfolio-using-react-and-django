import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { access, user } = useAuth();
  const { cart, clearLocalCart } = useCart();
  const [form, setForm] = useState({
    shipping_address: user?.address || "",
    payment_method: "telebirr",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const order = await api.post("/orders/checkout/", form, access);
      await api.post(
        `/orders/${order.order_reference}/pay/`,
        { success: true, method: form.payment_method },
        access,
      );
      clearLocalCart();
      navigate(`/orders?highlight=${order.order_reference}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Checkout</span>
            <h1>Confirm your order and simulate payment</h1>
          </div>
        </div>
        {error && <div className="error-banner">{error}</div>}
        <div className="checkout-layout">
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Shipping address
              <textarea
                value={form.shipping_address}
                onChange={(event) => setForm((current) => ({ ...current, shipping_address: event.target.value }))}
                required
              />
            </label>
            <label>
              Payment method
              <select
                value={form.payment_method}
                onChange={(event) => setForm((current) => ({ ...current, payment_method: event.target.value }))}
              >
                <option value="telebirr">Telebirr</option>
                <option value="cbe_birr">CBE Birr</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </label>
            <label>
              Order notes
              <textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Optional delivery notes"
              />
            </label>
            <button className="primary-button" type="submit" disabled={saving || !cart.items.length}>
              {saving ? "Processing..." : "Confirm and pay"}
            </button>
          </form>
          <aside className="summary-card">
            <h3>Order summary</h3>
            {cart.items.map((item) => (
              <div key={item.id} className="summary-line">
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <strong>ETB {item.subtotal}</strong>
              </div>
            ))}
            <div className="summary-total">
              <span>Total</span>
              <strong>ETB {cart.total}</strong>
            </div>
            <p>This flow simulates CHAPA sandbox verification and creates a digital receipt in the order history.</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
