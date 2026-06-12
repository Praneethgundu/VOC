import api from "./api";

export interface PatientProfile {
  opNumber: string;
  fullName: string;
  age: string;
  gender: string;
  phone: string;
  bloodGroup: string;
  address: string;
  department: string;
  doctor: string;
  complaint?: string;
  fee: string;
  createdAt: string;
}

export interface PatientRecord {
  profile: PatientProfile;
  consultations: any[];
  investigations: any[];
  bills: any[];
  procedures: any[];
  pharmacy: any[];
}

export const getPatientRecord = async (opNumber: string): Promise<PatientRecord> => {
  const encodeOp = encodeURIComponent(opNumber);
  const response = await api.get(`/patients/record?opNumber=${encodeOp}`);
  return response.data;
};
