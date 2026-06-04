import api from "./api";

export const getDashboardStats = async () => {
  const response = await api.get("/reports/dashboard");
  return response.data;
};

export const getEodReport = async (date?: string) => {
  const url = date ? `/reports/eod?date=${date}` : "/reports/eod";
  const response = await api.get(url);
  return response.data;
};
