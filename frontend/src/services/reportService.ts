import api from "./api";

export const getDashboardStats = async () => {
  const response = await api.get("/reports/dashboard");
  return response.data;
};
