import apiClient from "./apiClient";

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (firstName, lastName, email, password) => {
    const response = await apiClient.post("/auth/register", {
      firstName,
      lastName,
      email,
      password,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.patch("/auth/me", data);
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await apiClient.post("/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  },
};
