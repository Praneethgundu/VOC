import { create } from "zustand";

interface PharmacyState {
  medicines: any[];

  addMedicine: (
    medicine: any
  ) => void;
}

export const usePharmacyStore =
  create<PharmacyState>((set) => ({
    medicines: [],

    addMedicine: (medicine) =>
      set((state) => ({
        medicines: [
          ...state.medicines,
          medicine,
        ],
      })),
  }));