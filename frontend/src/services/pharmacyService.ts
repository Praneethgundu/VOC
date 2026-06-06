import api from "./api";

export const getMedicines = async () => {
  const response = await api.get("/pharmacy/inventory");
  return response.data;
};

export const getDispenseHistory = async () => {
  const response = await api.get("/pharmacy/dispense-history");
  return response.data;
};

export const addMedicine = async (medicine: any) => {
  const response = await api.post("/pharmacy/inventory", medicine);
  return response.data;
};

export const dispenseMedicine = async (data: any) => {
  const response = await api.post("/pharmacy/dispense", data);
  return response.data;
};

export const restockMedicine = async (medicineId: string, quantity: number) => {
  const response = await api.post("/pharmacy/restock", { medicineId, quantity });
  return response.data;
};

export const updateMedicine = async (id: string, data: any) => {
  const response = await api.put(`/pharmacy/inventory/${id}`, data);
  return response.data;
};

export const deleteMedicine = async (id: string) => {
  const response = await api.delete(`/pharmacy/inventory/${id}`);
  return response.data;
};