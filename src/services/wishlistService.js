import apiClient from "./apiClient";
import { getUserIdFromToken } from "../utils/authUtils";

export const wishlistService = {
  getWishlist: async () => {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("Chưa đăng nhập");
    const response = await apiClient.get(`/wishlists/user/${userId}`);
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await apiClient.post("/wishlists", { productId });
    window.dispatchEvent(new Event("wishlistUpdated"));
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await apiClient.delete(`/wishlists/${productId}`);
    window.dispatchEvent(new Event("wishlistUpdated"));
    return response.data;
  },

  moveToCart: async (productId, size, color, quantity = 1) => {
    const response = await apiClient.post("/wishlists/move-to-cart", {
      productId,
      size,
      color,
      quantity,
    });
    window.dispatchEvent(new Event("wishlistUpdated"));
    window.dispatchEvent(new Event("cartUpdated"));
    return response.data;
  },
};
