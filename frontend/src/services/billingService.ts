import api from "./api";

export const getBills = async () => {
  const response = await api.get("/billing");
  return response.data;
};

export const createBill = async (data: any) => {
  const response = await api.post("/billing", data);
  return response.data;
};

export const updatePaymentStatus = async (id: string, status: string) => {
  const response = await api.put(`/billing/${id}/payment`, { status });
  return response.data;
};
