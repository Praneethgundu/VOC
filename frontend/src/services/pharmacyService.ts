import api from "./api";

export const getMedicines = async () => {
  const response = await api.get("/pharmacy/inventory");
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