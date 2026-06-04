import { z } from "zod";

export const createBookingSchema = z.object({
  venueId: z.string().cuid("venueId noto‘g‘ri formatda"),
  bookingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "bookingDate YYYY-MM-DD formatida bo‘lishi kerak"),
  slotId: z.string().cuid("slotId noto‘g‘ri formatda"),
  clientName: z.string().min(2, "clientName kamida 2 belgi").max(120),
  clientPhone: z
    .string()
    .regex(/^\+998\d{9}$/, "clientPhone +998XXXXXXXXX formatida bo‘lishi kerak"),
  status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
  paymentPlan: z.enum(["advance", "full"]).optional(),
});

export const payRemainderSchema = z.object({
  method: z.enum(["online", "cash"]).default("online"),
});

export const calendarQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});
