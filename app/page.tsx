import { LandingPage } from "@/components/home/LandingPage";
import { listVenues } from "@/lib/services/venue";

export default async function HomePage() {
  let venues: Awaited<ReturnType<typeof listVenues>> = [];
  try {
    venues = await listVenues();
  } catch {
    venues = [];
  }
  return <LandingPage venues={venues} />;
}
