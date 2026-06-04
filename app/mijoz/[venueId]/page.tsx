import { notFound } from "next/navigation";
import { VenueBookingWizard } from "@/components/mijoz/VenueBookingWizard";
import {
  getVenueById,
  listVenueIds,
  VenueNotFoundError,
} from "@/lib/services/venue";

export async function generateStaticParams() {
  const ids = await listVenueIds();
  return ids.map((venueId) => ({ venueId }));
}

type Props = {
  params: { venueId: string };
};

export default async function MijozVenuePage({ params }: Props) {
  try {
    const venue = await getVenueById(params.venueId);
    return <VenueBookingWizard venue={venue} />;
  } catch (error) {
    if (error instanceof VenueNotFoundError) {
      notFound();
    }
    throw error;
  }
}
