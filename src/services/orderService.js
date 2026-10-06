import apiClient from "./apiClient";

export const orderService = {
  createOrder: async (orderData) => {
    const response = await apiClient.post("/orders", orderData);
    window.dispatchEvent(new Event("cartUpdated"));
    return response.data;
  },

  getUserOrders: async (userId) => {
    const response = await apiClient.get(`/orders/${userId}`);
    return response.data;
  },

  getOrderDetail: async (orderId) => {
    const response = await apiClient.get(`/orders/detail/${orderId}`);
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await apiClient.put(`/orders/${orderId}/cancel`);
    return response.data;
  },
};
