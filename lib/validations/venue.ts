import { z } from "zod";

export const createVenueSchema = z.object({
  name: z.string().min(2, "name kamida 2 belgi").max(120),
  capacity: z.coerce.number().int().min(1, "capacity kamida 1").max(100_000),
  address: z.string().min(5, "address kamida 5 belgi").max(300),
  phone: z
    .string()
    .regex(/^\+998\d{9}$/, "phone +998XXXXXXXXX formatida bo‘lishi kerak"),
});

export const updateVenuePricingSchema = z.object({
  name: z.string().min(2, "name kamida 2 belgi").max(120),
  capacity: z.coerce.number().int().min(1, "capacity kamida 1").max(100_000),
  basePrice: z.coerce.number().int().min(0, "basePrice 0 dan katta bo'lishi kerak"),
});

export const createVenueReviewSchema = z.object({
  clientName: z.string().min(2, "Ism kamida 2 belgi").max(80),
  rating: z.coerce.number().int().min(1, "Baho 1-5 oralig'ida").max(5),
  comment: z.string().min(5, "Fikr kamida 5 belgi").max(500),
});
