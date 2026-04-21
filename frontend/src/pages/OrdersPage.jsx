import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { api } from "../api/client";
import { useAuth } from "../contexts/AuthContext";

export default function OrdersPage() {
  const { access } = useAuth();
  const [searchParams] = useSearchParams();
  const highlight = searchParams.get("highlight");
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/orders/my-orders/", access)
      .then(setOrders)
      .catch((err) => setError(err.message));
  }, [access]);

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="section-head">
          <div>
            <span className="eyebrow">Order History</span>
            <h1>Track payment and delivery progress</h1>
          </div>
        </div>
        {error && <div className="error-banner">{error}</div>}
        <div className="order-list">
          {orders.map((order) => (
            <article
              key={order.order_reference}
              className={`order-card ${highlight === order.order_reference ? "order-highlight" : ""}`}
            >
              <div className="order-header">
                <div>
                  <strong>Order #{order.order_reference}</strong>
                  <p>{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="inline-badges">
                  <span className="badge">{order.status}</span>
                  <span className="badge">{order.payment?.status || "pending payment"}</span>
                </div>
              </div>
              <div className="summary-line">
                <span>Delivery address</span>
                <strong>{order.shipping_address}</strong>
              </div>
              <div className="summary-line">
                <span>Estimated delivery</span>
                <strong>{order.estimated_delivery || "TBD"}</strong>
              </div>
              {order.items.map((item) => (
                <div key={item.id} className="summary-line">
                  <span>
                    {item.product_name} x {item.quantity}
                  </span>
                  <strong>ETB {item.price_at_sale}</strong>
                </div>
              ))}
              <div className="summary-total">
                <span>Total amount</span>
                <strong>ETB {order.total_amount}</strong>
              </div>
            </article>
          ))}
        </div>
        {!orders.length && <p>No orders yet.</p>}
      </section>
    </div>
  );
}
