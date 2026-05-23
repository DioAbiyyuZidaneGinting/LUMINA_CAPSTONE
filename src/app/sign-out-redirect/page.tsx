"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignOutRedirect() {
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    signOut(() => {
      router.push("/sign-in");
    });
  }, [signOut, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <p className="text-sm text-zinc-500">Redirecting to sign in...</p>
    </div>
  );
}
