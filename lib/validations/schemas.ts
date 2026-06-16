import { z } from "zod";

// Base rules
const textRegex = /^[a-zA-Z0-9\s.,\-_()/'"&+:]*$/; // basic alphanumeric and common punctuation
const noScriptRegex = /^(?!.*<script>)(?!.*<\/script>).*$/i; // very basic anti-xss fallback

// Reusable fields
const safeString = z.string().max(500).regex(noScriptRegex, "Invalid characters detected");
const safeText = z.string().max(2000).regex(noScriptRegex, "Invalid characters detected");

export const loginSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_.-]+$/, "Invalid username format"),
  password: z.string().min(6).max(128),
  role: z.enum(["Admin", "Receptionist", "Doctor", "Pharmacist", "ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST"]),
});

export const patientSchema = z.object({
  opNumber: safeString.optional(),
  fullName: z.string().min(1).max(100).regex(/^[a-zA-Z\s.-]+$/, "Invalid name format").optional().or(z.literal("")),
  age: z.string().max(3).regex(/^[0-9]+$/, "Age must be a number").optional().or(z.literal("")),
  gender: z.enum(["Male", "Female", "Other", ""]).optional(),
  phone: z.string().max(15).regex(/^[0-9+\-\s()]*$/, "Invalid phone format").optional().or(z.literal("")),
  bloodGroup: z.string().max(5).optional().or(z.literal("")),
  department: safeString.optional().or(z.literal("")),
  doctor: safeString.optional().or(z.literal("")),
  complaint: safeText.optional().or(z.literal("")),
  address: safeText.optional().or(z.literal("")),
  status: safeString.optional().or(z.literal("")),
  date: safeString.optional().or(z.literal("")),
  time: safeString.optional().or(z.literal("")),
});

export const billingSchema = z.object({
  patientId: z.string().optional().or(z.literal("")),
  opNumber: safeString,
  items: z.any(), // JSON array
  consultationCharges: z.number().min(0).max(1000000).optional(),
  investigationCharges: z.number().min(0).max(1000000).optional(),
  medicineCharges: z.number().min(0).max(1000000).optional(),
  otCharges: z.number().min(0).max(1000000).optional(),
  total: z.number().min(0).max(10000000).optional(),
  paidAmount: z.number().min(0).max(10000000).optional(),
  paymentMode: z.enum(["Cash", "Card", "UPI", "Insurance", "Pending"]),
});

export const generatePinSchema = z.object({
  userId: z.string().min(1, "Invalid user ID format"),
});
