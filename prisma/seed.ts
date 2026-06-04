import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEFAULT_SLOTS = ["abetki_toy", "kechki_toy"] as const;

import { VENUE_COORDINATES_BY_NAME } from "../lib/venue-coordinates";

const VENUES = [
  {
    name: "Oltin Saroy",
    capacity: 350,
    address: "Toshkent sh., Yunusobod tumani, Amir Temur ko'chasi 12",
    phone: "+998901112233",
    basePrice: 45_000_000,
    advancePercent: 30,
  },
  {
    name: "Billur",
    capacity: 400,
    address: "Toshkent sh., Chilonzor tumani, Qatortol ko'chasi 45",
    phone: "+998901223344",
    basePrice: 52_000_000,
    advancePercent: 30,
  },
  {
    name: "Fayz",
    capacity: 280,
    address: "Toshkent sh., Mirzo Ulug'bek tumani, Buyuk Ipak yo'li 78",
    phone: "+998901334455",
    basePrice: 38_000_000,
    advancePercent: 25,
  },
  {
    name: "Tantana",
    capacity: 320,
    address: "Toshkent sh., Sergeli tumani, Nurafshon ko'chasi 21",
    phone: "+998901445566",
    basePrice: 42_000_000,
    advancePercent: 30,
  },
  {
    name: "Odilbek",
    capacity: 500,
    address: "Toshkent sh., Yakkasaroy tumani, Shota Rustaveli 156",
    phone: "+998901556677",
    basePrice: 58_000_000,
    advancePercent: 35,
  },
  {
    name: "Istanbul",
    capacity: 450,
    address: "Toshkent sh., Shayxontohur tumani, Labzak ko'chasi 9",
    phone: "+998901667788",
    basePrice: 55_000_000,
    advancePercent: 30,
  },
  {
    name: "Decarat",
    capacity: 300,
    address: "Toshkent sh., Olmazor tumani, Talabalar ko'chasi 34",
    phone: "+998901778899",
    basePrice: 40_000_000,
    advancePercent: 30,
  },
  {
    name: "Marvarid",
    capacity: 380,
    address: "Toshkent sh., Yashnobod tumani, Aviasozlar 102",
    phone: "+998901889900",
    basePrice: 48_000_000,
    advancePercent: 30,
  },
] as const;

function venueCoords(name: string) {
  const c = VENUE_COORDINATES_BY_NAME[name];
  return c
    ? { latitude: c.latitude, longitude: c.longitude }
    : { latitude: null, longitude: null };
}

const SEED_USERS = {
  admin: {
    email: "admin@toy24.uz",
    name: "Super Admin",
    phone: "+998900000001",
    password: "Admin123!",
    role: "admin" as const,
  },
  manager: {
    email: "manager@toy24.uz",
    name: "Bekzod Rahimov",
    phone: "+998900000002",
    password: "Manager123!",
    role: "manager" as const,
  },
};

async function main() {
  for (const slotName of DEFAULT_SLOTS) {
    await prisma.eventSlot.upsert({
      where: { slotName },
      update: {},
      create: { slotName },
    });
  }

  let oltinSaroyId: string | null = null;

  for (const venueData of VENUES) {
    const existing = await prisma.venue.findFirst({
      where: { name: venueData.name },
    });

    if (existing) {
      await prisma.venue.update({
        where: { id: existing.id },
        data: {
          capacity: venueData.capacity,
          address: venueData.address,
          phone: venueData.phone,
          basePrice: venueData.basePrice,
          advancePercent: venueData.advancePercent,
          ...venueCoords(venueData.name),
        },
      });
      console.log("To'yxona yangilandi:", venueData.name);
      if (venueData.name === "Oltin Saroy") {
        oltinSaroyId = existing.id;
      }
    } else {
      const created = await prisma.venue.create({
        data: { ...venueData, ...venueCoords(venueData.name) },
      });
      console.log("To'yxona yaratildi:", venueData.name);
      if (venueData.name === "Oltin Saroy") {
        oltinSaroyId = created.id;
      }
    }
  }

  for (const [key, user] of Object.entries(SEED_USERS)) {
    const hashed = await bcrypt.hash(user.password, 10);
    const venueId = key === "manager" || key === "admin" ? oltinSaroyId : null;

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: hashed,
        phone: user.phone,
        role: user.role,
        venueId,
      },
      create: {
        name: user.name,
        email: user.email,
        password: hashed,
        phone: user.phone,
        role: user.role,
        venueId,
      },
    });
    console.log(`Foydalanuvchi: ${user.email} (${user.role})`);
  }

  console.log("EventSlot seed tugadi:", DEFAULT_SLOTS.join(", "));
  console.log(`Jami to'yxonalar: ${VENUES.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
