export interface Patient {
  id?: number;
  opNumber: string;
  fullName: string;
  age: number;
  gender: string;
  phone: string;
  bloodGroup: string;
  address: string;
  department: string;
  doctor: string;
  fee: number;
  createdAt?: string;
}