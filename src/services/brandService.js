import apiClient from "./apiClient";

export const brandService = {
  getAllBrands: async () => {
    const response = await apiClient.get("/brands");
    return response.data;
  },
  createBrand: async (data) => {
    const response = await apiClient.post("/brands", data);
    return response.data;
  },
  updateBrand: async (id, data) => {
    const response = await apiClient.put(`/brands/${id}`, data);
    return response.data;
  },
  deleteBrand: async (id) => {
    const response = await apiClient.delete(`/brands/${id}`);
    return response.data;
  },
};
