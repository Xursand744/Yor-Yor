import { MijozVenuesList } from "@/components/mijoz/MijozVenuesList";
import { listVenues } from "@/lib/services/venue";

export default async function MijozVenuesPage() {
  let venues: Awaited<ReturnType<typeof listVenues>> = [];
  try {
    venues = await listVenues();
  } catch {
    venues = [];
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-semibold text-[#2c2418] md:text-4xl">
          To&apos;yingiz uchun joy tanlang
        </h1>
        <p className="mt-3 text-[#6b5d4d]">
          Ro&apos;yxatdan o&apos;tganingizdan keyin sizga yaqin to&apos;yxonalar
          tavsiya qilinadi. Bron faqat kirgan mijozlar uchun.
        </p>
      </div>

      <MijozVenuesList venues={venues} />
    </div>
  );
}
