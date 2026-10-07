import apiClient from "./apiClient";

export const brandService = {
  getAllBrands: async () => {
    const response = await apiClient.get("/brands");
    return response.data;
  },
};
