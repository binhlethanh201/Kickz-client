import apiClient from "./apiClient";

export const productService = {
  getAllProducts: async (params = {}) => {
    const response = await apiClient.get("/products", { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.product || response.data;
  },

  searchProducts: async (query) => {
    const response = await apiClient.get(`/products/search?q=${query}`);
    return response.data;
  },

  getProductsByPrice: async () => {
    const response = await apiClient.get("/products/by-price");
    return response.data;
  },

  getProductsByQuantity: async () => {
    const response = await apiClient.get("/products/by-quantity");
    return response.data;
  },

  getProductsByColorCount: async () => {
    const response = await apiClient.get("/products/by-color-count");
    return response.data;
  },
};
