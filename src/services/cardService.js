import apiClient from "./apiClient";

export const cardService = {
  getMyBalance: async () => {
    const res = await apiClient.get("/cards/balance");
    return res.data;
  },
  requestWithdrawal: async (data) => {
    const res = await apiClient.post("/cards/withdraw", data);
    return res.data;
  },
  getMyWithdrawals: async () => {
    const res = await apiClient.get("/cards/my-withdrawals");
    return res.data;
  },

  getAllWithdrawals: async (status = "") => {
    const res = await apiClient.get(`/cards/admin/list${status ? `?status=${status}` : ""}`);
    return res.data;
  },
  approveWithdrawal: async (id, note = "") => {
    const res = await apiClient.post(`/cards/admin/${id}/approve`, { note });
    return res.data;
  },
  rejectWithdrawal: async (id, reason = "") => {
    const res = await apiClient.post(`/cards/admin/${id}/reject`, { reason });
    return res.data;
  },
  completeWithdrawal: async (id) => {
    const res = await apiClient.post(`/cards/admin/${id}/complete`);
    return res.data;
  },
};
