"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace("/sign-in");
      return;
    }

    // Role detection
    const role =
      (user.publicMetadata?.role as string) ||
      (user.unsafeMetadata?.role as string);
    const isAdminEmail = user.emailAddresses.some(
      (e) => e.emailAddress === "dio13abiyyu@gmail.com",
    );
    const isAdmin = role?.toLowerCase() === "admin" || isAdminEmail;

    if (isAdmin) {
      // Direct redirect to dashboard as requested
      router.replace("/admin/dashboard");
    } else {
      router.replace("/");
    }
  }, [isLoaded, user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="w-10 h-10 text-slate-500 animate-spin" />
        <h1 className="text-xl font-bold text-slate-900">Verifikasi Sesi...</h1>
        <p className="text-sm text-slate-500">
          Mengarahkan Anda ke area kerja yang sesuai.
        </p>
      </div>
    </div>
  );
}
