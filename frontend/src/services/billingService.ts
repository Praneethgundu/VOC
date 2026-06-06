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

export const getUnbilledPatients = async () => {
  const response = await api.get("/billing/unbilled");
  return response.data;
};

export const updateBill = async (id: string, data: any) => {
  const response = await api.put(`/billing/${id}`, data);
  return response.data;
};

export const deleteBill = async (id: string) => {
  const response = await api.delete(`/billing/${id}`);
  return response.data;
};
