import apiClient from "./apiClient";

export const voucherService = {
  getActiveVouchers: async () => {
    try {
      const response = await apiClient.get("/vouchers/active");
      return response.data;
    } catch (error) {
      console.error("Error fetching active vouchers:", error);
      return { vouchers: [], count: 0 };
    }
  },

  validateVoucher: async (code, orderTotal) => {
    try {
      const response = await apiClient.post("/vouchers/validate", {
        code: code.trim().toUpperCase(),
        orderTotal,
      });
      return response.data;
    } catch (error) {
      return {
        valid: false,
        message: error.response?.data?.message || "Lỗi kiểm tra voucher",
      };
    }
  },
};
