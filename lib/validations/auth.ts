import { z } from "zod";

const uzPhone = z
  .string()
  .regex(/^\+998\d{9}$/, "Telefon +998XXXXXXXXX formatida bo‘lishi kerak");

const passwordFields = {
  password: z
    .string()
    .min(6, "Parol kamida 6 belgi")
    .max(72, "Parol juda uzun"),
  confirmPassword: z.string(),
};

const personFields = {
  firstName: z
    .string()
    .trim()
    .min(2, "Ism kamida 2 belgi")
    .max(40, "Ism juda uzun"),
  lastName: z
    .string()
    .trim()
    .min(2, "Familiya kamida 2 belgi")
    .max(40, "Familiya juda uzun"),
  phone: uzPhone,
  ...passwordFields,
};

const venueFields = z.object({
  name: z.string().trim().min(2, "To'yxona nomi kamida 2 belgi").max(120),
  capacity: z.coerce
    .number()
    .int()
    .min(50, "Sig‘im kamida 50 kishi")
    .max(10_000),
  address: z.string().trim().min(5, "Manzil kamida 5 belgi").max(300),
  phone: uzPhone,
  basePrice: z.coerce.number().int().min(0, "Narx 0 dan katta bo‘lishi kerak"),
  advancePercent: z.coerce
    .number()
    .int()
    .min(10, "Avans 10–50% oralig‘ida")
    .max(50),
});

const registerClientBase = z.object({
  accountType: z.literal("client"),
  ...personFields,
});

const registerOwnerBase = z.object({
  accountType: z.literal("owner"),
  ...personFields,
  venue: venueFields,
});

export const registerClientSchema = registerClientBase;
export const registerOwnerSchema = registerOwnerBase;

export const registerSchema = z
  .discriminatedUnion("accountType", [registerClientBase, registerOwnerBase])
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parollar mos kelmaydi",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const resetPasswordSchema = z
  .object({
    phone: uzPhone,
    password: z
      .string()
      .min(6, "Parol kamida 6 belgi")
      .max(72, "Parol juda uzun"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parollar mos kelmaydi",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
