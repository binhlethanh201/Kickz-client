import apiClient from "./apiClient";

export const cardService = {
  getMyCard: async () => {
    const response = await apiClient.get("/cards/mine");
    return response.data;
  },
};
