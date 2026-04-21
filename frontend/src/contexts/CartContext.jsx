import { createContext, useContext, useEffect, useState } from "react";

import { api } from "../api/client";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { access, isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });

  const refreshCart = async () => {
    if (!isAuthenticated || !access) {
      setCart({ items: [], total: 0 });
      return;
    }
    const data = await api.get("/orders/cart/", access);
    setCart(data);
  };

  useEffect(() => {
    refreshCart().catch(() => setCart({ items: [], total: 0 }));
  }, [access, isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    await api.post("/orders/cart/", { product_id: productId, quantity }, access);
    await refreshCart();
  };

  const updateQuantity = async (itemId, quantity) => {
    await api.patch(`/orders/cart/${itemId}/`, { quantity }, access);
    await refreshCart();
  };

  const removeItem = async (itemId) => {
    await api.delete(`/orders/cart/${itemId}/`, access);
    await refreshCart();
  };

  const clearLocalCart = () => setCart({ items: [], total: 0 });

  return (
    <CartContext.Provider
      value={{
        cart,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearLocalCart,
        itemCount: cart.items.reduce((count, item) => count + item.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
