import api from "./api";

export const getPatients =
  async () => {
    const response =
      await api.get("/patients");

    return response.data;
  };

export const addPatient =
  async (patient: any) => {
    const response =
      await api.post(
        "/patients",
        patient
      );

    return response.data;
  };

export const updatePatient =
  async (opNumber: string, data: any) => {
    const encodeOp = encodeURIComponent(opNumber);
    const response = await api.put(`/patients?opNumber=${encodeOp}`, data);
    return response.data;
  };

export const deletePatient =
  async (opNumber: string) => {
    const encodeOp = encodeURIComponent(opNumber);
    const response = await api.delete(`/patients?opNumber=${encodeOp}`);
    return response.data;
  };