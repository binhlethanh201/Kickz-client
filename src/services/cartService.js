import apiClient from "./apiClient";

export const cartService = {
  // Lấy giỏ hàng của user hiện tại
  getCart: async () => {
    const response = await apiClient.get("/carts");
    return response.data;
  },

  // Thêm sản phẩm vào giỏ
  addToCart: async (productId, quantity = 1, size, color) => {
    const response = await apiClient.post("/carts", {
      productId,
      quantity,
      size,
      color,
    });
    return response.data;
  },

  // Xóa sản phẩm khỏi giỏ
  removeFromCart: async (productId, size, color) => {
    // Tùy thuộc vào cách BE của bạn cấu hình API xóa (thường là DELETE hoặc PUT)
    // Giả sử dùng POST/PUT tới một endpoint xóa cụ thể hoặc DELETE với data
    const response = await apiClient.delete("/carts/item", {
      data: { productId, size, color },
    });
    return response.data;
  },
};
