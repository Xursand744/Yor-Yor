import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";
import { parseBookingDate } from "@/lib/date";
import {
  createBooking,
  InvalidPaymentError,
  listActiveBookings,
  SlotNotAvailableError,
  SlotNotFoundError,
  VenueNotFoundError,
} from "@/lib/services/booking";
import { createBookingSchema } from "@/lib/validations/booking";
import type { BookingResponse } from "@/types/booking";

export async function GET(
  request: NextRequest
): Promise<NextResponse<BookingResponse[] | { error: string }>> {
  const session = await getAuthSession();

  if (!session?.user) {
    return jsonError(401, "Kirish talab qilinadi");
  }

  const { searchParams } = new URL(request.url);
  const venueId = searchParams.get("venueId") ?? undefined;

  try {
    const bookings = await listActiveBookings({
      venueId: session.user.role === "admin" ? venueId : undefined,
      managerVenueId:
        session.user.role === "manager" ? session.user.venueId : null,
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[GET /api/bookings]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<BookingResponse | { error: string }>> {
  const session = await getAuthSession();

  if (!session?.user) {
    return jsonError(401, "Buyurtma uchun ro'yxatdan o'ting va kiring", {
      code: "AUTH_REQUIRED",
    });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError(400, "JSON tanib bo‘lmadi");
  }

  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Validatsiya xatosi", {
      code: "VALIDATION_ERROR",
      details: parsed.error.flatten(),
    });
  }

  const role = session.user.role;

  if (role === "client") {
    if (!session.user.phone) {
      return jsonError(400, "Profilda telefon raqami yo'q", {
        code: "PHONE_REQUIRED",
      });
    }
  } else if (role !== "admin" && role !== "manager") {
    return jsonError(403, "Bron qilish huquqi yo'q", { code: "FORBIDDEN" });
  }

  const bookingInput =
    role === "client"
      ? {
          ...parsed.data,
          clientName: session.user.name ?? parsed.data.clientName,
          clientPhone: session.user.phone!,
        }
      : parsed.data;

  try {
    parseBookingDate(bookingInput.bookingDate);
  } catch {
    return jsonError(400, "bookingDate noto‘g‘ri yoki mavjud emas");
  }

  try {
    const booking = await createBooking(bookingInput);
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof VenueNotFoundError) {
      return jsonError(404, "To‘yxona topilmadi", { code: "VENUE_NOT_FOUND" });
    }
    if (error instanceof SlotNotFoundError) {
      return jsonError(404, "Vaqt sloti topilmadi", { code: "SLOT_NOT_FOUND" });
    }
    if (error instanceof SlotNotAvailableError) {
      return jsonError(400, "Ushbu sana va slot allaqachon band", {
        code: "SLOT_NOT_AVAILABLE",
      });
    }
    if (error instanceof InvalidPaymentError) {
      return jsonError(400, error.message, { code: "INVALID_PAYMENT" });
    }

    console.error("[POST /api/bookings]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}
