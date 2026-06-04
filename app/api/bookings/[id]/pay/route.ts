import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-response";
import {
  BookingNotFoundError,
  InvalidPaymentError,
  payBookingRemainder,
} from "@/lib/services/booking";
import { payRemainderSchema } from "@/lib/validations/booking";
import type { BookingResponse } from "@/types/booking";

type RouteContext = {
  params: { id: string };
};

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<BookingResponse | { error: string }>> {
  const { id } = context.params;

  if (!id || id.length < 10) {
    return jsonError(400, "bookingId noto‘g‘ri");
  }

  let body: unknown = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch {
    return jsonError(400, "JSON tanib bo‘lmadi");
  }

  const parsed = payRemainderSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Validatsiya xatosi", {
      code: "VALIDATION_ERROR",
      details: parsed.error.flatten(),
    });
  }

  try {
    const booking = await payBookingRemainder(id, parsed.data.method);
    return NextResponse.json(booking);
  } catch (error) {
    if (error instanceof BookingNotFoundError) {
      return jsonError(404, "Bron topilmadi", { code: "BOOKING_NOT_FOUND" });
    }
    if (error instanceof InvalidPaymentError) {
      return jsonError(400, error.message, { code: "INVALID_PAYMENT" });
    }
    console.error("[POST /api/bookings/[id]/pay]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}
