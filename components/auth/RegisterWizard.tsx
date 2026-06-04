"use client";

import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { formatApiErrorMessage } from "@/lib/api-error";
import { apiUrl } from "@/lib/api-url";
import { getDefaultPathForRole, resolvePostAuthRedirect } from "@/lib/auth-redirect";
import { normalizeUzPhone } from "@/lib/phone";

type AccountType = "client" | "owner" | null;
type Step = "role" | "profile" | "venue" | "success";

const inputClass =
  "w-full rounded-xl border border-[#2d3b2a] bg-[#141a14] px-4 py-3 text-[#f4ede3] outline-none transition placeholder:text-[#5a6b52] focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574]";

export function RegisterWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [step, setStep] = useState<Step>("role");
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+998");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [venueName, setVenueName] = useState("");
  const [capacity, setCapacity] = useState("300");
  const [address, setAddress] = useState("");
  const [venuePhone, setVenuePhone] = useState("+998");
  const [basePrice, setBasePrice] = useState("");
  const [advancePercent, setAdvancePercent] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function selectRole(type: AccountType) {
    setAccountType(type);
    setError(null);
    setStep("profile");
  }

  async function submitRegistration(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const normalizedPhone = normalizeUzPhone(phone);
    if (password.length < 6) {
      setError("Parol kamida 6 belgi bo‘lishi kerak.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError("Parollar mos kelmaydi.");
      setLoading(false);
      return;
    }

    const payload =
      accountType === "owner"
        ? {
            accountType: "owner" as const,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: normalizedPhone,
            password,
            confirmPassword,
            venue: {
              name: venueName.trim(),
              capacity: Number(capacity),
              address: address.trim(),
              phone: normalizeUzPhone(venuePhone),
              basePrice: Number(basePrice.replace(/\s/g, "")) || 0,
              advancePercent: Number(advancePercent),
            },
          }
        : {
            accountType: "client" as const,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: normalizedPhone,
            password,
            confirmPassword,
          };

    try {
      const res = await fetch(apiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: {
        error?: string;
        redirectTo?: string;
        name?: string;
        role?: string;
      };

      try {
        data = (await res.json()) as typeof data;
      } catch {
        setLoading(false);
        setError(
          res.ok
            ? "Server javobi noto‘g‘ri formatda."
            : `Server xatosi (${res.status}). Dev server ishlayotganini tekshiring.`
        );
        return;
      }

      if (!res.ok) {
        setError(
          formatApiErrorMessage(
            data,
            res.status === 409
              ? "Bu telefon allaqachon ro‘yxatdan o‘tgan. Kirish sahifasidan kiring."
              : "Ro‘yxatdan o‘tishda xato yuz berdi."
          )
        );
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        name: data.name,
        phone: normalizedPhone,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setLoading(false);
        setError(
          "Ro‘yxatdan o‘tdingiz, lekin avtomatik kirish amalga oshmadi. Kirish sahifasidan telefon va parol bilan kiring."
        );
        return;
      }

      const freshSession = await getSession();
      const target = resolvePostAuthRedirect(
        freshSession?.user?.role ?? data.role,
        callbackUrl ?? data.redirectTo
      );

      setLoading(false);
      router.replace(target);
      router.refresh();
    } catch (err) {
      console.error("[RegisterWizard]", err);
      setLoading(false);
      setError(
        "Serverga ulanib bo‘lmadi. `npm run dev` ishlayotganini va internetni tekshiring."
      );
    }
  }

  if (step === "role") {
    return (
      <div className="space-y-4">
        <p className="text-center text-sm text-[#9aab8f]">
          Avval hisob turini tanlang — keyin shaxsiy ma’lumotlarni kiritasiz
        </p>
        <button
          type="button"
          onClick={() => selectRole("client")}
          className="group w-full rounded-2xl border border-[#2d3b2a] bg-[#1a2218] p-6 text-left transition hover:border-[#d4a574] hover:shadow-lg hover:shadow-[#d4a574]/10"
        >
          <span className="text-3xl" aria-hidden>
            💍
          </span>
          <h2 className="mt-3 font-display text-xl font-semibold text-[#f4ede3] group-hover:text-[#d4a574]">
            Mijozman
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#9aab8f]">
            To&apos;y uchun joy qidiryapman — to&apos;yxonalarni ko&apos;rib,
            bron qilaman
          </p>
        </button>

        <button
          type="button"
          onClick={() => selectRole("owner")}
          className="group w-full rounded-2xl border-2 border-[#d4a574]/40 bg-gradient-to-br from-[#1f281c] to-[#141a14] p-6 text-left transition hover:border-[#d4a574] hover:shadow-xl hover:shadow-[#d4a574]/15"
        >
          <span className="inline-block rounded-full bg-[#d4a574]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#d4a574]">
            Tadbirkor
          </span>
          <h2 className="mt-3 font-display text-xl font-semibold text-[#f4ede3]">
            To&apos;yxona egasiman
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#9aab8f]">
            O&apos;z joyimni platformaga qo&apos;shaman — bronlar, kalendar va
            to&apos;lovlarni boshqaraman
          </p>
          <ul className="mt-4 space-y-1.5 text-xs text-[#b8c4ad]">
            <li>✓ To&apos;yxona profili va narxlarni sozlash</li>
            <li>✓ Onlayn bron va avanslarni qabul qilish</li>
            <li>✓ Admin panel orqali kalendar boshqaruvi</li>
          </ul>
        </button>

        <p className="pt-4 text-center text-sm text-[#9aab8f]">
          Hisobingiz bormi?{" "}
          <Link href="/login" className="font-medium text-[#d4a574] hover:underline">
            Kirish
          </Link>
        </p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="rounded-2xl border border-[#3d8f5a]/40 bg-[#1a2218] p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#3d8f5a]/20 text-2xl">
          ✓
        </div>
        <h2 className="mt-4 font-display text-2xl text-[#f4ede3]">
          Tabriklaymiz!
        </h2>
        <p className="mt-2 text-sm text-[#9aab8f]">
          Ro&apos;yxatdan o&apos;tish muvaffaqiyatli yakunlandi. Yo&apos;naltirilmoqda…
        </p>
        <Link
          href={getDefaultPathForRole(
            accountType === "owner" ? "manager" : "client"
          )}
          className="mt-6 inline-block text-sm font-medium text-[#d4a574] hover:underline"
        >
          Davom etish →
        </Link>
      </div>
    );
  }

  const isOwner = accountType === "owner";
  const profileStep = step === "profile";
  const venueStep = step === "venue";

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        {(["role", "profile", "venue"] as const)
          .filter((s) => s !== "venue" || isOwner)
          .map((s, i, arr) => {
            const labels: Record<string, string> = {
              role: "Tur",
              profile: "Shaxsiy",
              venue: "To'yxona",
            };
            const active =
              (s === "profile" && (profileStep || venueStep)) ||
              (s === "venue" && venueStep);
            const done =
              s === "role" || (s === "profile" && venueStep);
            return (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    active || done
                      ? "bg-[#d4a574] text-[#1a1208]"
                      : "border border-[#2d3b2a] text-[#6b7d62]"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`hidden text-xs sm:inline ${
                    active ? "text-[#f4ede3]" : "text-[#6b7d62]"
                  }`}
                >
                  {labels[s]}
                </span>
                {i < arr.length - 1 && (
                  <div className="h-px flex-1 bg-[#2d3b2a]" />
                )}
              </div>
            );
          })}
      </div>

      <form
        onSubmit={(e) => {
          if (profileStep && isOwner) {
            e.preventDefault();
            if (
              !firstName.trim() ||
              !lastName.trim() ||
              phone.length < 13 ||
              password.length < 6 ||
              password !== confirmPassword
            ) {
              setError(
                "Ism, familiya, telefon va parolni to‘ldiring (parollar mos bo‘lishi kerak)."
              );
              return;
            }
            setError(null);
            setStep("venue");
            return;
          }
          void submitRegistration(e);
        }}
        className="rounded-2xl border border-[#2d3b2a] bg-[#1a2218]/90 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8"
      >
        {profileStep && (
          <>
            <h2 className="font-display text-lg text-[#f4ede3]">
              {isOwner ? "Tadbirkor ma’lumotlari" : "Shaxsiy ma’lumotlar"}
            </h2>
            <p className="mt-1 text-xs text-[#9aab8f]">
              Kirishda telefon va parolingiz ishlatiladi
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-1">
                <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
                  Ism
                </span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                  placeholder="Ali"
                  required
                  autoComplete="given-name"
                />
              </label>
              <label className="block sm:col-span-1">
                <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
                  Familiya
                </span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                  placeholder="Valiyev"
                  required
                  autoComplete="family-name"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
                  Telefon raqam
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(normalizeUzPhone(e.target.value))}
                  className={inputClass}
                  placeholder="+998901234567"
                  pattern="\+998\d{9}"
                  required
                  autoComplete="tel"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
                  Parol
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Kamida 6 belgi"
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
                  Parolni tasdiqlang
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Parolni qayta kiriting"
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
              </label>
            </div>
          </>
        )}

        {venueStep && isOwner && (
          <>
            <h2 className="font-display text-lg text-[#f4ede3]">
              To&apos;yxona profilingiz
            </h2>
            <p className="mt-1 text-xs text-[#9aab8f]">
              Mijozlar shu ma’lumotlar asosida sizni topadi va bron qiladi
            </p>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
                  To&apos;yxona nomi
                </span>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className={inputClass}
                  placeholder="Oltin Saroy"
                  required
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
                    Sig‘im (kishi)
                  </span>
                  <input
                    type="number"
                    min={50}
                    max={10000}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className={inputClass}
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
                    To&apos;yxona telefoni
                  </span>
                  <input
                    type="tel"
                    value={venuePhone}
                    onChange={(e) =>
                      setVenuePhone(normalizeUzPhone(e.target.value))
                    }
                    className={inputClass}
                    pattern="\+998\d{9}"
                    required
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
                  Manzil
                </span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                  placeholder="Toshkent sh., ..."
                  required
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
                    Bazaviy narx (so&apos;m)
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className={inputClass}
                    placeholder="45000000"
                    required
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-[#9aab8f]">
                    Avans (%)
                  </span>
                  <input
                    type="number"
                    min={10}
                    max={50}
                    value={advancePercent}
                    onChange={(e) => setAdvancePercent(e.target.value)}
                    className={inputClass}
                    required
                  />
                </label>
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-[#b84a4a]/50 bg-[#b84a4a]/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setError(null);
              if (venueStep) setStep("profile");
              else {
                setStep("role");
                setAccountType(null);
              }
            }}
            className="rounded-xl border border-[#2d3b2a] px-5 py-2.5 text-sm text-[#9aab8f] transition hover:border-[#d4a574] hover:text-[#f4ede3]"
          >
            Orqaga
          </button>
          <button
            type="submit"
            disabled={loading}
            className="min-w-[140px] flex-1 rounded-xl bg-[#d4a574] py-2.5 text-sm font-semibold text-[#1a1208] transition hover:brightness-110 disabled:opacity-50"
          >
            {loading
              ? "Ro‘yxatdan o‘tilmoqda…"
              : profileStep && isOwner
                ? "Keyingi qadam →"
                : "Ro‘yxatdan o‘tish"}
          </button>
        </div>
      </form>
    </div>
  );
}
