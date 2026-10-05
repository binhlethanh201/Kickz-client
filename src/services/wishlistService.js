import apiClient from "./apiClient";

const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || payload._id;
  } catch (e) {
    return null;
  }
};

export const wishlistService = {
  getWishlist: async () => {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("Chưa đăng nhập");
    const response = await apiClient.get(`/wishlists/user/${userId}`);
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await apiClient.post("/wishlists", { productId });
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await apiClient.delete(`/wishlists/${productId}`);
    return response.data;
  },

  moveToCart: async (productId, size, color, quantity = 1) => {
    const response = await apiClient.post("/wishlists/move-to-cart", {
      productId,
      size,
      color,
      quantity,
    });
    return response.data;
  },
};
