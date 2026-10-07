import apiClient from "./apiClient";

export const reviewService = {
  getReviewsByProduct: async (productId) => {
    const response = await apiClient.get(`/reviews/product/${productId}`);
    return response.data;
  },

  createReview: async (reviewData) => {
    const response = await apiClient.post("/reviews", reviewData);
    return response.data;
  },

  replyReview: async (reviewId, comment) => {
    const response = await apiClient.post(`/reviews/${reviewId}/reply`, { comment });
    return response.data;
  },
};
