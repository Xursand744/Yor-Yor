import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-response";
import { parseBookingDate } from "@/lib/date";
import {
  getVenueCalendar,
  resolveCalendarRange,
  VenueNotFoundError,
} from "@/lib/services/booking";
import { calendarQuerySchema } from "@/lib/validations/booking";
import type { VenueCalendarResponse } from "@/types/booking";

type RouteContext = {
  params: { id: string };
};

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<VenueCalendarResponse | { error: string }>> {
  const { id: venueId } = context.params;

  if (!venueId || venueId.length < 10) {
    return jsonError(400, "venueId noto‘g‘ri");
  }

  const { searchParams } = new URL(request.url);
  const queryParsed = calendarQuerySchema.safeParse({
    year: searchParams.get("year") ?? undefined,
    month: searchParams.get("month") ?? undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  if (!queryParsed.success) {
    return jsonError(400, "So‘rov parametrlari noto‘g‘ri", {
      code: "VALIDATION_ERROR",
      details: queryParsed.error.flatten(),
    });
  }

  const { from: fromParam, to: toParam, year, month } = queryParsed.data;

  if ((fromParam && !toParam) || (!fromParam && toParam)) {
    return jsonError(400, "from va to birgalikda berilishi kerak");
  }

  try {
    if (fromParam && toParam) {
      parseBookingDate(fromParam);
      parseBookingDate(toParam);
    }
  } catch {
    return jsonError(400, "from/to sanalari noto‘g‘ri");
  }

  try {
    const range = resolveCalendarRange({
      year,
      month,
      from: fromParam,
      to: toParam,
    });

    if (range.from > range.to) {
      return jsonError(400, "from sanasi to dan katta bo‘lishi mumkin emas");
    }

    const calendar = await getVenueCalendar(venueId, range);
    return NextResponse.json(calendar);
  } catch (error) {
    if (error instanceof VenueNotFoundError) {
      return jsonError(404, "To‘yxona topilmadi", { code: "VENUE_NOT_FOUND" });
    }

    console.error("[GET /api/venues/[id]/calendar]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}
