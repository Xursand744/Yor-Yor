import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-response";
import { normalizeUzPhone } from "@/lib/phone";
import {
  PhoneAlreadyRegisteredError,
  registerUser,
} from "@/lib/services/register";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError(400, "JSON tanib bo‘lmadi");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Validatsiya xatosi", {
      code: "VALIDATION_ERROR",
      details: parsed.error.flatten(),
    });
  }

  const data = {
    ...parsed.data,
    phone: normalizeUzPhone(parsed.data.phone),
    ...(parsed.data.accountType === "owner"
      ? {
          venue: {
            ...parsed.data.venue,
            phone: normalizeUzPhone(parsed.data.venue.phone),
          },
        }
      : {}),
  };

  try {
    const result = await registerUser(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof PhoneAlreadyRegisteredError) {
      return jsonError(409, "Bu telefon raqam allaqachon ro‘yxatdan o‘tgan", {
        code: "PHONE_ALREADY_REGISTERED",
      });
    }
    console.error("[POST /api/auth/register]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}
