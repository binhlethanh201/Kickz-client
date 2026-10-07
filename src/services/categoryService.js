import apiClient from "./apiClient";

export const categoryService = {
  getAllCategories: async () => {
    const response = await apiClient.get("/categories");
    return response.data;
  },
};
