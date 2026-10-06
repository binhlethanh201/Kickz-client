import apiClient from "./apiClient";
import { getUserIdFromToken } from "../utils/authUtils";

export const cartService = {
  getCart: async () => {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("Chưa đăng nhập");
    const response = await apiClient.get(`/carts/user/${userId}`);
    return response.data;
  },

  addToCart: async (productId, quantity = 1, size, color) => {
    const response = await apiClient.post("/carts", {
      productId,
      quantity,
      size,
      color,
    });
    window.dispatchEvent(new Event("cartUpdated"));
    return response.data;
  },

  updateQuantity: async (productId, quantity, size, color) => {
    const response = await apiClient.put(`/carts/${productId}`, {
      quantity,
      size,
      color,
    });
    window.dispatchEvent(new Event("cartUpdated"));
    return response.data;
  },

  removeFromCart: async (productId, size, color) => {
    const response = await apiClient.delete(`/carts/${productId}`, {
      data: { size, color },
    });
    window.dispatchEvent(new Event("cartUpdated"));
    return response.data;
  },
};
