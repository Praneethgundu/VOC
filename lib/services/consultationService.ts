import api from "./api";

export const getConsultations =
  async () => {
    const response =
      await api.get(
        "/visits"
      );

    return response.data;
  };

export const addConsultation =
  async (data: any) => {
    const response =
      await api.post(
        "/visits",
        data
      );

    return response.data;
  };

export const updateConsultationStatus = async (id: string, status: string) => {
  const response = await api.put(`/visits/consultation?id=${id}`, { status });
  return response.data;
};

export const updateConsultation = async (id: string, data: any) => {
  const response = await api.put(`/visits/consultation?id=${id}`, data);
  return response.data;
};

export const deleteConsultation = async (id: string) => {
  const response = await api.delete(`/visits/consultation?id=${id}`);
  return response.data;
};