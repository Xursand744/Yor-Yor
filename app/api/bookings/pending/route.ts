import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";
import { listPendingBookings } from "@/lib/services/booking";
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
    const bookings = await listPendingBookings({
      venueId: session.user.role === "admin" ? venueId : undefined,
      managerVenueId:
        session.user.role === "manager" ? session.user.venueId : null,
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[GET /api/bookings/pending]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}
