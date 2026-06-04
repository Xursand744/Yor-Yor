import { prisma } from "@/lib/prisma";
import { resolveVenueCoordinates } from "@/lib/venue-coordinates";
import type {
  CreateVenueBody,
  VenueImageResponse,
  VenueResponse,
  VenueReviewResponse,
} from "@/types/venue";

function isMissingTableError(error: unknown): boolean {
  if (typeof error !== "object" || !error) return false;
  if ("code" in error && (error as { code?: string }).code === "P2021") {
    return true;
  }
  if ("message" in error) {
    const msg = String((error as { message?: string }).message ?? "");
    return msg.includes("does not exist") || msg.includes("no such table");
  }
  return false;
}

export class VenueNotFoundError extends Error {
  constructor() {
    super("VENUE_NOT_FOUND");
    this.name = "VenueNotFoundError";
  }
}

function toVenueImageResponse(image: {
  id: string;
  imageUrl: string;
  createdAt: Date;
}): VenueImageResponse {
  return {
    id: image.id,
    imageUrl: image.imageUrl,
    createdAt: image.createdAt.toISOString(),
  };
}

function toVenueReviewResponse(review: {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}): VenueReviewResponse {
  return {
    id: review.id,
    clientName: review.clientName,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  };
}

function toVenueResponse(venue: {
  id: string;
  name: string;
  capacity: number;
  address: string;
  phone: string;
  latitude?: number | null;
  longitude?: number | null;
  basePrice: number;
  advancePercent: number;
  images?: {
    id: string;
    imageUrl: string;
    createdAt: Date;
  }[];
  reviews?: {
    id: string;
    clientName: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  _count?: {
    reviews?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}, reviewStats?: { avgRating?: number | null; reviewCount?: number }): VenueResponse {
  const avgRating =
    reviewStats?.avgRating ??
    (venue.reviews && venue.reviews.length
      ? venue.reviews.reduce((sum, r) => sum + r.rating, 0) / venue.reviews.length
      : 0);
  const reviewCount = reviewStats?.reviewCount ?? venue._count?.reviews ?? venue.reviews?.length ?? 0;
  const coords = resolveVenueCoordinates(
    venue.name,
    venue.latitude,
    venue.longitude
  );

  return {
    id: venue.id,
    name: venue.name,
    capacity: venue.capacity,
    address: venue.address,
    phone: venue.phone,
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    basePrice: venue.basePrice,
    advancePercent: venue.advancePercent,
    images: (venue.images ?? []).map(toVenueImageResponse),
    reviews: (venue.reviews ?? []).map(toVenueReviewResponse),
    avgRating: Number(avgRating.toFixed(1)),
    reviewCount,
    createdAt: venue.createdAt.toISOString(),
    updatedAt: venue.updatedAt.toISOString(),
  };
}

export async function createVenue(input: CreateVenueBody): Promise<VenueResponse> {
  const venue = await prisma.venue.create({
    data: {
      name: input.name,
      capacity: input.capacity,
      address: input.address,
      phone: input.phone,
      basePrice: input.basePrice ?? 0,
      advancePercent: input.advancePercent ?? 30,
    },
  });

  return toVenueResponse(venue);
}

export async function listVenueIds(): Promise<string[]> {
  try {
    const venues = await prisma.venue.findMany({ select: { id: true } });
    return venues.map((v) => v.id);
  } catch {
    return [];
  }
}

export async function listVenues(): Promise<VenueResponse[]> {
  try {
    const reviewAgg = await prisma.venueReview.groupBy({
      by: ["venueId"],
      _avg: { rating: true },
      _count: { _all: true },
    });
    const reviewMap = new Map(
      reviewAgg.map((item) => [
        item.venueId,
        { avgRating: item._avg.rating ?? 0, reviewCount: item._count._all },
      ])
    );

    const venues = await prisma.venue.findMany({
      orderBy: { name: "asc" },
      include: {
        images: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    return venues.map((venue) =>
      toVenueResponse(venue, reviewMap.get(venue.id))
    );
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }

    // Backward-compatible fallback while migration tables are missing.
    const venues = await prisma.venue.findMany({
      orderBy: { name: "asc" },
    });
    return venues.map((venue) => toVenueResponse(venue));
  }
}

export async function getVenueById(id: string): Promise<VenueResponse> {
  let venue:
    | Awaited<ReturnType<typeof prisma.venue.findUnique>>
    | null = null;
  try {
    venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { createdAt: "desc" },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }
    venue = await prisma.venue.findUnique({
      where: { id },
    });
  }

  if (!venue) {
    throw new VenueNotFoundError();
  }

  return toVenueResponse(venue);
}

export async function updateVenuePricing(
  id: string,
  input: { name: string; capacity: number; basePrice: number }
): Promise<VenueResponse> {
  try {
    const venue = await prisma.venue.update({
      where: { id },
      data: {
        name: input.name,
        capacity: input.capacity,
        basePrice: input.basePrice,
      },
    });
    return toVenueResponse(venue);
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      throw new VenueNotFoundError();
    }
    throw error;
  }
}

export async function addVenueImage(
  venueId: string,
  imageUrl: string
): Promise<VenueImageResponse> {
  const image = await prisma.venueImage.create({
    data: {
      venueId,
      imageUrl,
    },
  });
  return toVenueImageResponse(image);
}

export async function listVenueImages(venueId: string): Promise<VenueImageResponse[]> {
  try {
    const images = await prisma.venueImage.findMany({
      where: { venueId },
      orderBy: { createdAt: "desc" },
    });
    return images.map(toVenueImageResponse);
  } catch (error) {
    if (isMissingTableError(error)) {
      return [];
    }
    throw error;
  }
}

export async function deleteVenueImage(
  venueId: string,
  imageId: string
): Promise<VenueImageResponse | null> {
  const image = await prisma.venueImage.findFirst({
    where: {
      id: imageId,
      venueId,
    },
  });
  if (!image) {
    return null;
  }
  await prisma.venueImage.delete({ where: { id: image.id } });
  return toVenueImageResponse(image);
}

export async function listVenueReviews(venueId: string): Promise<VenueReviewResponse[]> {
  try {
    const reviews = await prisma.venueReview.findMany({
      where: { venueId },
      orderBy: { createdAt: "desc" },
    });
    return reviews.map(toVenueReviewResponse);
  } catch (error) {
    if (isMissingTableError(error)) {
      return [];
    }
    throw error;
  }
}

export async function createVenueReview(
  venueId: string,
  input: { clientName: string; rating: number; comment: string }
): Promise<VenueReviewResponse> {
  const review = await prisma.venueReview.create({
    data: {
      venueId,
      clientName: input.clientName,
      rating: input.rating,
      comment: input.comment,
    },
  });
  return toVenueReviewResponse(review);
}
