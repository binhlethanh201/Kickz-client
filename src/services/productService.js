import apiClient from "./apiClient";

export const productService = {
  getAllProducts: async () => {
    const response = await apiClient.get("/api/products");
    return response.data;
  },
  getProductById: async (id) => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data.product || response.data;
  },
};
