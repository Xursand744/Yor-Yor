export interface CreateVenueBody {
  name: string;
  capacity: number;
  address: string;
  phone: string;
  basePrice?: number;
  advancePercent?: number;
}

export interface VenueResponse {
  id: string;
  name: string;
  capacity: number;
  address: string;
  phone: string;
  latitude: number | null;
  longitude: number | null;
  basePrice: number;
  advancePercent: number;
  images: VenueImageResponse[];
  reviews: VenueReviewResponse[];
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventSlotResponse {
  id: string;
  slotName: string;
}

export interface VenueImageResponse {
  id: string;
  imageUrl: string;
  createdAt: string;
}

export interface VenueReviewResponse {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
