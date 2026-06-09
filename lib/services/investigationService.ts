import api from "./api";

export const getInvestigations = async () => {
  const response = await api.get("/investigations");
  return response.data;
};

export const getInvestigationMaster = async () => {
  const response = await api.get("/investigation-master");
  return response.data;
};

export const addInvestigation = async (data: any) => {
  const response = await api.post("/investigations", data);
  return response.data;
};

export const updateInvestigation = async (id: string, data: any) => {
  const response = await api.put(`/investigations/${id}`, data);
  return response.data;
};

export const deleteInvestigation = async (id: string) => {
  const response = await api.delete(`/investigations/${id}`);
  return response.data;
};