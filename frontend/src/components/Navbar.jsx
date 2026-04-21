import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="site-header">
      <div className="brand-mark">
        <span className="brand-chip">React + Django</span>
        <button className="brand-button" onClick={() => navigate("/")}>
          ElectroMart Ethiopia
        </button>
      </div>

      <nav className="main-nav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/catalog">Products</NavLink>
        {isAuthenticated && <NavLink to="/orders">Orders</NavLink>}
        {isAdmin && <NavLink to="/admin">Admin</NavLink>}
        <NavLink to="/cart">Cart ({itemCount})</NavLink>
      </nav>

      <div className="nav-actions">
        {isAuthenticated ? (
          <>
            <span className="welcome-text">{user?.full_name || user?.email}</span>
            <button className="secondary-button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink className="ghost-link" to="/login">
              Login
            </NavLink>
            <NavLink className="primary-link" to="/register">
              Create account
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
