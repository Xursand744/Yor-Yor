import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";
import {
  BookingAlreadyCancelledError,
  BookingNotFoundError,
  ForbiddenError,
  cancelBooking,
} from "@/lib/services/booking";
import type { BookingResponse } from "@/types/booking";

type RouteContext = {
  params: { id: string };
};

export async function PATCH(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<BookingResponse | { error: string }>> {
  const session = await getAuthSession();

  if (!session?.user) {
    return jsonError(401, "Kirish talab qilinadi");
  }

  const { id } = context.params;

  if (!id || id.length < 10) {
    return jsonError(400, "bookingId noto‘g‘ri");
  }

  try {
    const booking = await cancelBooking(id, {
      role: session.user.role,
      venueId: session.user.venueId,
    });
    return NextResponse.json(booking);
  } catch (error) {
    if (error instanceof BookingNotFoundError) {
      return jsonError(404, "Bron topilmadi", { code: "BOOKING_NOT_FOUND" });
    }
    if (error instanceof BookingAlreadyCancelledError) {
      return jsonError(400, "Bron allaqachon bekor qilingan", {
        code: "ALREADY_CANCELLED",
      });
    }
    if (error instanceof ForbiddenError) {
      return jsonError(403, "Ruxsat yo‘q", { code: "FORBIDDEN" });
    }

    console.error("[PATCH /api/bookings/[id]/cancel]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}
