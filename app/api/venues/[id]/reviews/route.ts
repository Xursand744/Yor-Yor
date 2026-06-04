import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api-response";
import { createVenueReview, listVenueReviews } from "@/lib/services/venue";
import { createVenueReviewSchema } from "@/lib/validations/venue";

type RouteContext = {
  params: { id: string };
};

export async function GET(
  _request: Request,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = context.params;
  if (!id || id.length < 10) {
    return jsonError(400, "venueId noto'g'ri");
  }

  try {
    const reviews = await listVenueReviews(id);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("[GET /api/venues/[id]/reviews]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const { id } = context.params;
  if (!id || id.length < 10) {
    return jsonError(400, "venueId noto'g'ri");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "JSON tanib bo'lmadi");
  }

  const parsed = createVenueReviewSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "Validatsiya xatosi", {
      code: "VALIDATION_ERROR",
      details: parsed.error.flatten(),
    });
  }

  try {
    const review = await createVenueReview(id, parsed.data);
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("[POST /api/venues/[id]/reviews]", error);
    return jsonError(500, "Ichki server xatosi");
  }
}
