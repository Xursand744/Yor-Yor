import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { getDefaultPathForRole } from "@/lib/auth-redirect";
import { fullName, phoneToEmail } from "@/lib/phone";
import { TASHKENT_CENTER } from "@/lib/venue-coordinates";
import type { RegisterInput } from "@/lib/validations/auth";

export class PhoneAlreadyRegisteredError extends Error {
  constructor() {
    super("PHONE_ALREADY_REGISTERED");
    this.name = "PhoneAlreadyRegisteredError";
  }
}

export type RegisterResult = {
  userId: string;
  name: string;
  role: string;
  venueId: string | null;
  redirectTo: string;
};

export async function registerUser(
  input: RegisterInput
): Promise<RegisterResult> {
  const existing = await prisma.user.findUnique({
    where: { phone: input.phone },
  });
  if (existing) {
    throw new PhoneAlreadyRegisteredError();
  }

  const name = fullName(input.firstName, input.lastName);
  const email = phoneToEmail(input.phone);
  const password = await bcrypt.hash(input.password, 10);

  if (input.accountType === "client") {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: input.phone,
        password,
        role: "client",
      },
    });
    return {
      userId: user.id,
      name: user.name,
      role: user.role,
      venueId: null,
      redirectTo: getDefaultPathForRole("client"),
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const venue = await tx.venue.create({
      data: {
        name: input.venue.name,
        capacity: input.venue.capacity,
        address: input.venue.address,
        phone: input.venue.phone,
        latitude: TASHKENT_CENTER.latitude,
        longitude: TASHKENT_CENTER.longitude,
        basePrice: input.venue.basePrice,
        advancePercent: input.venue.advancePercent,
      },
    });

    const user = await tx.user.create({
      data: {
        name,
        email,
        phone: input.phone,
        password,
        role: "manager",
        venueId: venue.id,
      },
    });

    return { user, venue };
  });

  return {
    userId: result.user.id,
    name: result.user.name,
    role: result.user.role,
    venueId: result.venue.id,
    redirectTo: getDefaultPathForRole("manager"),
  };
}
