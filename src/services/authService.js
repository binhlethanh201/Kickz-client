import apiClient from "./apiClient";

export const authService = {
  login: async (email, password) => {
    const response = await apiClient.post("/api/auth/login", { email, password });
    return response.data;
  },

  register: async (firstName, lastName, email, password) => {
    const response = await apiClient.post("/api/auth/register", {
      firstName,
      lastName,
      email,
      password,
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  },
};
