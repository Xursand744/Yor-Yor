import { Suspense } from "react";
import { AuthChrome } from "@/components/auth/AuthChrome";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <AuthChrome
      title="Kirish"
      subtitle="Ism, familiya, telefon va parolingiz bilan kiring. Parolni unutgan bo'lsangiz — tiklash mumkin."
    >
      <Suspense
        fallback={
          <div className="py-12 text-center text-sm text-[#9aab8f]">
            Yuklanmoqda…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthChrome>
  );
}
