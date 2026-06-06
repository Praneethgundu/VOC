import api from "./api";

export const getConsultations =
  async () => {
    const response =
      await api.get(
        "/consultations"
      );

    return response.data;
  };

export const addConsultation =
  async (data: any) => {
    const response =
      await api.post(
        "/consultations",
        data
      );

    return response.data;
  };

export const updateConsultationStatus = async (id: string, status: string) => {
  const response = await api.put(`/consultations/${id}/status`, { status });
  return response.data;
};

export const updateConsultation = async (id: string, data: any) => {
  const response = await api.put(`/consultations/${id}`, data);
  return response.data;
};

export const deleteConsultation = async (id: string) => {
  const response = await api.delete(`/consultations/${id}`);
  return response.data;
};