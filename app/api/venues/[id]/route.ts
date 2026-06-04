import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";
import {
  getVenueById,
  updateVenuePricing,
  VenueNotFoundError,
} from "@/lib/services/venue";
import { updateVenuePricingSchema } from "@/lib/validations/venue";
import type { VenueResponse } from "@/types/venue";

type RouteContext = {
  params: { id: string };
};

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse<VenueResponse | { error: string }>> {
  const { id } = context.params;

  if (!id || id.length < 10) {
    return jsonError(400, "venueId noto‘g‘ri");
  }

  try {
    const venue = await getVenueById(id);
    return NextResponse.json(venue);
  } catch (error) {
    if (error instanceof VenueNotFoundError) {
      return jsonError(404, "To‘yxona topilmadi", { code: "VENUE_NOT_FOUND" });
    }

    console.error("[GET /api/venues/[id]]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<VenueResponse | { error: string }>> {
  const { id } = context.params;

  if (!id || id.length < 10) {
    return jsonError(400, "venueId noto‘g‘ri");
  }

  const session = await getAuthSession();
  if (!session?.user) {
    return jsonError(401, "Kirish talab qilinadi");
  }

  if (session.user.role === "manager" && session.user.venueId !== id) {
    return jsonError(403, "Faqat o'z to'yxonangizni o'zgartira olasiz", {
      code: "FORBIDDEN",
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "JSON tanib bo‘lmadi");
  }

  const parsed = updateVenuePricingSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Validatsiya xatosi", {
      code: "VALIDATION_ERROR",
      details: parsed.error.flatten(),
    });
  }

  try {
    const venue = await updateVenuePricing(id, parsed.data);
    return NextResponse.json(venue);
  } catch (error) {
    if (error instanceof VenueNotFoundError) {
      return jsonError(404, "To‘yxona topilmadi", { code: "VENUE_NOT_FOUND" });
    }
    console.error("[PATCH /api/venues/[id]]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}
