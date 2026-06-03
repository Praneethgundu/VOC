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