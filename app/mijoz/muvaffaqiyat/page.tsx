import { Suspense } from "react";
import { MuvaffaqiyatView } from "@/components/mijoz/MuvaffaqiyatView";

export default function MuvaffaqiyatPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Suspense
        fallback={
          <p className="text-center text-[#6b5d4d]">Yuklanmoqda…</p>
        }
      >
        <MuvaffaqiyatView />
      </Suspense>
    </div>
  );
}
