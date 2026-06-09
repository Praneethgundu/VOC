import api from "./api";

export const getDashboardStats = async () => {
  const response = await api.get("/reports/dashboard");
  return response.data;
};

export const getReceptionEodReport = async (date?: string) => {
  const url = date ? `/reports/eod/reception?date=${date}` : "/reports/eod/reception";
  const response = await api.get(url);
  return response.data;
};

export const getDoctorEodReport = async (date?: string, doctorName?: string) => {
  let url = "/reports/eod/doctor";
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (doctorName) params.append("doctorName", doctorName);
  if (params.toString()) url += `?${params.toString()}`;
  
  const response = await api.get(url);
  return response.data;
};

export const getPharmacyEodReport = async (date?: string) => {
  const url = date ? `/reports/eod/pharmacy?date=${date}` : "/reports/eod/pharmacy";
  const response = await api.get(url);
  return response.data;
};

export const getAdminEodReport = async (date?: string) => {
  const url = date ? `/reports/eod/admin?date=${date}` : "/reports/eod/admin";
  const response = await api.get(url);
  return response.data;
};
