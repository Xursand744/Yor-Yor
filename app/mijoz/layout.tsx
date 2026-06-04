import type { ReactNode } from "react";
import { MijozHeader } from "@/components/mijoz/MijozHeader";

export const metadata = {
  title: "Yor Yor — To'yxona bron qilish",
  description: "Bo'sh kunlarni tanlang va onlayn to'lov qiling",
};

export default function MijozLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#2c2418]">
      <MijozHeader />
      <main>{children}</main>
      <footer className="mt-16 border-t border-[#e8dcc8] py-8 text-center text-xs text-[#8a7a68]">
        To&apos;y24 · Double booking himoyasi bilan xavfsiz bron
      </footer>
    </div>
  );
}
