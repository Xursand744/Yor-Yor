"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MapPin, Search, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { formatUzs } from "@/lib/format";
import type { VenueResponse } from "@/types/venue";

gsap.registerPlugin(useGSAP);

const features = [
  {
    icon: "✨",
    title: "Premium tanlov",
    text: "Toshkentdagi eng nafis to'yxonalar — bitta platformada",
  },
  {
    icon: "📅",
    title: "Jonli kalendar",
    text: "Band va bo'sh kunlar bir ko'rinishda — double booking yo'q",
  },
  {
    icon: "💳",
    title: "Onlayn to'lov",
    text: "Avans yoki to'liq to'lov — tez va shaffof",
  },
];

type LandingPageProps = {
  venues: VenueResponse[];
};

export function LandingPage({ venues }: LandingPageProps) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");

  const filteredVenues = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return venues;
    return venues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.address.toLowerCase().includes(q)
    );
  }, [venues, query]);

  useGSAP(
    () => {
      gsap.from(".hero-reveal", {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
      });
      gsap.from(".venue-card", {
        y: 50,
        opacity: 0,
        duration: 0.85,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.35,
      });
    },
    { scope: pageRef }
  );

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-gradient-to-b from-violet-50/80 via-white to-fuchsia-50/40 text-violet-950"
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-60"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(139, 92, 246, 0.18), transparent 65%), radial-gradient(ellipse 50% 40% at 100% 20%, rgba(217, 70, 239, 0.1), transparent 50%)",
        }}
      />

      <Navbar />

      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-10 md:px-8 md:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="hero-reveal inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
            O&apos;zbekiston · To&apos;y mavzusi
          </p>
          <h1 className="hero-reveal mt-6 font-display text-4xl font-semibold leading-[1.12] md:text-5xl lg:text-6xl">
            Orzuingizdagi to&apos;y —{" "}
            <span className="bg-gradient-to-r from-violet-700 to-fuchsia-600 bg-clip-text text-transparent">
              Yor Yor
            </span>{" "}
            bilan
          </h1>
          <p className="hero-reveal mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-violet-800/75">
            Lyuks to&apos;yxonalarni qidiring, bo&apos;sh kunlarni ko&apos;ring va
            bir necha qadamda onlayn bron qiling. Zamonaviy, silliq va ishonchli.
          </p>

          <div className="hero-reveal relative mx-auto mt-10 max-w-xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-400"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="To'yxona nomi yoki manzil..."
              className="w-full rounded-2xl border border-violet-200/80 bg-white py-4 pl-12 pr-4 text-violet-950 shadow-lg shadow-violet-500/10 outline-none transition placeholder:text-violet-400/70 focus:border-violet-400 focus:ring-2 focus:ring-violet-300/40"
            />
          </div>

          <div className="hero-reveal mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/royxatdan-otish"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-4 font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110"
            >
              Bepul ro&apos;yxatdan o&apos;tish
            </Link>
            <Link
              href="/mijoz"
              className="inline-flex items-center justify-center rounded-2xl border-2 border-violet-200 bg-white/90 px-8 py-4 font-semibold text-violet-900 transition hover:border-violet-400"
            >
              Barcha joylar →
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-20 md:px-8">
        <div className="hero-reveal mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              Mashhur to&apos;yxonalar
            </h2>
            <p className="mt-1 text-sm text-violet-700/70">
              {filteredVenues.length} ta joy topildi
            </p>
          </div>
        </div>

        {filteredVenues.length === 0 ? (
          <p className="venue-card rounded-2xl border border-violet-100 bg-white/80 p-10 text-center text-violet-700/70">
            Qidiruv bo&apos;yicha natija topilmadi. Boshqa so&apos;z bilan urinib
            ko&apos;ring.
          </p>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVenues.map((v) => (
              <li key={v.id} className="venue-card">
                <Link
                  href={`/mijoz/${v.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-violet-100/90 bg-white shadow-md shadow-violet-900/5 transition hover:border-violet-300 hover:shadow-xl"
                >
                  {v.images[0] ? (
                    <img
                      src={v.images[0].imageUrl}
                      alt={`${v.name} rasmi`}
                      className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="h-44 bg-gradient-to-br from-violet-600/20 to-fuchsia-400/30" />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-lg font-semibold group-hover:text-violet-700">
                      {v.name}
                    </h3>
                    <p className="mt-2 flex items-start gap-1.5 text-sm text-violet-700/65">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      {v.address}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-sm text-violet-800/80">
                      <Star
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                        aria-hidden
                      />
                      {v.avgRating.toFixed(1)} · {v.reviewCount} fikr ·{" "}
                      {v.capacity} kishi
                    </p>
                    <p className="mt-4 text-lg font-semibold">
                      {v.basePrice > 0
                        ? formatUzs(v.basePrice)
                        : "Narx so'raladi"}
                    </p>
                    <span className="mt-auto pt-4 text-sm font-medium text-fuchsia-600 group-hover:underline">
                      Bron qilish →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="relative z-10 border-t border-violet-100/80 bg-white/60 py-16 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 className="hero-reveal text-center font-display text-2xl font-semibold md:text-3xl">
            Nima uchun Yor Yor?
          </h2>
          <ul className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((f) => (
              <li
                key={f.title}
                className="hero-reveal rounded-2xl border border-violet-100 bg-gradient-to-b from-white to-violet-50/50 p-8 text-center shadow-sm transition hover:shadow-lg"
              >
                <span className="text-4xl" aria-hidden>
                  {f.icon}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-violet-800/65">
                  {f.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="relative z-10 border-t border-violet-100 py-8 text-center text-xs text-violet-600/70">
        © {new Date().getFullYear()} Yor Yor — to&apos;yxona bron platformasi
      </footer>
    </div>
  );
}
