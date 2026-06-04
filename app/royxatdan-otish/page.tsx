import { Suspense } from "react";
import { AuthChrome } from "@/components/auth/AuthChrome";
import { RegisterWizard } from "@/components/auth/RegisterWizard";

export const metadata = {
  title: "Ro'yxatdan o'tish — To'y24",
  description: "Mijoz yoki to'yxona egasi sifatida ro'yxatdan o'ting",
};

export default function RegisterPage() {
  return (
    <AuthChrome
      title="Ro'yxatdan o'tish"
      subtitle="Avval hisob turini tanlang, keyin ism, familiya va telefon orqali ro'yxatdan o'ting"
    >
      <Suspense
        fallback={
          <div className="py-12 text-center text-sm text-[#9aab8f]">
            Yuklanmoqda…
          </div>
        }
      >
        <RegisterWizard />
      </Suspense>
    </AuthChrome>
  );
}
