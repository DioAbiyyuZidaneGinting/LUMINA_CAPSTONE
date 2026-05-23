"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.replace("/sign-in?redirect_url=/admin/dashboard");
      return;
    }

    const role =
      (user.publicMetadata?.role as string) ||
      (user.unsafeMetadata?.role as string);

    const isAdminEmail = user.emailAddresses.some(
      (e) => e.emailAddress === "dio13abiyyu@gmail.com"
    );
    const isAdmin = role?.toLowerCase() === "admin" || isAdminEmail;

    if (!isAdmin) {
      router.replace("/");
      return;
    }

    // Direct and clean replace to dashboard
    router.replace("/admin/dashboard");
  }, [isLoaded, user, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Mengalihkan ke Dashboard Admin...</p>
    </div>
  );
}
