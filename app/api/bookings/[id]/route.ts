import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-response";
import {
  BookingNotFoundError,
  getBookingById,
} from "@/lib/services/booking";
import type { BookingResponse } from "@/types/booking";

type RouteContext = {
  params: { id: string };
};

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<BookingResponse | { error: string }>> {
  const { id } = context.params;

  if (!id || id.length < 10) {
    return jsonError(400, "bookingId noto‘g‘ri");
  }

  try {
    const booking = await getBookingById(id);
    return NextResponse.json(booking);
  } catch (error) {
    if (error instanceof BookingNotFoundError) {
      return jsonError(404, "Bron topilmadi", { code: "BOOKING_NOT_FOUND" });
    }
    console.error("[GET /api/bookings/[id]]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}
