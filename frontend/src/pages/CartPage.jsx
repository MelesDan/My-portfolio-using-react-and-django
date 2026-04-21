import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, removeItem, updateQuantity } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="panel">
        <h1>Your cart is ready</h1>
        <p>Login first so we can save your items, checkout details, and purchase history.</p>
        <Link className="primary-link" to="/login">
          Login to continue
        </Link>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Shopping Cart</span>
            <h1>Review your selected items</h1>
          </div>
        </div>
        {!cart.items.length ? (
          <p>Your cart is empty.</p>
        ) : (
          <div className="cart-list">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-row">
                <div>
                  <strong>{item.product.name}</strong>
                  <p>{item.product.brand}</p>
                </div>
                <div className="cart-controls">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                  />
                  <span>ETB {item.subtotal}</span>
                  <button className="ghost-button" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="checkout-bar">
          <strong>Total: ETB {cart.total}</strong>
          <button className="primary-button" onClick={() => navigate("/checkout")} disabled={!cart.items.length}>
            Proceed to checkout
          </button>
        </div>
      </section>
    </div>
  );
}
