export interface Investigation {
  opNumber: string;
  patientName: string;
  testName: string;
  doctor: string;
  amount: number;
  status: string;
  orderedDate?: string;
}