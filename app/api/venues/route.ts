import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-response";
import { createVenue, listVenues } from "@/lib/services/venue";
import { createVenueSchema } from "@/lib/validations/venue";
import type { VenueResponse } from "@/types/venue";

export async function GET(): Promise<NextResponse<VenueResponse[] | { error: string }>> {
  try {
    const venues = await listVenues();
    return NextResponse.json(venues);
  } catch (error) {
    console.error("[GET /api/venues]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<VenueResponse | { error: string }>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError(400, "JSON tanib bo‘lmadi");
  }

  const parsed = createVenueSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Validatsiya xatosi", {
      code: "VALIDATION_ERROR",
      details: parsed.error.flatten(),
    });
  }

  try {
    const venue = await createVenue(parsed.data);
    return NextResponse.json(venue, { status: 201 });
  } catch (error) {
    console.error("[POST /api/venues]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}
