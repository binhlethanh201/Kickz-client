import apiClient from "./apiClient";

export const refundService = {
  createRequest: async (orderId, { reason, description }) => {
    const response = await apiClient.post(`/orders/${orderId}/refund-request`, {
      reason,
      description,
    });
    return response.data;
  },

  getMyRequests: async () => {
    const response = await apiClient.get("/orders/refunds/mine");
    return response.data;
  },

  getMyRequestDetail: async (refundId) => {
    const response = await apiClient.get(`/orders/refunds/${refundId}`);
    return response.data;
  },

  submitReturnShipping: async (refundId, { returnTrackingCode, returnCarrier }) => {
    const response = await apiClient.patch(`/orders/refunds/${refundId}/ship-back`, {
      returnTrackingCode,
      returnCarrier,
    });
    return response.data;
  },

  cancelRequest: async (refundId) => {
    const response = await apiClient.patch(`/orders/refunds/${refundId}/cancel`);
    return response.data;
  },
};
