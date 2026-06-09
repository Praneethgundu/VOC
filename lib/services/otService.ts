import api from "./api";

export const getProcedures = async () => {
  const response = await api.get("/ot");
  return response.data;
};

export const scheduleProcedure = async (data: any) => {
  const response = await api.post("/ot", data);
  return response.data;
};

export const updateProcedureStatus = async (id: string, status: string) => {
  const response = await api.put(`/ot/${id}/status`, { status });
  return response.data;
};

export const updateProcedure = async (id: string, data: any) => {
  const response = await api.put(`/ot/${id}`, data);
  return response.data;
};

export const deleteProcedure = async (id: string) => {
  const response = await api.delete(`/ot/${id}`);
  return response.data;
};
