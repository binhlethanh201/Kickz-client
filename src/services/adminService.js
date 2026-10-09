import apiClient from "./apiClient";

export const adminService = {
  // ================= REPORT & ANALYTICS =================
  getDashboardStats: async () => {
    const response = await apiClient.get("/admin/dashboard-stats");
    return response.data;
  },
  getOrderReport: async (type = "month", year) => {
    const response = await apiClient.get("/admin/reports/orders", { params: { type, year } });
    return response.data;
  },
  getUserReport: async (type = "month", year) => {
    const response = await apiClient.get("/admin/reports/users", { params: { type, year } });
    return response.data;
  },
  getProductReport: async (limit = 5) => {
    const response = await apiClient.get("/admin/reports/products", { params: { limit } });
    return response.data;
  },

  // ================= USERS =================
  getAllUsers: async () => {
    const response = await apiClient.get("/admin/users");
    return response.data;
  },
  getUserById: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },
  createUser: async (userData) => {
    const response = await apiClient.post("/admin/users", userData);
    return response.data;
  },
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/admin/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  // ================= ORDERS =================
  getAllOrders: async () => {
    const response = await apiClient.get("/admin/orders");
    return response.data;
  },
  getOrderById: async (id) => {
    const response = await apiClient.get(`/admin/orders/${id}`);
    return response.data;
  },
  updateOrderStatus: async (id, status) => {
    const response = await apiClient.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },
  deleteOrder: async (id) => {
    const response = await apiClient.delete(`/admin/orders/${id}`);
    return response.data;
  },
  confirmCODPayment: async (orderId) => {
    const response = await apiClient.patch(`/admin/orders/${orderId}/confirm-payment`);
    return response.data;
  },

  // ================= VOUCHERS =================
  getAllVouchers: async () => {
    const response = await apiClient.get("/admin/vouchers");
    return response.data;
  },
  getVoucherById: async (id) => {
    const response = await apiClient.get(`/admin/vouchers/${id}`);
    return response.data;
  },
  createVoucher: async (voucherData) => {
    const response = await apiClient.post("/admin/vouchers", voucherData);
    return response.data;
  },
  updateVoucher: async (id, voucherData) => {
    const response = await apiClient.put(`/admin/vouchers/${id}`, voucherData);
    return response.data;
  },
  deleteVoucher: async (id) => {
    const response = await apiClient.delete(`/admin/vouchers/${id}`);
    return response.data;
  },

  // ================= PRODUCTS =================
  getAllProducts: async () => {
    const response = await apiClient.get("/admin/products");
    return response.data;
  },
  getProductById: async (id) => {
    const response = await apiClient.get(`/admin/products/${id}`);
    return response.data;
  },
  createProduct: async (productData) => {
    const response = await apiClient.post("/admin/products", productData);
    return response.data;
  },
  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/admin/products/${id}`, productData);
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/admin/products/${id}`);
    return response.data;
  },
};
